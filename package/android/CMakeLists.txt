cmake_minimum_required(VERSION 3.9.0)
project(ReactNativeMmkv)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

# Check for supported ABIs only
if(NOT (ANDROID_ABI STREQUAL "arm64-v8a" OR ANDROID_ABI STREQUAL "x86_64"))
    message(FATAL_ERROR "MMKV prefab does not support ABI: ${ANDROID_ABI}. Supported ABIs: arm64-v8a, x86_64")
endif()

# Compile sources
add_library(
        react-native-mmkv
        SHARED
        src/main/cpp/AndroidLogger.cpp
        ../cpp/MmkvHostObject.cpp
        ../cpp/NativeMmkvModule.cpp
)

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../cpp)

# Find MMKV prefab package
find_package(mmkv REQUIRED CONFIG)

# Add android/log dependency
find_library(android_log log)

target_include_directories(
        react-native-mmkv
        PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/../cpp
)

target_link_libraries(
        react-native-mmkv
        mmkv::mmkv                  # <-- MMKV core (now manually configured)
        ${android_log}              # <-- Logcat logger
        android                     # <-- Android JNI core
        react_codegen_RNMmkvSpec    # <-- Generated Specs from CodeGen
)
