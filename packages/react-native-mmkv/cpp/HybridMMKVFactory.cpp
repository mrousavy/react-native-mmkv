//
//  HybridMMKVFactory.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 21.08.2025.
//

#include "HybridMMKVFactory.hpp"
#include "HybridMMKV.hpp"
#include "MMKVTypes.hpp"

namespace margelo::nitro::mmkv {

std::string HybridMMKVFactory::getDefaultMMKVInstanceId() {
  return DEFAULT_MMAP_ID;
}

void HybridMMKVFactory::initializeMMKV(const std::string& rootPath) {
  Logger::log(LogLevel::Info, TAG, "Initializing MMKV with rootPath=%s", rootPath.c_str());

#ifdef NITRO_DEBUG
  MMKVLogLevel logLevel = ::mmkv::MMKVLogDebug;
#else
  MMKVLogLevel logLevel = ::mmkv::MMKVLogWarning;
#endif
  MMKV::initializeMMKV(rootPath, logLevel);
}

std::shared_ptr<HybridMMKVSpec> HybridMMKVFactory::createMMKV(const Configuration& configuration) {
  return std::make_shared<HybridMMKV>(configuration);
}

bool HybridMMKVFactory::deleteMMKV(const std::string& id) {
  return MMKV::removeStorage(id);
}

bool HybridMMKVFactory::existsMMKV(const std::string& id) {
  return MMKV::checkExist(id);
}

} // namespace margelo::nitro::mmkv
