cmake_minimum_required(VERSION 3.9.0)
project(ReactNativeMmkv)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

# Compile sources
add_library(
        react-native-mmkv
        SHARED
        src/main/cpp/AndroidLogger.cpp
        ../cpp/MmkvHostObject.cpp
        ../cpp/NativeMmkvModule.cpp
)

# Find MMKV core dependency (prefab)
find_package(mmkv REQUIRED CONFIG)

# Add android/log dependency
find_library(log-lib log)

target_link_libraries(
        react-native-mmkv
        mmkv::mmkv                  # <-- MMKV core
        ${log-lib}                  # <-- Logcat logger
        android                     # <-- Android JNI core
        react_codegen_RNMmkvSpec    # <-- Generated Specs from CodeGen
)
