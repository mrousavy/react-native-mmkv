//
//  NativeMmkvModule.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 25.03.2024.
//

#include "NativeMmkvModule.h"
#include "MmkvHostObject.h"
#include "MmkvConfig.h"
#include "Logger.h"

namespace facebook::react {

NativeMmkvModule::NativeMmkvModule(std::shared_ptr<CallInvoker> jsInvoker): NativeMmkvCxxSpec(jsInvoker) {
}

bool NativeMmkvModule::initialize(jsi::Runtime &runtime, std::optional<std::string> customBasePath) {
  std::string basePath = getDefaultBasePath();
  if (customBasePath.has_value()) {
    Logger::log("RNMMKV", "Default path is %s, but user specified a custom path: %s", basePath.c_str(), customBasePath.value().c_str());
    basePath = customBasePath.value();
  }
  
  if (basePath.size() < 1) {
    throw jsi::JSError(runtime, "Path cannot be empty!");
  }
  
  Logger::log("RNMMKV", "Initializing MMKV at %s...", basePath.c_str());
  mmkv::MMKV::initializeMMKV(basePath);
  
  return true;
}

jsi::Object NativeMmkvModule::createMMKV(jsi::Runtime& runtime, MmkvConfiguration config) {
  auto instance = std::make_shared<MmkvHostObject>(config);
  return jsi::Object::createFromHostObject(runtime, instance);
}

std::string NativeMmkvModule::getDefaultBasePath() {
#ifdef __APPLE__
#if TARGET_OS_TV
    NSArray* paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
#else
    NSArray* paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
#endif
  NSString* documentPath = (NSString *) [paths firstObject];
  if ([documentPath length] > 0) {
    NSString* basePath = [documentPath stringByAppendingPathComponent:@"mmkv"];
    std::string string = [basePath UTF8String];
    return string;
  } else {
    return "";
  }
  
#else
  
#ifdef ANDROID
  
#else
  
  return "";
  
#endif
  
#endif
}

}
