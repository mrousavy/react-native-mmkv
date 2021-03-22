package com.reactnativemmkv;

import com.facebook.react.bridge.JSIModulePackage;
import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import java.util.Collections;
import java.util.List;

public class MmkvModulePackage implements JSIModulePackage {
  @Override
  public List<JSIModuleSpec> getJSIModules(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
    MmkvModule.install(jsContext, reactApplicationContext.getFilesDir().getAbsolutePath() + "/mmkv");
    return Collections.emptyList();
  }
}
