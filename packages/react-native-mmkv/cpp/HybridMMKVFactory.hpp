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
  std::shared_ptr<HybridMMKVSpec> createMMKV(const Configuration& configuration) override;
  void initializeMMKV(const std::string& rootPath) override;
};

} // namespace margelo::nitro::mmkv
