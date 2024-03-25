project(ReactNativeMMKV)
cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME "react-native-mmkv")
set (BUILD_DIR ${CMAKE_SOURCE_DIR}/build)
set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

# Add headers search paths
include_directories(
        ../MMKV/Core
        ../cpp
)

# Add react-native-mmkv Android sources
add_library(reactnativemmkv  # <-- Library name
        SHARED
        src/main/cpp/AndroidLogger.cpp
        src/main/cpp/AndroidMmkvPlatformContext.cpp
        src/main/cpp/cpp-adapter.cpp
)
# Add MMKV core sources
add_subdirectory(../MMKV/Core core)
# Add react-native-mmkv shared TurboModule sources
add_subdirectory(../cpp react_native_mmkv_core_build)

find_library(log-lib log)

target_link_libraries(
        reactnativemmkv
        core                        # <-- MMKV core
        ${log-lib}                  # <-- Logcat logger
        react_native_mmkv_core      # <-- The shared TurboModule
        android                     # <-- Android JNI core
)
