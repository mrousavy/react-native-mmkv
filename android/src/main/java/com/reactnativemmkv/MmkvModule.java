package com.reactnativemmkv;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = MmkvModule.NAME)
public class MmkvModule extends ReactContextBaseJavaModule {
  public static final String NAME = "MMKV";

  public MmkvModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  public boolean install() {
    try {
      System.loadLibrary("reactnativemmkv");
      JavaScriptContextHolder jsContext = getReactApplicationContext().getJavaScriptContextHolder();
      String storageDirectory = getReactApplicationContext().getFilesDir().getAbsolutePath() + "/mmkv";
      nativeInstall(jsContext.get(), storageDirectory);
      return true;
    } catch (Exception ignored) {
      return false;
    }
  }

  private static native void nativeInstall(long jsiPtr, String path);
}
