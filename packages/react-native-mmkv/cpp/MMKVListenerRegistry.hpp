//
//  MMKVListenerRegistry.hpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 21.08.2025.
//

#pragma once

#include "MMKVTypes.hpp"
#include <atomic>
#include <functional>
#include <mutex>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace margelo::nitro::mmkv {

using ListenerID = size_t;
using MMKVID = std::string;

struct ValueChangedListenerSubscription {
  ListenerID id;
  std::function<void(const std::string& /* key */)> callback;
};

struct MMKVInstanceCache {
  MMKV* instance;
  std::unordered_set<std::string> knownKeys;
};

/**
 * Listeners are tracked across instances - so we need an extra static class for
 * the registry.
 */
class MMKVListenerRegistry final {
public:
  MMKVListenerRegistry() = delete;
  ~MMKVListenerRegistry() = delete;

public:
  static void registerInstance(MMKV* instance);
  static void unregisterInstance(const std::string& mmkvID);

public:
  static ListenerID addValueChangedListener(const std::string& mmkvID, const std::function<void(const std::string& /* key */)>& callback);
  static void removeValueChangedListener(const std::string& mmkvID, ListenerID id);

public:
  static void notifyOnValueChanged(const std::string& mmkvID, const std::string& key);
  static void notifyOnExternalContentChanged(const std::string& mmkvID);

private:
  static std::atomic<ListenerID> _listenersCounter;
  static std::mutex _mutex;
  static std::unordered_map<MMKVID, MMKVInstanceCache> _instances;
  static std::unordered_map<MMKVID, std::vector<ValueChangedListenerSubscription>> _valueChangedListeners;

private:
  static std::unordered_set<std::string> getAllKeys(MMKV* instance);
};

} // namespace margelo::nitro::mmkv
