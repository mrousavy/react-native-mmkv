//
//  MMKVGlobalHandler.hpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 03.06.2026.
//

#pragma once

#include "MMKVTypes.hpp"

namespace margelo::nitro::mmkv {

class MMKVGlobalHandler final : public ::mmkv::MMKVHandler {
public:
  static MMKVGlobalHandler& shared();

public:
  void mmkvLog(::mmkv::MMKVLogLevel level, const char* file, int line, const char* function, ::mmkv::MMKVLog_t message) override;
  ::mmkv::MMKVRecoverStrategic onMMKVCRCCheckFail(const std::string& mmapID) override;
  ::mmkv::MMKVRecoverStrategic onMMKVFileLengthError(const std::string& mmapID) override;
  void onContentChangedByOuterProcess(const std::string& mmapID) override;
  void onMMKVContentLoadSuccessfully(const std::string& mmapID) override;

private:
  MMKVGlobalHandler() = default;

private:
  static std::string getLogMessage(::mmkv::MMKVLog_t message);
};

} // namespace margelo::nitro::mmkv
