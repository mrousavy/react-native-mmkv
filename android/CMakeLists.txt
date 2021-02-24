cmake_minimum_required(VERSION 3.9.0)

# Needed to locate double-conversion src correctly for folly includes
#execute_process (COMMAND ln "-s" "src" "../../react-native/third-party/double-conversion-1.1.6/double-conversion")

add_subdirectory(../MMKV/Core Core)

include_directories(
        ./MMKV/Core
        ../node_modules/react-native/React
        ../node_modules/react-native/React/Base
        ../node_modules/react-native/ReactCommon/jsi
)

add_library(cpp  # <-- Library name
        SHARED
        #MMKV/Core # <-- EXCLUDE_FROM_ALL
        # Provides a relative path to your source file(s).
        ../node_modules/react-native/ReactCommon/jsi/jsi/jsi.cpp
        cpp-adapter.cpp
)

set_target_properties(cpp PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
        )


find_library( # Sets the name of the path variable.
        log-lib

        # Specifies the name of the NDK library that
        # you want CMake to locate.
        log )

target_link_libraries(cpp
        core
        ${log-lib}
        android)
