package com.ioreactnativecieid

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.text.TextUtils
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.ReactApplication
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.ioreactnativecieid.databinding.ActivityCieIdwebViewBinding
import java.net.URL

class CieIDWebViewActivity : AppCompatActivity() {
  private  lateinit var binding: ActivityCieIdwebViewBinding
  val appPackageName = "it.ipzs.cieid"
  val className = "it.ipzs.cieid.BaseActivity"
  val URL = "URL"
  val ERROR = "ERROR"
  //COLLAUDO
  //val appPackageName = "it.ipzs.cieid.collaudo"

  //javascript necessario
  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    binding = ActivityCieIdwebViewBinding.inflate(layoutInflater)
    setContentView(binding.root)

    //opzioni sicurezza webview
    binding.webView.settings.apply {
      javaScriptEnabled = true
      allowContentAccess = false
      allowFileAccess = false
      allowFileAccessFromFileURLs = false
      allowUniversalAccessFromFileURLs = false
    }

    var sp_url = intent.getStringExtra("sp_url")

    //inserire url service provider
    binding.webView.loadUrl(URL(sp_url).toString())


    binding.webView.webViewClient = object : WebViewClient() {
      override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
        // The webView is about to navigate to the specified host.
        if (url.toString().contains("OpenApp")) {

          val intent = Intent()
          try {
            intent.setClassName(appPackageName, className)
            //settare la url caricata dalla webview su /OpenApp
            intent.data = Uri.parse(url)
            intent.action = Intent.ACTION_VIEW
            startActivityForResult(intent, 0)

          } catch (a : ActivityNotFoundException) {
            startActivity(
              Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://play.google.com/store/apps/details?id=$appPackageName")
              )
            )
          }
          return true

        }
        return super.shouldOverrideUrlLoading(view, url)
      }

    }

  }


  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    val eventEmitter = (application as ReactApplication).reactNativeHost.reactInstanceManager.currentReactContext
        ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
    when (resultCode) {
      RESULT_OK -> {
        val url = data?.getStringExtra(URL)
        if (!TextUtils.isEmpty(url)) {
          if (url != null) {
            binding.webView.loadUrl(url)
            eventEmitter?.emit("onCieIDAuthenticationSuccess", null)
          }
        } else {
          when (data?.getIntExtra(ERROR, 0)) {
            RedirectionError.GENERIC_ERROR.code -> {
              eventEmitter?.emit("onCieIDAuthenticationError", "GENERIC ERROR")
                    }
            RedirectionError.CIE_NOT_REGISTERED.code -> {
              eventEmitter?.emit("onCieIDAuthenticationError", "CIE NOT REGISTERED")
                    }
            RedirectionError.AUTHENTICATION_ERROR.code -> {
              eventEmitter?.emit("onCieIDAuthenticationError", "AUTHENTICATION ERROR")
            }
            RedirectionError.NO_SECURE_DEVICE.code -> {
              eventEmitter?.emit("onCieIDAuthenticationError", "DEVICE NOT SECURE FOR AUTHENTICATION")
            }
          }
        }
      }
      RESULT_CANCELED -> {
        eventEmitter?.emit("onCieIDAuthenticationCanceled", null)
      }
      else -> {
        eventEmitter?.emit("onCieIDAuthenticationError", "GENERIC ERROR")
      }
    }

  }

}
