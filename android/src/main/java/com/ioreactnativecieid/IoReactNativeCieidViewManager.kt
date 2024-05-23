package com.ioreactnativecieid

import android.content.Intent
import android.graphics.Color
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class IoReactNativeCieidViewManager(private val reactContext: ReactApplicationContext) : SimpleViewManager<View>() {
  override fun getName() = "IoReactNativeCieidView"

  override fun createViewInstance(reactContext: ThemedReactContext): View {
    return View(reactContext)
  }

  @ReactProp(name = "sp_url")
  fun setSpUrl(view: View, spUrl: String) {
      val intent = Intent(reactContext, CieIDWebViewActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK
        putExtra("sp_url", spUrl)
    }
      reactContext.startActivity(intent)
  }
}
