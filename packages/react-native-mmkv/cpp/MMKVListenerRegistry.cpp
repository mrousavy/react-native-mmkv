//
//  MMKVListenerRegistry.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 21.08.2025.
//

#include "MMKVListenerRegistry.hpp"
#include <algorithm>
#include <unordered_set>

namespace margelo::nitro::mmkv {

// static members
std::atomic<ListenerID> MMKVListenerRegistry::_listenersCounter = 0;
std::mutex MMKVListenerRegistry::_mutex;
std::unordered_map<MMKVID, MMKVInstanceCache> MMKVListenerRegistry::_instances;
std::unordered_map<MMKVID, std::vector<ValueChangedListenerSubscription>> MMKVListenerRegistry::_valueChangedListeners;

void MMKVListenerRegistry::registerInstance(MMKV* instance) {
  auto mmkvID = instance->mmapID();
  auto keys = getAllKeys(instance);

  std::lock_guard lock(_mutex);
  auto entry = _instances.find(mmkvID);
  if (entry == _instances.end()) {
    _instances.emplace(mmkvID, MMKVInstanceCache{.instance = instance, .knownKeys = std::move(keys)});
  } else {
    entry->second.instance = instance;
  }
}

void MMKVListenerRegistry::unregisterInstance(const std::string& mmkvID) {
  std::lock_guard lock(_mutex);
  _instances.erase(mmkvID);
  _valueChangedListeners.erase(mmkvID);
}

ListenerID MMKVListenerRegistry::addValueChangedListener(const std::string& mmkvID,
                                                         const std::function<void(const std::string& /* key */)>& callback) {
  auto id = _listenersCounter.fetch_add(1, std::memory_order_relaxed);
  std::lock_guard lock(_mutex);

  auto& listeners = _valueChangedListeners[mmkvID];
  listeners.push_back(ValueChangedListenerSubscription{
      .id = id,
      .callback = callback,
  });
  return id;
}

void MMKVListenerRegistry::removeValueChangedListener(const std::string& mmkvID, ListenerID id) {
  std::lock_guard lock(_mutex);

  auto entry = _valueChangedListeners.find(mmkvID);
  if (entry == _valueChangedListeners.end()) {
    return;
  }

  auto& listeners = entry->second;
  listeners.erase(
      std::remove_if(listeners.begin(), listeners.end(), [id](const ValueChangedListenerSubscription& e) { return e.id == id; }),
      listeners.end());
  if (listeners.empty()) {
    _valueChangedListeners.erase(entry);
  }
}

void MMKVListenerRegistry::notifyOnValueChanged(const std::string& mmkvID, const std::string& key) {
  MMKV* instance = nullptr;
  {
    std::lock_guard lock(_mutex);
    auto instanceEntry = _instances.find(mmkvID);
    if (instanceEntry != _instances.end()) {
      instance = instanceEntry->second.instance;
    }
  }

  std::unordered_set<std::string> keys;
  if (instance != nullptr) {
    keys = getAllKeys(instance);
  }

  std::vector<std::function<void(const std::string&)>> callbacks;
  {
    std::lock_guard lock(_mutex);
    auto instanceEntry = _instances.find(mmkvID);
    if (instanceEntry != _instances.end() && instance != nullptr) {
      instanceEntry->second.knownKeys = std::move(keys);
    }

    auto entry = _valueChangedListeners.find(mmkvID);
    if (entry == _valueChangedListeners.end()) {
      return;
    }

    callbacks.reserve(entry->second.size());
    for (const auto& listener : entry->second) {
      callbacks.push_back(listener.callback);
    }
  }

  for (const auto& callback : callbacks) {
    callback(key);
  }
}

void MMKVListenerRegistry::notifyOnExternalContentChanged(const std::string& mmkvID) {
  MMKV* instance = nullptr;
  std::unordered_set<std::string> affectedKeys;
  {
    std::lock_guard lock(_mutex);
    auto instanceEntry = _instances.find(mmkvID);
    if (instanceEntry == _instances.end()) {
      return;
    }

    instance = instanceEntry->second.instance;
    affectedKeys = instanceEntry->second.knownKeys;
  }

  auto currentKeys = getAllKeys(instance);
  affectedKeys.insert(currentKeys.begin(), currentKeys.end());

  std::vector<std::function<void(const std::string&)>> callbacks;
  std::vector<std::string> keys;
  {
    std::lock_guard lock(_mutex);
    auto instanceEntry = _instances.find(mmkvID);
    if (instanceEntry == _instances.end()) {
      return;
    }

    instanceEntry->second.knownKeys = std::move(currentKeys);

    auto entry = _valueChangedListeners.find(mmkvID);
    if (entry == _valueChangedListeners.end()) {
      return;
    }

    callbacks.reserve(entry->second.size());
    for (const auto& listener : entry->second) {
      callbacks.push_back(listener.callback);
    }

    keys.reserve(affectedKeys.size());
    for (const auto& key : affectedKeys) {
      keys.push_back(key);
    }
  }

  for (const auto& callback : callbacks) {
    for (const auto& key : keys) {
      callback(key);
    }
  }
}

std::unordered_set<std::string> MMKVListenerRegistry::getAllKeys(MMKV* instance) {
  auto keys = instance->allKeys();
  return std::unordered_set<std::string>(keys.begin(), keys.end());
}

} // namespace margelo::nitro::mmkv
