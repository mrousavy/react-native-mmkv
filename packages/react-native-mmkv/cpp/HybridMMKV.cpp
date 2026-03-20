//
//  HybridMMKV.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 21.08.2025.
//

#include "HybridMMKV.hpp"
#include "MMKVTypes.hpp"
#include "MMKVValueChangedListenerRegistry.hpp"
#include "ManagedMMBuffer.hpp"
#include <NitroModules/NitroLogger.hpp>

namespace margelo::nitro::mmkv {

HybridMMKV::HybridMMKV(const Configuration& config) : HybridObject(TAG) {
  MMKVMode mmkvMode = getMMKVMode(config);
  if (config.readOnly.value_or(false)) {
    mmkvMode = mmkvMode | MMKVMode::MMKV_READ_ONLY;
  }
  bool useAes256Encryption = config.encryptionType.value_or(EncryptionType::AES_128) == EncryptionType::AES_256;
  std::string encryptionKey = config.encryptionKey.value_or("");
  std::string* encryptionKeyPtr = encryptionKey.size() > 0 ? &encryptionKey : nullptr;
  std::string rootPath = config.path.value_or("");
  std::string* rootPathPtr = rootPath.size() > 0 ? &rootPath : nullptr;
  bool compareBeforeSet = config.compareBeforeSet.value_or(false);

  MMKVConfig mmkvConfig{.mode = mmkvMode,
                        .aes256 = useAes256Encryption,
                        .cryptKey = encryptionKeyPtr,
                        .rootPath = rootPathPtr,
                        .enableCompareBeforeSet = compareBeforeSet};

  bool hasEncryptionKey = encryptionKey.size() > 0;
  Logger::log(LogLevel::Info, TAG, "Creating MMKV instance \"%s\"... (Path: %s, Encrypted: %s)", config.id.c_str(), rootPath.c_str(),
              hasEncryptionKey ? "true" : "false");

  instance = MMKV::mmkvWithID(config.id, mmkvConfig);

  if (instance == nullptr) [[unlikely]] {
    // Check if instanceId is invalid
    if (config.id.empty()) {
      throw std::runtime_error("Failed to create MMKV instance! `id` cannot be empty!");
    }

    if (useAes256Encryption) {
      // With AES-256, the max key length is 32 bytes.
      if (encryptionKey.size() > 32) [[unlikely]] {
        throw std::runtime_error("Failed to create MMKV instance! `encryptionKey` cannot be longer "
                                 "than 32 bytes with AES-256 encryption!");
      }
    } else {
      // With AES-128, the max key length is 16 bytes.
      if (encryptionKey.size() > 16) [[unlikely]] {
        throw std::runtime_error("Failed to create MMKV instance! `encryptionKey` cannot be longer "
                                 "than 16 bytes with AES-128 encryption!");
      }
    }

    // Check if path is maybe invalid
    if (rootPath.empty()) [[unlikely]] {
      throw std::runtime_error("Failed to create MMKV instance! `path` cannot be empty!");
    }

    throw std::runtime_error("Failed to create MMKV instance!");
  }
}

std::string HybridMMKV::getId() {
  return instance->mmapID();
}

double HybridMMKV::getLength() {
  return instance->count();
}

double HybridMMKV::getSize() {
  return getByteSize();
}

double HybridMMKV::getByteSize() {
  return instance->actualSize();
}

bool HybridMMKV::getIsReadOnly() {
  return instance->isReadOnly();
}

bool HybridMMKV::getIsEncrypted() {
  return instance->isEncryptionEnabled();
}

// helper: overload pattern matching for lambdas
template <class... Ts>
struct overloaded : Ts... {
  using Ts::operator()...;
};
template <class... Ts>
overloaded(Ts...) -> overloaded<Ts...>;

void HybridMMKV::set(const std::string& key, const std::variant<bool, std::shared_ptr<ArrayBuffer>, std::string, double>& value) {
  if (key.empty()) [[unlikely]] {
    throw std::runtime_error("Cannot set a value for an empty key!");
  }

  // Pattern-match each potential value in std::variant
  bool successful = std::visit(overloaded{[&](bool b) {
                                            // boolean
                                            return instance->set(b, key);
                                          },
                                          [&](const std::shared_ptr<ArrayBuffer>& buf) {
                                            // ArrayBuffer
                                            MMBuffer buffer(buf->data(), buf->size(), MMBufferCopyFlag::MMBufferNoCopy);
                                            return instance->set(std::move(buffer), key);
                                          },
                                          [&](const std::string& string) {
                                            // string
                                            return instance->set(string, key);
                                          },
                                          [&](double number) {
                                            // number
                                            return instance->set(number, key);
                                          }},
                               value);
  if (!successful) [[unlikely]] {
    throw std::runtime_error("Failed to set value for key \"" + key + "\"!");
  }

  // Notify on changed
  MMKVValueChangedListenerRegistry::notifyOnValueChanged(instance->mmapID(), key);
}

std::optional<bool> HybridMMKV::getBoolean(const std::string& key) {
  bool hasValue;
  bool result = instance->getBool(key, /* defaultValue */ false, &hasValue);
  if (hasValue) {
    return result;
  } else {
    return std::nullopt;
  }
}

std::optional<std::string> HybridMMKV::getString(const std::string& key) {
  std::string result;
  bool hasValue = instance->getString(key, result, /* inplaceModification */ true);
  if (hasValue) {
    return result;
  } else {
    return std::nullopt;
  }
}

std::optional<double> HybridMMKV::getNumber(const std::string& key) {
  bool hasValue;
  double result = instance->getDouble(key, /* defaultValue */ 0.0, &hasValue);
  if (hasValue) {
    return result;
  } else {
    return std::nullopt;
  }
}

std::optional<std::shared_ptr<ArrayBuffer>> HybridMMKV::getBuffer(const std::string& key) {
  MMBuffer result;
  bool hasValue = instance->getBytes(key, result);
  if (hasValue) {
    return std::make_shared<ManagedMMBuffer>(std::move(result));
  } else {
    return std::nullopt;
  }
}

bool HybridMMKV::contains(const std::string& key) {
  return instance->containsKey(key);
}

bool HybridMMKV::remove(const std::string& key) {
  bool wasRemoved = instance->removeValueForKey(key);
  if (wasRemoved) {
    // Notify on changed
    MMKVValueChangedListenerRegistry::notifyOnValueChanged(instance->mmapID(), key);
  }
  return wasRemoved;
}

std::vector<std::string> HybridMMKV::getAllKeys() {
  return instance->allKeys();
}

void HybridMMKV::clearAll() {
  auto keysBefore = getAllKeys();
  instance->clearAll();
  for (const auto& key : keysBefore) {
    // Notify on changed
    MMKVValueChangedListenerRegistry::notifyOnValueChanged(instance->mmapID(), key);
  }
}

void HybridMMKV::recrypt(const std::optional<std::string>& key) {
  if (key.has_value()) {
    encrypt(key.value(), std::nullopt);
  } else {
    decrypt();
  }
}

void HybridMMKV::encrypt(const std::string& key, std::optional<EncryptionType> encryptionType) {
  bool isAes256Encryption = encryptionType == EncryptionType::AES_256;
  bool successful = instance->reKey(key, isAes256Encryption);
  if (!successful) {
    throw std::runtime_error("Failed to encrypt MMKV instance!");
  }
}

void HybridMMKV::decrypt() {
  bool successful = instance->reKey("");
  if (!successful) [[unlikely]] {
    throw std::runtime_error("Failed to decrypt MMKV instance!");
  }
}

void HybridMMKV::trim() {
  instance->trim();
  instance->clearMemoryCache();
}

Listener HybridMMKV::addOnValueChangedListener(const std::function<void(const std::string& /* key */)>& onValueChanged) {
  // Add listener
  auto mmkvID = instance->mmapID();
  auto listenerID = MMKVValueChangedListenerRegistry::addListener(mmkvID, onValueChanged);

  return Listener([=]() {
    // remove()
    MMKVValueChangedListenerRegistry::removeListener(mmkvID, listenerID);
  });
}

MMKVMode HybridMMKV::getMMKVMode(const Configuration& config) {
  if (!config.mode.has_value()) {
    return ::mmkv::MMKV_SINGLE_PROCESS;
  }
  switch (config.mode.value()) {
    case Mode::SINGLE_PROCESS:
      return ::mmkv::MMKV_SINGLE_PROCESS;
    case Mode::MULTI_PROCESS:
      return ::mmkv::MMKV_MULTI_PROCESS;
  }
  throw std::runtime_error("Invalid MMKV Mode value!");
}

double HybridMMKV::importAllFrom(const std::shared_ptr<HybridMMKVSpec>& other) {
  auto hybridMMKV = std::dynamic_pointer_cast<HybridMMKV>(other);
  if (hybridMMKV == nullptr) [[unlikely]] {
    throw std::runtime_error("The given `MMKV` instance is not of type `HybridMMKV`!");
  }

  size_t importedCount = instance->importFrom(hybridMMKV->instance);
  return static_cast<double>(importedCount);
}

} // namespace margelo::nitro::mmkv
