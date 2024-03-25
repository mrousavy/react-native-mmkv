//
//  AndroidLogger.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 05.03.24.
//

#include "Logger.h"
#include <android/log.h>

void Logger::log(const std::string& tag, const std::string& message) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wformat-security"
  __android_log_print(ANDROID_LOG_INFO, tag.c_str(), message.c_str());
#pragma clang diagnostic pop
}
