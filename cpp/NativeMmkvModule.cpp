//
//  NativeMmkvModule.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.2024.
//

#include "NativeMmkvModule.h"
#include "Logger.h"
#include "MmkvHostObject.h"
#include "MmkvPlatformContext.h"
#include <MMKVCore/MMKV.h>

namespace facebook::react {

NativeMmkvModule::NativeMmkvModule(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeMmkvCxxSpec(jsInvoker) {}

bool NativeMmkvModule::initialize(jsi::Runtime& runtime,
                                  std::optional<std::string> customBasePath) {
  std::string basePath = MmkvPlatformContext::getDefaultBasePath();
  if (customBasePath.has_value()) {
    Logger::log("RNMMKV", "Default path is %s, but user specified a custom path: %s",
                basePath.c_str(), customBasePath.value().c_str());
    basePath = customBasePath.value();
  }

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
