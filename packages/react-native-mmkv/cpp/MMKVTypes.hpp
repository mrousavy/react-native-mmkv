//
//  MMKVTypes.h
//  react-native-mmkv
//
//  Created by Brad Anderson on 10.08.2025.
//  Platform-specific MMKV type unification header
//

#pragma once

// Platform-specific MMKV includes
#ifdef __ANDROID__
#include <MMKV/MMKV.h>

// On Android, bring global namespace types into mmkv namespace for consistency
namespace mmkv {
using MMKV = ::MMKV;
using MMKVMode = ::MMKVMode;
using MMKVLogLevel = ::MMKVLogLevel;

// Constants - bring into mmkv namespace
constexpr auto MMKVLogDebug = ::MMKVLogDebug;
constexpr auto MMKVLogInfo = ::MMKVLogInfo;
constexpr auto MMKVLogWarning = ::MMKVLogWarning;
constexpr auto MMKVLogError = ::MMKVLogError;
constexpr auto MMKVLogNone = ::MMKVLogNone;

constexpr auto MMKV_SINGLE_PROCESS = ::MMKV_SINGLE_PROCESS;
constexpr auto MMKV_MULTI_PROCESS = ::MMKV_MULTI_PROCESS;
constexpr auto MMKV_READ_ONLY = ::MMKVMode::MMKV_READ_ONLY;
} // namespace mmkv

#else
#include <MMKVCore/MMKV.h>
// iOS already has everything in mmkv:: namespace
#endif

/**
 * Unified MMKV namespace usage for cross-platform compatibility.
 *
 * After including this header, use:
 * - mmkv::MMKV for the main class
 * - mmkv::MMKVMode for mode enum
 * - mmkv::MMKVLogLevel for log level enum
 * - mmkv::MMBuffer for buffer type
 * - mmkv::MMKV_SINGLE_PROCESS / mmkv::MMKV_MULTI_PROCESS for modes
 * - mmkv::MMKVLogDebug, etc. for log levels
 */

using namespace mmkv;
