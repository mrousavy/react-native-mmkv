cmake_minimum_required(VERSION 3.9.0)

add_subdirectory(
        ../MMKV/Core
        Core
)

include_directories(
        ./MMKV/Core
        ../node_modules/react-native/React
        ../node_modules/react-native/React/Base
        ../node_modules/react-native/ReactCommon/jsi
)

add_library(
        cpp  # <-- Library name
        SHARED
        #MMKV/Core # <-- EXCLUDE_FROM_ALL
        ../node_modules/react-native/ReactCommon/jsi/jsi/jsi.cpp
        cpp-adapter.cpp
)

set_target_properties(
        cpp
        PROPERTIES
        CXX_STANDARD 17
        CXX_EXTENSIONS OFF
        POSITION_INDEPENDENT_CODE ON
)


find_library(
        log-lib
        log
)

target_link_libraries(
        cpp
        core
        ${log-lib}
        android
)
