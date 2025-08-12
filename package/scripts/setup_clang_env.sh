#!/bin/bash

set -e

# Get the directory of this script file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set BUILD_DIR to the packages/build directory
BUILD_DIR="$SCRIPT_DIR/../build"

# Create build directory if it doesn't exist
mkdir -p "$BUILD_DIR"

# Convert to absolute path
BUILD_DIR="$(cd "$BUILD_DIR" && pwd)"

# Set PKG_DIR to the packages/ directory
PKG_DIR="$SCRIPT_DIR/../"

# Convert to absolute path
PKG_DIR="$(cd "$PKG_DIR" && pwd)"

echo "Setting up React Native MMKV headers for IDE support..."

# Step 1: Generate TurboModule specs using React Native codegen
echo "Generating TurboModule specs with React Native codegen..."
cd "$PKG_DIR"
bun run codegen

# Verify codegen output
if [ -d "$BUILD_DIR/generated/ios" ]; then
    echo "✓ React Native spec headers generated successfully"
else
    echo "✗ Error: React Native codegen failed to generate spec headers"
    exit 1
fi

# Step 2: Set up dependency headers using Gradle
echo "Setting up dependency headers using Gradle..."

# Run the Gradle prefabs task to extract headers from AARs
echo "Running Gradle prefabs task..."
cd "$PKG_DIR/android"

# Use the local gradlew
GRADLEW_CMD="./gradlew"

# Run the prefabs task
if $GRADLEW_CMD prefabs; then
    echo "✓ Successfully extracted headers using Gradle"
else
    echo "✗ Failed to extract headers using Gradle"
    exit 1
fi

cd - > /dev/null

# Check if folly-config.h exists in the extracted headers, if not generate it
if [ ! -f "$BUILD_DIR/includes/reactnative/folly/folly-config.h" ]; then
    echo "  Generating folly-config.h (not found in prefab)..."
    "$SCRIPT_DIR/folly_config.sh" "$BUILD_DIR"
else
    echo "  ✓ Using folly-config.h from prefab"
fi

# Step 3: Create a comprehensive CMakeLists.txt for IDE support
echo "Creating CMakeLists.txt with comprehensive header paths..."

cat > "$PKG_DIR/CMakeLists.txt" << 'EOF'
cmake_minimum_required(VERSION 3.10.0)
project(ReactNativeMmkv)

set(CMAKE_VERBOSE_MAKEFILE ON)
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Core project directories
include_directories(
    "${CMAKE_CURRENT_SOURCE_DIR}/cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/android/src/main/cpp"
)

# React Native core headers (built-in dependencies)
include_directories(
    "${CMAKE_CURRENT_SOURCE_DIR}/node_modules/react-native/ReactCommon"
    "${CMAKE_CURRENT_SOURCE_DIR}/node_modules/react-native/ReactCommon/callinvoker"
    "${CMAKE_CURRENT_SOURCE_DIR}/node_modules/react-native/ReactCommon/jsi"
    "${CMAKE_CURRENT_SOURCE_DIR}/node_modules/react-native/ReactCommon/react/nativemodule/core"
    "${CMAKE_CURRENT_SOURCE_DIR}/node_modules/react-native/ReactCommon/react/bridging"
    "${CMAKE_CURRENT_SOURCE_DIR}/node_modules/react-native/ReactCommon/react/debug"
    "${CMAKE_CURRENT_SOURCE_DIR}/node_modules/react-native/ReactCommon/react/renderer/core"
    "${CMAKE_CURRENT_SOURCE_DIR}/node_modules/react-native/ReactCommon/react/utils"
)

# Generated TurboModule specs from codegen
include_directories(
    "${CMAKE_CURRENT_SOURCE_DIR}/build/generated/ios"
    "${CMAKE_CURRENT_SOURCE_DIR}/build/generated/ios/RNMmkvSpec"
)

# All downloaded headers (unified includes directory)
include_directories(
    "${CMAKE_CURRENT_SOURCE_DIR}/build/includes"
    "${CMAKE_CURRENT_SOURCE_DIR}/build/includes/mmkv"
    "${CMAKE_CURRENT_SOURCE_DIR}/build/includes/reactnative"
)

# Compile sources
add_library(
    ReactNativeMmkv
    SHARED
    android/src/main/cpp/AndroidLogger.cpp
    cpp/MmkvHostObject.cpp
    cpp/NativeMmkvModule.cpp
)

# Define preprocessor macros for React Native
target_compile_definitions(ReactNativeMmkv PRIVATE
    WITH_INSPECTOR=1
    HERMES_ENABLE_DEBUGGER=1
)

# Link libraries (for completeness, though this is mainly for IDE support)
if(ANDROID)
    find_library(android_log log)
    target_link_libraries(ReactNativeMmkv android_log android)
endif()
EOF

# Step 4: MMKV config is now handled by the separate MMKV script
# No additional setup needed here

# Step 5: Generate compile_commands.json
echo "Generating compile_commands.json..."
cmake -S "$PKG_DIR" -B "$BUILD_DIR"

# Copy the generated compile_commands.json to the project root
cp "$BUILD_DIR/compile_commands.json" "$PKG_DIR/compile_commands.json"

# Clean up the temporary CMakeLists.txt
rm "$PKG_DIR/CMakeLists.txt"

echo ""
echo "✓ Successfully generated compile_commands.json for IDE support!"
echo ""
echo "To enable in VSCode, add this to your settings.json:"
echo "  \"clangd.arguments\": [\"--compile-commands-dir=$PKG_DIR\"]"
echo ""
