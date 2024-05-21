//
//  NativeMmkvModule.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.2024.
//

#include "NativeMmkvModule.h"
#include "MMKV.h"
#include "MmkvHostObject.h"
#include "MmkvLogger.h"

namespace facebook::react {

NativeMmkvModule::NativeMmkvModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeMmkvCxxSpec(jsInvoker) {}

bool NativeMmkvModule::initialize(jsi::Runtime& runtime, std::string basePath) {
  if (basePath.empty()) {
    throw jsi::JSError(runtime, "Path cannot be empty!");
  }

  MmkvLogger::log("RNMMKV", "Initializing MMKV at %s...", basePath.c_str());

#ifdef DEBUG
  MMKVLogLevel logLevel = MMKVLogDebug;
#else
  MMKVLogLevel logLevel = MMKVLogWarning;
#endif

  MMKV::initializeMMKV(basePath, logLevel);

  return true;
}

NativeMmkvModule::~NativeMmkvModule() {}

jsi::Object NativeMmkvModule::createMMKV(jsi::Runtime& runtime, MMKVConfig config) {
  auto instance = std::make_shared<MmkvHostObject>(config);
  return jsi::Object::createFromHostObject(runtime, instance);
}

} // namespace facebook::react
