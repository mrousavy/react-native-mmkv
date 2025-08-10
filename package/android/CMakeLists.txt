cmake_minimum_required(VERSION 3.9.0)
project(ReactNativeMmkv)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)

# Check for supported ABIs only
if(NOT (ANDROID_ABI STREQUAL "arm64-v8a" OR ANDROID_ABI STREQUAL "x86_64"))
    message(FATAL_ERROR "MMKV prefab does not support ABI: ${ANDROID_ABI}. Supported ABIs: arm64-v8a, x86_64")
endif()

# Compile sources
add_library(
        react-native-mmkv
        SHARED
        src/main/cpp/AndroidLogger.cpp
        ../cpp/MmkvHostObject.cpp
        ../cpp/NativeMmkvModule.cpp
)

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../cpp)

# Find MMKV prefab package
find_package(mmkv QUIET CONFIG)
if(NOT mmkv_FOUND)
    # MMKV prefab workaround: locate in build directory first, then fallback to Gradle cache
    
    # First try: search in build directory prefab structure
    foreach(PREFAB_ROOT ${CMAKE_FIND_ROOT_PATH})
        file(GLOB_RECURSE MMKV_PREFAB_DIRS "${PREFAB_ROOT}/**/mmkv*/prefab")
        
        foreach(PREFAB_DIR ${MMKV_PREFAB_DIRS})
            set(MMKV_INCLUDE_DIR "${PREFAB_DIR}/modules/mmkv/include")
            set(MMKV_LIBRARY "${PREFAB_DIR}/modules/mmkv/libs/android.${ANDROID_ABI}/libmmkv.so")
            
            if(EXISTS "${MMKV_INCLUDE_DIR}" AND EXISTS "${MMKV_LIBRARY}")
                add_library(mmkv::mmkv SHARED IMPORTED)
                set_target_properties(mmkv::mmkv PROPERTIES
                    IMPORTED_LOCATION "${MMKV_LIBRARY}"
                    INTERFACE_INCLUDE_DIRECTORIES "${MMKV_INCLUDE_DIR}")
                message(STATUS "MMKV found in build directory: ${MMKV_LIBRARY}")
                break()
            endif()
        endforeach()
        
        if(TARGET mmkv::mmkv)
            break()
        endif()
    endforeach()
    
    # Fallback: search in Gradle cache if not found in build directory
    if(NOT TARGET mmkv::mmkv)
        execute_process(
            COMMAND sh -c "echo $HOME"
            OUTPUT_VARIABLE USER_HOME
            OUTPUT_STRIP_TRAILING_WHITESPACE
        )
        
        execute_process(
            COMMAND find "${USER_HOME}/.gradle/caches" -path "*/transforms/*/transformed/mmkv*/prefab" -type d
            OUTPUT_VARIABLE MMKV_PREFAB_DIRS_RAW
            OUTPUT_STRIP_TRAILING_WHITESPACE
        )
        
        string(REPLACE "\n" ";" MMKV_PREFAB_DIRS "${MMKV_PREFAB_DIRS_RAW}")
        
        foreach(PREFAB_DIR ${MMKV_PREFAB_DIRS})
            set(MMKV_INCLUDE_DIR "${PREFAB_DIR}/modules/mmkv/include")
            set(MMKV_LIBRARY "${PREFAB_DIR}/modules/mmkv/libs/android.${ANDROID_ABI}/libmmkv.so")
            
            if(EXISTS "${MMKV_INCLUDE_DIR}" AND EXISTS "${MMKV_LIBRARY}")
                add_library(mmkv::mmkv SHARED IMPORTED)
                set_target_properties(mmkv::mmkv PROPERTIES
                    IMPORTED_LOCATION "${MMKV_LIBRARY}"
                    INTERFACE_INCLUDE_DIRECTORIES "${MMKV_INCLUDE_DIR}")
                message(STATUS "MMKV found in Gradle cache: ${MMKV_LIBRARY}")
                break()
            endif()
        endforeach()
    endif()
    
    if(NOT TARGET mmkv::mmkv)
        message(FATAL_ERROR "MMKV prefab not found. Ensure MMKV dependency is properly configured and run './gradlew build' first.")
    endif()
endif()

# Add android/log dependency
find_library(android_log log)

target_include_directories(
        react-native-mmkv
        PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/../cpp
)

target_link_libraries(
        react-native-mmkv
        mmkv::mmkv                  # <-- MMKV core (now manually configured)
        ${android_log}              # <-- Logcat logger
        android                     # <-- Android JNI core
        react_codegen_RNMmkvSpec    # <-- Generated Specs from CodeGen
)
