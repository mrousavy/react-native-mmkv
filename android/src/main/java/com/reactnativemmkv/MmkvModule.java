package com.reactnativemmkv;

import com.facebook.react.bridge.JavaScriptContextHolder;

public class MmkvModule {
  static {
    System.loadLibrary("mmkvnative");
  }

  private static native void nativeInstall(long jsiPtr, String path);

  public static void install(JavaScriptContextHolder jsContext, String storageDirectory) {
    nativeInstall(jsContext.get(), storageDirectory);
  }
}
