package com.mrousavy.mmkv;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import com.facebook.react.TurboReactPackage;

import java.util.HashMap;
import java.util.Map;

public class MmkvPackage extends TurboReactPackage {
  @Nullable
  @Override
  public NativeModule getModule(String name, @NonNull ReactApplicationContext reactContext) {
    if (name.equals(MmkvPlatformContextModule.NAME)) {
      return new MmkvPlatformContextModule(reactContext);
    } else {
      return null;
    }
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
      moduleInfos.put(
              MmkvPlatformContextModule.NAME,
              new ReactModuleInfo(
                      MmkvPlatformContextModule.NAME,
                      MmkvPlatformContextModule.NAME,
                      false, // canOverrideExistingModule
                      false, // needsEagerInit
                      true, // hasConstants
                      false, // isCxxModule
                      true // isTurboModule
              ));
      return moduleInfos;
    };
  }
}
