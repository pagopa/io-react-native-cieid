package com.ioreactnativecieid

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import org.json.JSONObject
import java.security.MessageDigest

typealias ME = IoReactNativeCieidModule.Companion.ModuleException

class IoReactNativeCieidModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), ActivityEventListener {

  private var onActivityResultCallback: Callback? = null

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun getName() = NAME

  private fun isSignatureValid(packageName: String, signature: String): Boolean {
    val pm = reactApplicationContext.packageManager
    val packageInfo = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
      pm.getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES)
    } else {
      @Suppress("DEPRECATION")
      pm.getPackageInfo(packageName, PackageManager.GET_SIGNATURES)
    }

    val signatures = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
      packageInfo.signingInfo.apkContentsSigners
    } else {
      @Suppress("DEPRECATION")
      packageInfo.signatures
    }

    val sha256List = signatures.map {
      val digest = MessageDigest.getInstance("SHA-256")
      digest.update(it.toByteArray())
      // Converts bytes in hexadecimal uppercase string
      digest.digest().joinToString(":") { byte ->
        "%02x".format(byte).uppercase()
      }
    }
    // Returns the first sha256 signature
    return sha256List.contains(signature)
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun isAppInstalled(packageName: String, signature: String): Boolean = try {
    reactApplicationContext.packageManager.getPackageInfo(packageName, 0)
    if(!isSignatureValid(packageName, signature)) {
      throw PackageManager.NameNotFoundException()
    }
    true
  } catch (e: PackageManager.NameNotFoundException) {
    false
  }

  @ReactMethod
  fun launchCieIdForResult(
    packageName: String,
    className: String,
    signature: String,
    url: String,
    resultCallback: Callback
  ) {
    currentActivity?.let { activity ->
      val intent = Intent().apply {
        setClassName(packageName, className)
        data = Uri.parse(url)
        action = Intent.ACTION_VIEW
      }

      try {
        if(!isSignatureValid(packageName, signature)) {
          onActivityResultCallback = null
          ME.CIEID_SIGNATURE_MISMATCH.invoke(resultCallback)
          return;
        }
        activity.startActivityForResult(intent, 0)
        onActivityResultCallback = resultCallback
      } catch (anfEx: ActivityNotFoundException) {
        onActivityResultCallback = null
        ME.CIEID_ACTIVITY_IS_NULL.invoke(
          resultCallback,
          "Exception" to anfEx.javaClass.name,
          "Message" to (anfEx.message ?: "")
        )
      }
    } ?: run {
      onActivityResultCallback = null
      ME.REACT_ACTIVITY_IS_NULL.invoke(resultCallback)
    }
  }

  override fun onActivityResult(
    activity: Activity?,
    requestCode: Int,
    resultCode: Int,
    data: Intent?
  ) {
    when (resultCode) {
      Activity.RESULT_OK -> {
        val url = data?.getStringExtra(ReturnType.URL.toString())
        if (!url.isNullOrEmpty()) {
          onActivityResultCallback?.invoke(WritableNativeMap().apply {
            putString("id", ReturnType.URL.toString())
            putString("url", url)
          })
        } else {
          val errorId = data?.getIntExtra(ReturnType.ERROR.toString(), 0)
          val errorMap = mapOf(
            RedirectionError.GENERIC_ERROR.code to ME.GENERIC_ERROR,
            RedirectionError.CIE_NOT_REGISTERED.code to ME.CIE_NOT_REGISTERED,
            RedirectionError.AUTHENTICATION_ERROR.code to ME.AUTHENTICATION_ERROR,
            RedirectionError.NO_SECURE_DEVICE.code to ME.NO_SECURE_DEVICE
          )
          errorMap[errorId]?.invoke(onActivityResultCallback)
            ?: ME.CIEID_EMPTY_URL_AND_ERROR_EXTRAS.invoke(onActivityResultCallback)
        }
      }

      Activity.RESULT_CANCELED -> {
        ME.CIEID_OPERATION_CANCEL.invoke(onActivityResultCallback)
      }

      else -> {
        ME.CIEID_OPERATION_NOT_SUCCESSFUL.invoke(onActivityResultCallback)
      }
    }
    onActivityResultCallback = null
  }

  override fun onNewIntent(intent: Intent?) {
    // We do not expect add any data handling here,
    // but we add a log in case we need to debug some edge cases.
    Log.d(name, "onNewIntent has been called")
  }

  companion object {
    const val NAME = "IoReactNativeCieidModule"

    enum class ReturnType {
      ERROR,
      URL
    }

    enum class ModuleException(private val ex: Exception) {
      GENERIC_ERROR(Exception("GENERIC_ERROR")),
      REACT_ACTIVITY_IS_NULL(Exception("REACT_ACTIVITY_IS_NULL")),
      CIEID_ACTIVITY_IS_NULL(Exception("CIEID_ACTIVITY_IS_NULL")),
      CIEID_SIGNATURE_MISMATCH(Exception("CIEID_SIGNATURE_MISMATCH")),
      CIE_NOT_REGISTERED(Exception("CIE_NOT_REGISTERED")),
      AUTHENTICATION_ERROR(Exception("AUTHENTICATION_ERROR")),
      NO_SECURE_DEVICE(Exception("NO_SECURE_DEVICE")),
      CIEID_EMPTY_URL_AND_ERROR_EXTRAS(Exception("CIEID_EMPTY_URL_AND_ERROR_EXTRAS")),
      CIEID_OPERATION_CANCEL(Exception("CIEID_OPERATION_CANCEL")),
      CIEID_OPERATION_NOT_SUCCESSFUL(Exception("CIEID_OPERATION_NOT_SUCCESSFUL")),
      UNKNOWN_EXCEPTION(Exception("UNKNOWN_EXCEPTION"));

      fun invoke(callback: Callback?, vararg args: Pair<String, String>) {
        val writableMap = WritableNativeMap().apply {
          args.forEach { putString(it.first, it.second) }
        }
        val returnObject = WritableNativeMap().apply {
          putString("id", ReturnType.ERROR.toString())
          putString("code", ex.message ?: "UNKNOWN")
          putMap("userInfo", writableMap)
        }
        callback?.invoke(returnObject)
      }
    }
  }
}

// Taken from
// https://github.com/italia/cieid-android-sdk/blob/master/app/src/main/java/it/ipzs/cieidsdk/sampleapp/redirection/RedirectionError.kt
enum class RedirectionError(val code: Int) {
  GENERIC_ERROR(0),
  CIE_NOT_REGISTERED(1),
  AUTHENTICATION_ERROR(2),
  NO_SECURE_DEVICE(3)
}
