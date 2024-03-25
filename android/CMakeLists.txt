cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME "react-native-mmkv")
set (BUILD_DIR ${CMAKE_SOURCE_DIR}/build)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

add_compile_options(
        -fexceptions
        -frtti
        -std=c++20
        -Wall
        -Wpedantic
        -DFOLLY_NO_CONFIG=1
        -DLOG_TAG=\"ReactNative\")

# Add headers search paths
include_directories(
        ../MMKV/Core
        ../cpp
)
target_include_directories(react_codegen_RNMmkvSpec PUBLIC .)

# Add react-native-mmkv Android sources
add_library(reactnativemmkv  # <-- Library name
        STATIC
        src/main/cpp/AndroidLogger.cpp
        src/main/cpp/AndroidMmkvPlatformContext.cpp
        src/main/cpp/cpp-adapter.cpp
        ../cpp/MmkvHostObject.cpp
        ../cpp/NativeMmkvModule.cpp
)

# Add MMKV core dependency
add_subdirectory(../MMKV/Core core)

# Add android/log dependency
find_library(log-lib log)

target_link_libraries(
        reactnativemmkv
        core                        # <-- MMKV core
        ${log-lib}                  # <-- Logcat logger
        android                     # <-- Android JNI core
        fbjni                       # <-- fbjni (for TurboModules)
        jsi                         # <-- jsi (for TurboModules)
        react_nativemodule_core     # <-- TurboModules core
        react_codegen_RNMmkvSpec    # <-- Generated Specs from CodeGen
)
