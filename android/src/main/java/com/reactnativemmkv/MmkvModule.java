package com.reactnativemmkv;

import com.facebook.react.bridge.ReactContext;

public class MmkvModule {
  static {
    System.loadLibrary("mmkvnative");
  }

  private static native void nativeInstall(long jsiPtr, String path);

  public static void install(ReactContext reactContext) {
    nativeInstall(reactContext.getJavaScriptContextHolder().get(), reactContext.getFilesDir().getAbsolutePath() + "/mmkv");
  }
}
