//
//  HybridMMKVFactory.hpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 21.08.2025.
//

#pragma once

#include "HybridMMKVFactorySpec.hpp"

namespace margelo::nitro::mmkv {

class HybridMMKVFactory final : public HybridMMKVFactorySpec {
public:
  HybridMMKVFactory() : HybridObject(TAG) {}

public:
  std::string getDefaultMMKVInstanceId() override;
  void initializeMMKV(const std::string& rootPath) override;

  std::shared_ptr<HybridMMKVSpec> createMMKV(const Configuration& configuration) override;
  bool deleteMMKV(const std::string& id) override;
  bool existsMMKV(const std::string& id) override;
  bool backupMMKV(const BackupMMKVOptions& options) override;
  bool restoreMMKV(const RestoreMMKVOptions& options) override;
  double backupAllMMKV(const BackupAllMMKVOptions& options) override;
  double restoreAllMMKV(const RestoreAllMMKVOptions& options) override;
};

} // namespace margelo::nitro::mmkv
