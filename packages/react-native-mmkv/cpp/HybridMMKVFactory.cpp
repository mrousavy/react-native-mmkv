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

namespace {

  const std::string* getOptionalRootPath(const std::optional<std::string>& rootPath) {
    if (!rootPath.has_value() || rootPath->empty()) {
      return nullptr;
    }
    return &rootPath.value();
  }

} // namespace

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

bool HybridMMKVFactory::deleteMMKV(const std::string& id) {
  return MMKV::removeStorage(id);
}

bool HybridMMKVFactory::existsMMKV(const std::string& id) {
  return MMKV::checkExist(id);
}

bool HybridMMKVFactory::backupMMKV(const BackupMMKVOptions& options) {
  return MMKV::backupOneToDirectory(options.id, options.destinationDirectory, getOptionalRootPath(options.rootPath));
}

bool HybridMMKVFactory::restoreMMKV(const RestoreMMKVOptions& options) {
  return MMKV::restoreOneFromDirectory(options.id, options.sourceDirectory, getOptionalRootPath(options.rootPath));
}

double HybridMMKVFactory::backupAllMMKV(const BackupAllMMKVOptions& options) {
  size_t backupCount = MMKV::backupAllToDirectory(options.destinationDirectory, getOptionalRootPath(options.rootPath));
  return static_cast<double>(backupCount);
}

double HybridMMKVFactory::restoreAllMMKV(const RestoreAllMMKVOptions& options) {
  size_t restoreCount = MMKV::restoreAllFromDirectory(options.sourceDirectory, getOptionalRootPath(options.rootPath));
  return static_cast<double>(restoreCount);
}

} // namespace margelo::nitro::mmkv
