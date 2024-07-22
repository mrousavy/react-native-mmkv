package com.mrousavy.mmkv;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;

public class MmkvPlatformContextModule extends NativeMmkvPlatformContextSpec {
    private final ReactApplicationContext context;

    public MmkvPlatformContextModule(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;
    }

    @Override
    public String getBaseDirectory() {
        return context.getFilesDir().getAbsolutePath() + "/mmkv";
    }

    @Nullable
    @Override
    public String getAppGroupDirectory() {
        // AppGroups do not exist on Android. It's iOS only.
        return null;
    }
}
