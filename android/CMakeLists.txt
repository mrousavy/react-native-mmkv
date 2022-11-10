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

# Add react-native core libraries
set(REACT_ANDROID_DIR "${REACT_NATIVE_DIR}/ReactAndroid")
set(REACT_COMMON_DIR "${REACT_NATIVE_DIR}/ReactCommon")
set(REACT_NDK_EXPORT_DIR "${APP_BUILD_DIR}/react-ndk/exported")

# 1. JSI lib
add_library(jsi SHARED IMPORTED GLOBAL)
set_target_properties(jsi
        PROPERTIES
        IMPORTED_LOCATION
        ${REACT_NDK_EXPORT_DIR}/${ANDROID_ABI}/libjsi.so)
target_include_directories(jsi INTERFACE ${REACT_COMMON_DIR}/jsi)

# 2. Logcat Logger
find_library(
        log-lib
        log
)

target_link_libraries(
        reactnativemmkv
        core
        ${log-lib}
        jsi
        android
)
