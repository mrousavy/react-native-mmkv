package com.reactnativemmkv;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class MmkvModule extends ReactContextBaseJavaModule {
  static {
    System.loadLibrary("reactnativemmkv");
  }

  private static native void nativeInstall(long jsiPtr, String path);

  public static void install(JavaScriptContextHolder jsContext, String storageDirectory) {
    nativeInstall(jsContext.get(), storageDirectory);
  }

  @NonNull
  @Override
  public String getName() {
    return "MMKV";
  }
}
