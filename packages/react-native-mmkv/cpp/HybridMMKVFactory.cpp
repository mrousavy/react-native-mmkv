//
//  HybridMMKVFactory.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 21.08.2025.
//

#include "HybridMMKVFactory.hpp"
#include "HybridMMKV.hpp"

namespace margelo::nitro::mmkv {

std::shared_ptr<HybridMMKVSpec> HybridMMKVFactory::createMMKV(const Configuration& configuration) {
  return std::make_shared<HybridMMKV>(configuration);
}

}