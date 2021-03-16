package com.reactnativemmkv;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class MmkvModule extends ReactContextBaseJavaModule {
  static {
    System.loadLibrary("mmkvnative");
  }

  private native void nativeInstall(long jsiPtr, String path);

  public MmkvModule(ReactApplicationContext context) {
    super(context);
  }

  @NonNull
  @Override
  public String getName() {
    return "MMKV";
  }

  @Override
  public void initialize() {
    super.initialize();

    nativeInstall(
      this.getReactApplicationContext().getJavaScriptContextHolder().get(),
      this.getReactApplicationContext().getFilesDir().getAbsolutePath() + "/mmkv"
    );
  }
}
