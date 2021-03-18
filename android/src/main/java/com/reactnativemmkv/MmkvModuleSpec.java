package com.reactnativemmkv;

import com.facebook.react.bridge.JSIModuleProvider;
import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JSIModuleType;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;

public class MmkvModuleSpec implements JSIModuleSpec<MmkvModule> {
  private final ReactApplicationContext reactApplicationContext;
  private final JavaScriptContextHolder jsContext;

  public MmkvModuleSpec(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
    this.reactApplicationContext = reactApplicationContext;
    this.jsContext = jsContext;
  }

  @Override
  public JSIModuleType getJSIModuleType() {
    return JSIModuleType.TurboModuleManager;
  }

  @Override
  public JSIModuleProvider<MmkvModule> getJSIModuleProvider() {
    class MmkvModuleProvider implements JSIModuleProvider<MmkvModule> {
      @Override
      public MmkvModule get() {
        return new MmkvModule(reactApplicationContext, jsContext);
      }
    }
    return new MmkvModuleProvider();
  }
}
