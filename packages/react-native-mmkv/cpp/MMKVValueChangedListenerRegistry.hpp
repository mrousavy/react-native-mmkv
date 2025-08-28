//
//  MMKVValueChangedListenerRegistry.hpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 21.08.2025.
//

#include "MMKVTypes.hpp"
#include <atomic>
#include <unordered_map>

namespace margelo::nitro::mmkv {

using ListenerID = size_t;
using MMKVID = std::string;

struct ListenerSubscription {
  ListenerID id;
  std::function<void(const std::string& /* key */)> callback;
};

/**
 * Listeners are tracked across instances - so we need an extra static class for
 * the registry.
 */
class MMKVValueChangedListenerRegistry final {
public:
  MMKVValueChangedListenerRegistry() = delete;
  ~MMKVValueChangedListenerRegistry() = delete;

public:
  static ListenerID addListener(const std::string& mmkvID, const std::function<void(const std::string& /* key */)>& callback);
  static void removeListener(const std::string& mmkvID, ListenerID id);

public:
  static void notifyOnValueChanged(const std::string& mmkvID, const std::string& key);

private:
  static std::atomic<ListenerID> _listenersCounter;
  static std::unordered_map<MMKVID, std::vector<ListenerSubscription>> _listeners;
};

} // namespace margelo::nitro::mmkv
