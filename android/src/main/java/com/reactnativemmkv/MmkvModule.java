package com.reactnativemmkv;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

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
  public boolean install(@Nullable String rootDirectory) {
    try {
      Log.i(NAME, "Loading C++ library...");
      System.loadLibrary("reactnativemmkv");

      JavaScriptContextHolder jsContext = getReactApplicationContext().getJavaScriptContextHolder();
      if (rootDirectory == null) {
        rootDirectory = getReactApplicationContext().getFilesDir().getAbsolutePath() + "/mmkv";
      }
      Log.i(NAME, "Installing MMKV JSI Bindings for MMKV root directory: " + rootDirectory);
      nativeInstall(jsContext.get(), rootDirectory);
      Log.i(NAME, "Successfully installed MMKV JSI Bindings!");
      return true;
    } catch (Exception exception) {
      Log.e(NAME, "Failed to install MMKV JSI Bindings!", exception);
      return false;
    }
  }

  private static native void nativeInstall(long jsiPtr, String path);
}
