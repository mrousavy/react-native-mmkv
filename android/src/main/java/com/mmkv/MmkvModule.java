package com.mmkv;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
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

  static {
    System.loadLibrary("react-native-mmkv");
  }

  private static native double nativeMultiply(double a, double b);

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @Override
  public double multiply(double a, double b) {
    return nativeMultiply(a, b);
  }
}
