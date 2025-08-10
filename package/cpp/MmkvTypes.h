//
//  MmkvTypes.h
//  react-native-mmkv
//
//  Created by Brad Anderson on 10.08.2025.
//  Platform-specific MMKV type unification header
//

#pragma once

// Platform-specific MMKV includes
#ifdef __ANDROID__
#include <MMKV/MMKV.h>
#else
#include <MMKVCore/MMKV.h>
#endif

/**
 * Unified MMKV type declarations for cross-platform compatibility.
 * 
 * This header centralizes all platform-specific type differences:
 * - Android prefab: MMKV, MMKVMode, MMKVLogLevel are in global namespace
 * - iOS: All types are in mmkv:: namespace
 * - MMBuffer is in mmkv:: namespace on both platforms
 */

#ifdef __ANDROID__
// Android prefab: most types are in global namespace
using MMKVType = ::MMKV;
using MMKVModeType = ::MMKVMode;
using MMKVLogLevelType = ::MMKVLogLevel;
using MMBufferType = ::mmkv::MMBuffer;  // MMBuffer is still in mmkv:: namespace on Android

// Log level constants
constexpr auto MMKVLogDebugValue = ::MMKVLogDebug;
constexpr auto MMKVLogInfoValue = ::MMKVLogInfo;
constexpr auto MMKVLogWarningValue = ::MMKVLogWarning;
constexpr auto MMKVLogErrorValue = ::MMKVLogError;
constexpr auto MMKVLogNoneValue = ::MMKVLogNone;

// Mode constants
constexpr auto MMKVSingleProcessValue = ::MMKV_SINGLE_PROCESS;
constexpr auto MMKVMultiProcessValue = ::MMKV_MULTI_PROCESS;

#else
// iOS: all types are in mmkv:: namespace
using MMKVType = ::mmkv::MMKV;
using MMKVModeType = ::mmkv::MMKVMode;
using MMKVLogLevelType = ::mmkv::MMKVLogLevel;
using MMBufferType = ::mmkv::MMBuffer;

// Log level constants
constexpr auto MMKVLogDebugValue = ::mmkv::MMKVLogDebug;
constexpr auto MMKVLogInfoValue = ::mmkv::MMKVLogInfo;
constexpr auto MMKVLogWarningValue = ::mmkv::MMKVLogWarning;
constexpr auto MMKVLogErrorValue = ::mmkv::MMKVLogError;
constexpr auto MMKVLogNoneValue = ::mmkv::MMKVLogNone;

// Mode constants
constexpr auto MMKVSingleProcessValue = ::mmkv::MMKV_SINGLE_PROCESS;
constexpr auto MMKVMultiProcessValue = ::mmkv::MMKV_MULTI_PROCESS;

#endif
