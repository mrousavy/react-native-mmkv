package com.reactnativemmkv;

import com.facebook.react.bridge.JSIModule;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;

public class MmkvModule implements JSIModule {
  static {
    System.loadLibrary("mmkvnative");
  }

  private final String storageDirectory;
  private final JavaScriptContextHolder jsContext;

  public MmkvModule(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
    this.storageDirectory = reactApplicationContext.getFilesDir().getAbsolutePath() + "/mmkv";
    this.jsContext = jsContext;
  }

  private native void nativeInstall(long jsiPtr, String path);

  @Override
  public void initialize() {
    nativeInstall(jsContext.get(), storageDirectory);
  }

  @Override
  public void onCatalystInstanceDestroy() { }
}
