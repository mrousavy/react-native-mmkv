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

  MMKVLogLevel logLevel = static_cast<MMKVLogLevel>(MMKV_LOG_LEVEL);
  MMKV::initializeMMKV(rootPath, logLevel);
}

std::shared_ptr<HybridMMKVSpec> HybridMMKVFactory::createMMKV(const Configuration& configuration) {
  return std::make_shared<HybridMMKV>(configuration);
}

bool HybridMMKVFactory::deleteMMKV(const std::string& id, const std::optional<std::string>& path) {
  std::string rootPath = path.value_or("");
  std::string* rootPathPtr = rootPath.empty() ? nullptr : &rootPath;
  return MMKV::removeStorage(id, rootPathPtr);
}

bool HybridMMKVFactory::existsMMKV(const std::string& id, const std::optional<std::string>& path) {
  std::string rootPath = path.value_or("");
  std::string* rootPathPtr = rootPath.empty() ? nullptr : &rootPath;
  return MMKV::checkExist(id, rootPathPtr);
}

} // namespace margelo::nitro::mmkv
