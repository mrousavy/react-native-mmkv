package com.mrousavy.mmkv;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = MmkvModule.NAME)
public class MmkvModule extends NativeMmkvSpec {
  public static final String NAME = "Mmkv";

  public MmkvModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  @Override
  public boolean initialize(@Nullable String basePath) {
    return false;
  }

  @Override
  public WritableMap createMMKV(ReadableMap configuration) {
    return null;
  }

  static {
    System.loadLibrary("react-native-mmkv");
  }
}
