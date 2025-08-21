project(NitroMmkv)
cmake_minimum_required(VERSION 3.9.0)

set (PACKAGE_NAME NitroMmkv)
set (CMAKE_VERBOSE_MAKEFILE ON)
set (CMAKE_CXX_STANDARD 20)

# Find all C++ files (shared and platform specifics)
file(GLOB_RECURSE shared_files RELATIVE ${CMAKE_SOURCE_DIR}
     "../cpp/**.cpp"
)
file(GLOB_RECURSE android_files RELATIVE ${CMAKE_SOURCE_DIR}
     "src/main/cpp/**.cpp"
)

# Define C++ library and add all sources
add_library(${PACKAGE_NAME} SHARED
            ${shared_files}
            ${android_files}
)

# Find MMKV prefab package (from mmkv-shared gradle dependency)
find_package(mmkv REQUIRED CONFIG)

# Add Nitrogen specs :)
include(${CMAKE_SOURCE_DIR}/../nitrogen/generated/android/NitroMmkv+autolinking.cmake)

# Set up local includes
include_directories(
        "src/main/cpp"
        "../cpp"
)

find_library(LOG_LIB log)

# Link all libraries together
target_link_libraries(
        ${PACKAGE_NAME}
        ${LOG_LIB}
        mmkv::mmkv                  # <-- MMKV core
        android                     # <-- Android core
)
