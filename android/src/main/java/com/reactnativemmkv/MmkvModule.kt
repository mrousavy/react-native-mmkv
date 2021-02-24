package com.reactnativemmkv

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class MmkvModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String {
      return "MMKV"
  }

  external fun nativeInstall(jsiPtr: Long): Void;

  companion object
  {
      init
      {
          System.loadLibrary("cpp")
      }
  }

  override fun initialize() {
    super.initialize()
    nativeInstall(this.reactApplicationContext.javaScriptContextHolder.get())
  }
}
