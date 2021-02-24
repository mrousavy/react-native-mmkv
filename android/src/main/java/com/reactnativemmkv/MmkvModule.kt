package com.reactnativemmkv

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule

class MmkvModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String {
      return "MMKV"
  }

  private external fun nativeInstall(jsiPtr: Long, path: String);

  companion object
  {
      init
      {
          System.loadLibrary("cpp")
      }
  }

  override fun initialize() {
    super.initialize()

    nativeInstall(
      this.reactApplicationContext.javaScriptContextHolder.get(),
      this.reactApplicationContext.filesDir.absolutePath + "/mmkv")
  }
}
