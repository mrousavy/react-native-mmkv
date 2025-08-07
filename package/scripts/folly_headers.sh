#!/bin/bash

set -e

# Script to set up folly headers for React Native bridging
# This is required because React Native's bridging headers include <folly/dynamic.h>
# but React Native doesn't ship with the actual folly headers in node_modules

# Check if BUILD_DIR is provided as argument
if [ -z "$1" ]; then
    echo "Usage: $0 <BUILD_DIR>"
    echo "BUILD_DIR should be the absolute path to the build directory"
    exit 1
fi

BUILD_DIR="$1"
FOLLY_HEADERS_DIR="$BUILD_DIR/folly"

echo "Setting up folly headers for React Native bridging..."

# Clean up any existing folly headers
if [ -d "$FOLLY_HEADERS_DIR" ]; then
    rm -rf "$FOLLY_HEADERS_DIR"
fi

mkdir -p "$FOLLY_HEADERS_DIR/folly"

# Try to get folly headers from React Native's actual dependency structure
if command -v curl >/dev/null 2>&1; then
    echo "Downloading folly headers for React Native bridging..."
    
    # Create the json subdirectory for the actual dynamic.h
    mkdir -p "$FOLLY_HEADERS_DIR/folly/json"
    
    # Download the actual folly dynamic implementation from the json subdirectory
    FOLLY_JSON_URL="https://raw.githubusercontent.com/facebook/folly/main/folly/json"
    
    # Download the actual dynamic headers
    curl -s -L "$FOLLY_JSON_URL/dynamic.h" -o "$FOLLY_HEADERS_DIR/folly/json/dynamic.h" || echo "Warning: Could not download folly/json/dynamic.h"
    curl -s -L "$FOLLY_JSON_URL/dynamic-inl.h" -o "$FOLLY_HEADERS_DIR/folly/json/dynamic-inl.h" || echo "Warning: Could not download folly/json/dynamic-inl.h"
    
    # Create the main folly/dynamic.h that includes the json version (like the shim does)
    cat > "$FOLLY_HEADERS_DIR/folly/dynamic.h" << 'FOLLY_MAIN_EOF'
#pragma once

// Main folly/dynamic.h that includes the json implementation
#include <folly/json/dynamic.h>
FOLLY_MAIN_EOF
    
    # Check if we got the actual implementation
    if [ -f "$FOLLY_HEADERS_DIR/folly/json/dynamic.h" ] && grep -q "class dynamic" "$FOLLY_HEADERS_DIR/folly/json/dynamic.h" 2>/dev/null; then
        echo "✓ Successfully downloaded folly headers with actual implementation"
    else
        echo "⚠ Warning: Could not download complete folly headers from GitHub"
        echo "   Creating comprehensive folly stub for IDE support..."
        
        # Create a comprehensive stub that matches React Native's usage
        cat > "$FOLLY_HEADERS_DIR/folly/json/dynamic.h" << 'FOLLY_IMPL_EOF'
#pragma once

#include <string>
#include <vector>
#include <map>
#include <memory>

// Comprehensive folly::dynamic stub for IDE support
// This provides the interface that React Native bridging expects

namespace folly {
  class dynamic {
  public:
    enum Type {
      NULLT,
      ARRAY,
      BOOL,
      DOUBLE,
      INT64,
      OBJECT,
      STRING
    };
    
    dynamic() = default;
    dynamic(std::nullptr_t) {}
    dynamic(bool b) {}
    dynamic(int i) {}
    dynamic(double d) {}
    dynamic(const std::string& s) {}
    dynamic(const char* s) {}
    
    // Copy and move constructors
    dynamic(const dynamic& other) = default;
    dynamic(dynamic&& other) = default;
    dynamic& operator=(const dynamic& other) = default;
    dynamic& operator=(dynamic&& other) = default;
    
    // Type checking
    Type type() const { return NULLT; }
    bool isNull() const { return true; }
    bool isBool() const { return false; }
    bool isNumber() const { return false; }
    bool isString() const { return false; }
    bool isObject() const { return false; }
    bool isArray() const { return false; }
    
    // Value access (stubs)
    bool asBool() const { return false; }
    double asDouble() const { return 0.0; }
    int64_t asInt() const { return 0; }
    std::string asString() const { return ""; }
    
    // Object/Array access (stubs)
    dynamic& operator[](const std::string& key) { static dynamic d; return d; }
    const dynamic& operator[](const std::string& key) const { static dynamic d; return d; }
    dynamic& operator[](size_t index) { static dynamic d; return d; }
    const dynamic& operator[](size_t index) const { static dynamic d; return d; }
    
    size_t size() const { return 0; }
  };
}
FOLLY_IMPL_EOF
        
        echo "✓ Created comprehensive folly stub for IDE support"
    fi
else
    echo "⚠ Warning: curl not available, creating comprehensive folly stub..."
    mkdir -p "$FOLLY_HEADERS_DIR/folly/json"
    
    # Create comprehensive stub without downloading
    cat > "$FOLLY_HEADERS_DIR/folly/json/dynamic.h" << 'FOLLY_OFFLINE_EOF'
#pragma once

#include <string>
#include <vector>
#include <map>

namespace folly {
  class dynamic {
  public:
    dynamic() = default;
    dynamic(bool b) {}
    dynamic(int i) {}
    dynamic(double d) {}
    dynamic(const std::string& s) {}
    
    bool asBool() const { return false; }
    double asDouble() const { return 0.0; }
    std::string asString() const { return ""; }
  };
}
FOLLY_OFFLINE_EOF
    
    cat > "$FOLLY_HEADERS_DIR/folly/dynamic.h" << 'FOLLY_MAIN_OFFLINE_EOF'
#pragma once
#include <folly/json/dynamic.h>
FOLLY_MAIN_OFFLINE_EOF
    
    echo "✓ Created offline folly stub for IDE support"
fi

echo "✓ Folly headers setup complete in: $FOLLY_HEADERS_DIR"
