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

# Add MMKV core sources
add_subdirectory(../MMKV/Core core)
# Add react-native-mmkv sources
add_library(reactnativemmkv  # <-- Library name
        SHARED
        src/main/cpp/cpp-adapter.cpp
        src/main/cpp/MmkvHostObject.cpp
        ../cpp/TypedArray.cpp
)
# Configure C++ 17
set_target_properties(
        reactnativemmkv PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
)

find_package(ReactAndroid REQUIRED CONFIG)
find_library(log-lib log)

target_link_libraries(
        reactnativemmkv
        core                # <-- MMKV core
        ${log-lib}          # <-- Logcat logger
        ReactAndroid::jsi   # <-- JSI
        android             # <-- Android JNI core
)
