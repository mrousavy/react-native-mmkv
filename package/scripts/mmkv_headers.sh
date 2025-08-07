#!/bin/bash

set -e

# Script to set up MMKV headers for IDE support
# This downloads or creates the necessary MMKV core headers without relying on the example app

# Check if BUILD_DIR is provided as argument
if [ -z "$1" ]; then
    echo "Usage: $0 <BUILD_DIR>"
    echo "BUILD_DIR should be the absolute path to the build directory"
    exit 1
fi

BUILD_DIR="$1"
MMKV_HEADERS_DIR="$BUILD_DIR/mmkv"

echo "Setting up MMKV headers for IDE support..."

# Clean up any existing MMKV headers
if [ -d "$MMKV_HEADERS_DIR" ]; then
    rm -rf "$MMKV_HEADERS_DIR"
fi

mkdir -p "$MMKV_HEADERS_DIR/MMKVCore"

# Try to download MMKV headers from the official repository
if command -v curl >/dev/null 2>&1; then
    echo "Downloading MMKV headers from official repository..."
    
    # MMKV repository URL for core headers
    MMKV_BASE_URL="https://raw.githubusercontent.com/Tencent/MMKV/master/Core"
    
    # List of essential MMKV headers needed for the project
    MMKV_HEADERS=(
        "MMKV.h"
        "MMBuffer.h"
        "MMKVLog.h" 
        "MMKVPredef.h"
        "MMKVMetaInfo.hpp"
        "MMKV_IO.h"
        "MMKV_OSX.h"
        "CodedInputData.h"
        "CodedInputDataCrypt.h"
        "CodedOutputData.h"
        "InterProcessLock.h"
        "KeyValueHolder.h"
        "MemoryFile.h"
        "MiniPBCoder.h"
        "PBUtility.h"
        "ThreadLock.h"
    )
    
    # Download each header file
    DOWNLOAD_SUCCESS=0
    for header in "${MMKV_HEADERS[@]}"; do
        echo "  Downloading $header..."
        if curl -s -L "$MMKV_BASE_URL/$header" -o "$MMKV_HEADERS_DIR/MMKVCore/$header"; then
            # Check if we got a valid header file (not a 404 page)
            if grep -q "class\|struct\|#pragma\|#ifndef" "$MMKV_HEADERS_DIR/MMKVCore/$header" 2>/dev/null; then
                echo "    ✓ Successfully downloaded $header"
                DOWNLOAD_SUCCESS=1
            else
                echo "    ⚠ Downloaded $header but it may be invalid"
                rm -f "$MMKV_HEADERS_DIR/MMKVCore/$header"
            fi
        else
            echo "    ⚠ Failed to download $header"
        fi
    done
    
    # If downloads failed, create minimal stubs
    if [ $DOWNLOAD_SUCCESS -eq 0 ]; then
        echo "⚠ Warning: Could not download MMKV headers from GitHub"
        echo "   Creating minimal MMKV stubs for IDE support..."
        
        # Create minimal MMKV.h stub
        cat > "$MMKV_HEADERS_DIR/MMKVCore/MMKV.h" << 'MMKV_STUB_EOF'
#pragma once

#include <string>
#include <vector>
#include <memory>

// Minimal MMKV stub for IDE support
// This provides basic interface for code completion

class MMKV {
public:
    static MMKV* mmkvWithID(const std::string& mmapID);
    static MMKV* defaultMMKV();
    
    bool setBool(bool value, const std::string& key);
    bool getBool(const std::string& key, bool defaultValue = false);
    
    bool setInt32(int32_t value, const std::string& key);
    int32_t getInt32(const std::string& key, int32_t defaultValue = 0);
    
    bool setInt64(int64_t value, const std::string& key);
    int64_t getInt64(const std::string& key, int64_t defaultValue = 0);
    
    bool setFloat(float value, const std::string& key);
    float getFloat(const std::string& key, float defaultValue = 0.0f);
    
    bool setDouble(double value, const std::string& key);
    double getDouble(const std::string& key, double defaultValue = 0.0);
    
    bool setString(const std::string& value, const std::string& key);
    std::string getString(const std::string& key, const std::string& defaultValue = "");
    
    bool setBytes(const std::vector<uint8_t>& value, const std::string& key);
    std::vector<uint8_t> getBytes(const std::string& key);
    
    std::vector<std::string> allKeys();
    bool containsKey(const std::string& key);
    void removeValueForKey(const std::string& key);
    void clearAll();
    
    void sync();
    void close();
};
MMKV_STUB_EOF
        
        # Create minimal MMKVLog.h stub
        cat > "$MMKV_HEADERS_DIR/MMKVCore/MMKVLog.h" << 'MMKVLOG_STUB_EOF'
#pragma once

// Minimal MMKVLog stub for IDE support
enum MMKVLogLevel {
    MMKVLogDebug = 0,
    MMKVLogInfo,
    MMKVLogWarning,
    MMKVLogError,
    MMKVLogNone,
};

typedef void (*MMKVLogHandler)(MMKVLogLevel level, const char* file, int line, const char* funcname, const char* message);

void mmkvLog(MMKVLogLevel level, const char* file, int line, const char* funcname, const char* format, ...);
MMKVLOG_STUB_EOF
        
        # Create minimal MMKVPredef.h stub
        cat > "$MMKV_HEADERS_DIR/MMKVCore/MMKVPredef.h" << 'MMKVPREDEF_STUB_EOF'
#pragma once

// Minimal MMKVPredef stub for IDE support
#ifndef MMKV_EXPORT
#define MMKV_EXPORT
#endif

#ifndef MMKV_NAMESPACE_BEGIN
#define MMKV_NAMESPACE_BEGIN
#endif

#ifndef MMKV_NAMESPACE_END
#define MMKV_NAMESPACE_END
#endif
MMKVPREDEF_STUB_EOF
        
        echo "✓ Created minimal MMKV stubs for IDE support"
    else
        echo "✓ Successfully downloaded MMKV headers"
    fi
else
    echo "⚠ Warning: curl not available, creating minimal MMKV stubs..."
    
    # Create the same minimal stubs as above
    cat > "$MMKV_HEADERS_DIR/MMKVCore/MMKV.h" << 'MMKV_OFFLINE_EOF'
#pragma once

#include <string>

// Minimal MMKV stub for IDE support (offline)
class MMKV {
public:
    static MMKV* defaultMMKV();
    bool setBool(bool value, const std::string& key);
    bool getBool(const std::string& key, bool defaultValue = false);
    bool setString(const std::string& value, const std::string& key);
    std::string getString(const std::string& key, const std::string& defaultValue = "");
};
MMKV_OFFLINE_EOF
    
    echo "✓ Created offline MMKV stub for IDE support"
fi

# Create a simple MMKVConfig.cmake for find_package
cat > "$MMKV_HEADERS_DIR/MMKVConfig.cmake" << 'MMKV_CMAKE_EOF'
# MMKV CMake config for IDE support
add_library(mmkv::mmkv INTERFACE IMPORTED)
target_include_directories(mmkv::mmkv INTERFACE "${CMAKE_CURRENT_LIST_DIR}")
MMKV_CMAKE_EOF

echo "✓ MMKV headers setup complete in: $MMKV_HEADERS_DIR"
