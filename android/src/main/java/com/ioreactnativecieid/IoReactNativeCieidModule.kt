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

class IoReactNativeCieidModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), ActivityEventListener {

  private var onActivityResultCallback: Callback? = null

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun getName() = NAME

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun isAppInstalled(packageName: String) = try {
    reactApplicationContext.packageManager.getPackageInfo(packageName, 0)
    true
  } catch (e: PackageManager.NameNotFoundException) {
    false
  }

  @ReactMethod
  fun launchCieIdForResult(
    packageName: String,
    className: String,
    url: String,
    resultCallback: Callback
  ) {
    val activity = currentActivity
    activity?.let {
      val intent = Intent().apply {
        setClassName(packageName, className)
        data = Uri.parse(url)
        action = Intent.ACTION_VIEW
      }

      try {
        activity.startActivityForResult(intent, 0)
        onActivityResultCallback = resultCallback
      } catch (anfEx: ActivityNotFoundException) {
        onActivityResultCallback = null
        ModuleException.CIEID_ACTIVITY_IS_NULL.invoke(
          resultCallback,
          Pair(anfEx.javaClass.name, anfEx.message ?: "")
        )
      }
    } ?: {
      onActivityResultCallback = null
      ModuleException.REACT_ACTIVITY_IS_NULL.invoke(resultCallback)
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
        val url: String? = data?.getStringExtra("URL")
        url.takeIf { maybeUrl -> !maybeUrl.isNullOrEmpty() }?.let { validUrl ->
          onActivityResultCallback?.invoke("URL", validUrl)
        } ?: {
          data?.getIntExtra("ERROR", 0)?.let { errorId ->
            val errorMap = mapOf(
              RedirectionError.GENERIC_ERROR.code to ModuleException.GENERIC_ERROR,
              RedirectionError.CIE_NOT_REGISTERED.code to ModuleException.CIE_NOT_REGISTERED,
              RedirectionError.AUTHENTICATION_ERROR.code to ModuleException.AUTHENTICATION_ERROR,
              RedirectionError.NO_SECURE_DEVICE.code to ModuleException.NO_SECURE_DEVICE
            )

            errorMap[errorId]?.invoke(onActivityResultCallback)
          } ?: ModuleException.CIEID_EMPTY_URL_AND_ERROR_EXTRAS.invoke(onActivityResultCallback)
        }
      }
      Activity.RESULT_CANCELED -> {
        ModuleException.CIEID_OPERATION_CANCEL.invoke(onActivityResultCallback)
      }
      else -> {
        ModuleException.CIEID_OPERATION_NOT_SUCCESSFUL.invoke(onActivityResultCallback)
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

    private enum class ModuleException(
      val ex: Exception
    ) {
      GENERIC_ERROR(Exception("GENERIC_ERROR")),
      REACT_ACTIVITY_IS_NULL(Exception("REACT_ACTIVITY_IS_NULL")),
      CIEID_ACTIVITY_IS_NULL(Exception("CIEID_ACTIVITY_IS_NULL")),
      CIE_NOT_REGISTERED(Exception("CIE_NOT_REGISTERED")),
      AUTHENTICATION_ERROR(Exception("AUTHENTICATION_ERROR")),
      NO_SECURE_DEVICE(Exception("NO_SECURE_DEVICE")),
      CIEID_EMPTY_URL_AND_ERROR_EXTRAS(Exception("CIEID_EMPTY_URL_AND_ERROR_EXTRAS")),
      CIEID_OPERATION_CANCEL(Exception("CIEID_OPERATION_CANCEL")),
      CIEID_OPERATION_NOT_SUCCESSFUL(Exception("CIEID_OPERATION_NOT_SUCCESSFUL")),
      UNKNOWN_EXCEPTION(Exception("UNKNOWN_EXCEPTION"));

      fun invoke(
        callback: Callback?, vararg args: Pair<String, String>
      ) {
        exMap(*args).let {
          callback?.invoke("ERROR", it.first, it.second)
        }
      }

      private fun exMap(vararg args: Pair<String, String>): Pair<String, WritableMap> {
        val writableMap = WritableNativeMap()
        args.forEach { writableMap.putString(it.first, it.second) }
        return Pair(this.ex.message ?: "UNKNOWN", writableMap)
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
