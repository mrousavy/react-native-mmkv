//
//  react-native-mmkv.h
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.2024.
//

#pragma once

#if __has_include(<React-Codegen/RNMmkvSpecJSI.h>)
// CocoaPods include (iOS)
#include <React-Codegen/RNMmkvSpecJSI.h>
#elif __has_include("RNMmkvSpecJSI.h")
// CMake include on Android
#include "RNMmkvSpecJSI.h"
#else
#error Cannot find react-native-mmkv spec! Try cleaning your cache and re-running CodeGen!
#endif

#include "MmkvHostObject.h"

namespace facebook::react {

class NativeMmkvModule : public NativeMmkvCxxSpec<NativeMmkvModule> {
public:
  NativeMmkvModule(std::shared_ptr<CallInvoker> jsInvoker);
  
  jsi::Object createMMKV(jsi::Runtime& runtime, jsi::Object config) {
    std::string instanceId = bridging::fromJs<std::string>(runtime, config.getProperty(runtime, "id"), jsInvoker_);
    std::string path = bridging::fromJs<std::string>(runtime, config.getProperty(runtime, "path"), jsInvoker_);
    std::string encryptionKey = bridging::fromJs<std::string>(runtime, config.getProperty(runtime, "encryptionKey"), jsInvoker_);

    auto instance = std::make_shared<MmkvHostObject>(instanceId, path, encryptionKey);
    return jsi::Object::createFromHostObject(runtime, instance);
  }
};

}
