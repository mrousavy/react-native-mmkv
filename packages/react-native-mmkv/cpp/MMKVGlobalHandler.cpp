//
//  MMKVGlobalHandler.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 03.06.2026.
//

#include "MMKVGlobalHandler.hpp"
#include "MMKVListenerRegistry.hpp"
#include <NitroModules/NitroLogger.hpp>

namespace margelo::nitro::mmkv {

namespace {

  LogLevel getNitroLogLevel(::mmkv::MMKVLogLevel level) {
    switch (level) {
      case ::mmkv::MMKVLogDebug:
        return LogLevel::Debug;
      case ::mmkv::MMKVLogInfo:
        return LogLevel::Info;
      case ::mmkv::MMKVLogWarning:
        return LogLevel::Warning;
      case ::mmkv::MMKVLogError:
      case ::mmkv::MMKVLogNone:
        return LogLevel::Error;
    }
    return LogLevel::Error;
  }

} // namespace

MMKVGlobalHandler& MMKVGlobalHandler::shared() {
  static MMKVGlobalHandler handler;
  return handler;
}

void MMKVGlobalHandler::mmkvLog(::mmkv::MMKVLogLevel level, const char* file, int line, const char* function, ::mmkv::MMKVLog_t message) {
  auto logMessage = getLogMessage(message);
  Logger::log(getNitroLogLevel(level), "MMKV", "%s:%d %s: %s", file != nullptr ? file : "", line, function != nullptr ? function : "",
              logMessage.c_str());
}

::mmkv::MMKVRecoverStrategic MMKVGlobalHandler::onMMKVCRCCheckFail(const std::string& /* mmapID */) {
  return ::mmkv::OnErrorDiscard;
}

::mmkv::MMKVRecoverStrategic MMKVGlobalHandler::onMMKVFileLengthError(const std::string& /* mmapID */) {
  return ::mmkv::OnErrorDiscard;
}

void MMKVGlobalHandler::onContentChangedByOuterProcess(const std::string& mmapID) {
  MMKVListenerRegistry::notifyOnExternalContentChanged(mmapID);
}

void MMKVGlobalHandler::onMMKVContentLoadSuccessfully(const std::string& /* mmapID */) {
  // no-op
}

std::string MMKVGlobalHandler::getLogMessage(::mmkv::MMKVLog_t message) {
#if defined(__ANDROID__)
  return message;
#elif defined(__OBJC__)
  if (message == nullptr) {
    return "";
  }
  return std::string([message UTF8String]);
#else
  return "";
#endif
}

} // namespace margelo::nitro::mmkv
