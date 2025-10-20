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
  std::string path = config.path.has_value() ? config.path.value() : "";
  std::string encryptionKey = config.encryptionKey.has_value() ? config.encryptionKey.value() : "";
  bool hasEncryptionKey = encryptionKey.size() > 0;
  Logger::log(LogLevel::Info, TAG, "Creating MMKV instance \"%s\"... (Path: %s, Encrypted: %s)", config.id.c_str(), path.c_str(),
              hasEncryptionKey ? "true" : "false");

  std::string* pathPtr = path.size() > 0 ? &path : nullptr;
  std::string* encryptionKeyPtr = encryptionKey.size() > 0 ? &encryptionKey : nullptr;
  MMKVMode mode = getMMKVMode(config);
  if (config.readOnly.has_value() && config.readOnly.value()) {
    Logger::log(LogLevel::Info, TAG, "Instance is read-only!");
    mode = mode | ::mmkv::MMKV_READ_ONLY;
  }

#ifdef __APPLE__
  instance = MMKV::mmkvWithID(config.id, mode, encryptionKeyPtr, pathPtr);
#else
  instance = MMKV::mmkvWithID(config.id, DEFAULT_MMAP_SIZE, mode, encryptionKeyPtr, pathPtr);
#endif

  if (instance == nullptr) [[unlikely]] {
    // Check if instanceId is invalid
    if (config.id.empty()) [[unlikely]] {
      throw std::runtime_error("Failed to create MMKV instance! `id` cannot be empty!");
    }

    // Check if encryptionKey is invalid
    if (encryptionKey.size() > 16) [[unlikely]] {
      throw std::runtime_error("Failed to create MMKV instance! `encryptionKey` cannot be longer "
                               "than 16 bytes!");
    }

    // Check if path is maybe invalid
    if (path.empty()) [[unlikely]] {
      throw std::runtime_error("Failed to create MMKV instance! `path` cannot be empty!");
    }

    throw std::runtime_error("Failed to create MMKV instance!");
  }
}

double HybridMMKV::getSize() {
  return instance->actualSize();
}
bool HybridMMKV::getIsReadOnly() {
  return instance->isReadOnly();
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
  bool didSet = std::visit(overloaded{[&](bool b) {
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
  if (!didSet) {
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
#ifdef __APPLE__
  // iOS: Convert std::string to NSString* for MMKVCore pod compatibility
  bool hasValue = instance->getBytes(@(key.c_str()), result);
#else
  // Android/other platforms: Use std::string directly (converts to
  // std::string_view)
  bool hasValue = instance->getBytes(key, result);
#endif
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
  bool successful = false;
  if (key.has_value()) {
    // Encrypt with the given key
    successful = instance->reKey(key.value());
  } else {
    // Remove the encryption key by setting it to a blank string
    successful = instance->reKey(std::string());
  }
  if (!successful) {
    throw std::runtime_error("Failed to recrypt MMKV instance!");
  }
}
void HybridMMKV::trim() {
  instance->trim();
  instance->clearMemoryCache();
}

Listener HybridMMKV::addOnValueChangedListener(const std::function<void(const std::string& /* key */)>& onValueChanged) {
  // Add listener
  auto mmkvID = instance->mmapID();
  auto listenerID = MMKVValueChangedListenerRegistry::addListener(instance->mmapID(), onValueChanged);

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
    default:
      [[unlikely]] throw std::runtime_error("Invalid MMKV Mode value!");
  }
}

} // namespace margelo::nitro::mmkv
