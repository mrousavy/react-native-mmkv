//
//  HybridMMKV.hpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 21.08.2025.
//

#pragma once

#include "HybridMMKVSpec.hpp"
#include "Configuration.hpp"

namespace margelo::nitro::mmkv {

  class HybridMMKV final: HybridMMKVSpec {
    public:
      explicit HybridMMKV(const Configuration& configuration);
   public:
    // Properties
    double getSize() override;
    bool getIsReadOnly() override;

   public:
    // Methods
    void set(const std::string& key, const std::variant<std::string, double, bool, std::shared_ptr<ArrayBuffer>>& value) override;
    std::optional<bool> getBoolean(const std::string& key) override;
    std::optional<std::string> getString(const std::string& key) override;
    std::optional<double> getNumber(const std::string& key) override;
    std::optional<std::shared_ptr<ArrayBuffer>> getBuffer(const std::string& key) override;
    bool contains(const std::string& key) override;
    void remove(const std::string& key) override;
    std::vector<std::string> getAllKeys() override;
    void clearAll() override;
    void recrypt(const std::optional<std::string>& key) override;
    void trim() override;

  };

}
