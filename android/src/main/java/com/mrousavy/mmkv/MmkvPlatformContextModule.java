package com.mrousavy.mmkv;

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
}
