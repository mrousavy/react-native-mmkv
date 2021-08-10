cmake_minimum_required(VERSION 3.9.0)

add_subdirectory(../MMKV/Core Core)

set (PACKAGE_NAME "react-native-mmkv")
set (BUILD_DIR ${CMAKE_SOURCE_DIR}/build)

include_directories(
        ../MMKV/Core
        ../../react-native/React
        ../../react-native/React/Base
        ../../react-native/ReactCommon/jsi
)

add_library(reactnativemmkv  # <-- Library name
        SHARED
        cpp-adapter.cpp
)

set_target_properties(
        reactnativemmkv PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
)

file (GLOB LIBRN_DIR "${BUILD_DIR}/react-native-0*/jni/${ANDROID_ABI}")

find_library(
        log-lib
        log
)
find_library(
        REACT_NATIVE_JNI_LIB
        reactnativejni
        PATHS ${LIBRN_DIR}
        NO_CMAKE_FIND_ROOT_PATH
)

target_link_libraries(
        reactnativemmkv
        core
        ${log-lib}
        ${REACT_NATIVE_JNI_LIB}
        android
)
