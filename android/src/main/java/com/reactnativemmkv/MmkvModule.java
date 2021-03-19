package com.reactnativemmkv;

import com.facebook.react.bridge.ReactApplicationContext;

public class MmkvModule {
  static {
    System.loadLibrary("mmkvnative");
  }

  private static native void nativeInstall(long jsiPtr, String path);

  public static void install(ReactApplicationContext reactApplicationContext) {
    nativeInstall(reactApplicationContext.getJavaScriptContextHolder().get(),
      reactApplicationContext.getFilesDir().getAbsolutePath() + "/mmkv");
  }
}
