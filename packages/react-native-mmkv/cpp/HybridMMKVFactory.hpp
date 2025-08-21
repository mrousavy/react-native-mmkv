//
//  HybridMMKVFactory.hpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 21.08.2025.
//

#pragma once

#include "HybridMMKVFactorySpec.hpp"

namespace margelo::nitro::mmkv {

  class HybridMMKVFactory final: HybridMMKVFactorySpec {
    public:
      std::shared_ptr<HybridMMKVSpec> createMMKV(const Configuration& configuration) override;
  };

}
