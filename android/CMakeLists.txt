cmake_minimum_required(VERSION 3.9.0)

add_subdirectory(../MMKV/Core Core)

include_directories(
        ../MMKV/Core
        ../../react-native/React
        ../../react-native/React/Base
        ../../react-native/ReactCommon/jsi
)

add_library(mmkvNative  # <-- Library name
        SHARED
        # Provides a relative path to your source file(s).
        ../../react-native/ReactCommon/jsi/jsi/jsi.cpp
        cpp-adapter.cpp
)

set_target_properties(
        mmkvNative PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
)


find_library(
        log-lib # Sets the name of the path variable.
        log
)

target_link_libraries(
        mmkvNative
        core
        ${log-lib}
        android
)
