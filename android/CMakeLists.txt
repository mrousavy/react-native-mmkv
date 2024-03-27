cmake_minimum_required(VERSION 3.9.0)
project(ReactNativeMmkv)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 17)

# Add headers search paths
include_directories(
        ../MMKV/Core
        ../cpp
)



add_library(
        react-native-mmkv
        SHARED
        src/main/cpp/AndroidLogger.cpp
        src/main/cpp/AndroidMmkvPlatformContext.cpp
        src/main/cpp/cpp-adapter.cpp
        ../cpp/MmkvHostObject.cpp
        ../cpp/NativeMmkvModule.cpp
)

# Specifies a path to native header files.
target_include_directories(react-native-mmkv PUBLIC ../cpp)


# Add MMKV core dependency
add_subdirectory(../MMKV/Core core)

# Add android/log dependency
find_library(log-lib log)

target_link_libraries(
        react-native-mmkv
        core                        # <-- MMKV core
        ${log-lib}                  # <-- Logcat logger
        android                     # <-- Android JNI core
        react_codegen_RNMmkvSpec    # <-- Generated Specs from CodeGen
)
