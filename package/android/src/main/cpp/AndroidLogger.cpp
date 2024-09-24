//
//  AndroidMmkvLogger.cpp
//  react-native-mmkv
//
//  Created by Marc Rousavy on 05.03.24.
//

#include "MmkvLogger.h"
#include <android/log.h>

void MmkvLogger::log(const std::string& tag, const std::string& formatString, Args... args) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wformat-security"
  __android_log_print(ANDROID_LOG_INFO, tag.c_str(), formatString.c_str(), args);
#pragma clang diagnostic pop
}
