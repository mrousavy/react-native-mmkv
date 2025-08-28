//
//  MMKVValueChangedListenerRegistry.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 21.08.2025.
//

#include "MMKVValueChangedListenerRegistry.hpp"

namespace margelo::nitro::mmkv {

// static members
std::atomic<ListenerID> MMKVValueChangedListenerRegistry::_listenersCounter = 0;
std::unordered_map<MMKVID, std::vector<ListenerSubscription>> MMKVValueChangedListenerRegistry::_listeners;

ListenerID MMKVValueChangedListenerRegistry::addListener(const std::string& mmkvID,
                                                         const std::function<void(const std::string& /* key */)>& callback) {
  // 1. Get (or create) the listeners array for these MMKV instances
  auto& listeners = _listeners[mmkvID];
  // 2. Get (and increment) the listener ID counter
  auto id = _listenersCounter.fetch_add(1);
  // 3. Add the listener to our array
  listeners.push_back(ListenerSubscription{
      .id = id,
      .callback = callback,
  });
  // 4. Return the ID used to unsubscribe later on
  return id;
}

void MMKVValueChangedListenerRegistry::removeListener(const std::string& mmkvID, ListenerID id) {
  // 1. Get the listeners array for these MMKV instances
  auto entry = _listeners.find(mmkvID);
  if (entry == _listeners.end()) {
    // There's no more listeners for this instance anyways.
    return;
  }
  // 2. Remove all listeners where the ID matches. Should only be one.
  auto& listeners = entry->second;
  listeners.erase(std::remove_if(listeners.begin(), listeners.end(), [id](const ListenerSubscription& e) { return e.id == id; }),
                  listeners.end());
}

void MMKVValueChangedListenerRegistry::notifyOnValueChanged(const std::string& mmkvID, const std::string& key) {
  // 1. Get all listeners for the specific MMKV ID
  auto entry = _listeners.find(mmkvID);
  if (entry == _listeners.end()) {
    // There are no listeners. Return
    return;
  }
  // 2. Call each listener.
  auto& listeners = entry->second;
  for (const auto& listener : listeners) {
    listener.callback(key);
  }
}

} // namespace margelo::nitro::mmkv
