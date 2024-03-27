//
//  NativeMmkvModule.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.2024.
//

#include "NativeMmkvModule.h"
#include "Logger.h"
#include "MmkvHostObject.h"
#include "MMKV.h"

namespace facebook::react {

NativeMmkvModule::NativeMmkvModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeMmkvCxxSpec(jsInvoker) {}

bool NativeMmkvModule::initialize(jsi::Runtime& runtime,
                                  std::string basePath) {
  if (basePath.size() < 1) {
    throw jsi::JSError(runtime, "Path cannot be empty!");
  }

  Logger::log("RNMMKV", "Initializing MMKV at %s...", basePath.c_str());
  
  MMKV::initializeMMKV(basePath);

  return true;
}

NativeMmkvModule::~NativeMmkvModule() {
  Logger::log("RNMMKV", "Closing all MMKV instances...");
  MMKV::onExit();
}

jsi::Object NativeMmkvModule::createMMKV(jsi::Runtime& runtime, MMKVConfig config) {
  auto instance = std::make_shared<MmkvHostObject>(config);
  return jsi::Object::createFromHostObject(runtime, instance);
}

} // namespace facebook::react
