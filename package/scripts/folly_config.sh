#!/bin/bash

set -e

# Script to set up folly headers for React Native bridging using shared setup script
# This is required because React Native's bridging headers include <folly/dynamic.h>
# but React Native doesn't ship with the actual folly headers in node_modules

# Check if BUILD_DIR is provided as argument
if [ -z "$1" ]; then
    echo "Usage: $0 <BUILD_DIR>"
    echo "BUILD_DIR should be the absolute path to the build directory"
    exit 1
fi

BUILD_DIR="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Generate folly-config.h with essential configuration (folly-specific)
echo "  Generating folly-config.h configuration file..."
mkdir -p "$BUILD_DIR/includes/reactnative/folly"
cat > "$BUILD_DIR/includes/reactnative/folly/folly-config.h" << 'EOF'
/*
 * Generated folly-config.h for React Native MMKV IDE support
 * This file provides essential configuration defines for folly headers
 */

#pragma once

// Platform detection
#ifdef __APPLE__
#define FOLLY_HAVE_PTHREAD 1
#define FOLLY_HAVE_PTHREAD_ATFORK 1
#endif

#ifdef __ANDROID__
#define FOLLY_HAVE_PTHREAD 1
#define FOLLY_MOBILE 1
#endif

// Standard library features
#define FOLLY_HAVE_STD_FILESYSTEM 1
#define FOLLY_HAVE_LIBGFLAGS 0
#define FOLLY_HAVE_LIBJEMALLOC 0
#define FOLLY_HAVE_PREADV 0
#define FOLLY_HAVE_PWRITEV 0
#define FOLLY_HAVE_CLOCK_GETTIME 1

// Compiler features
#define FOLLY_HAVE_INT128_T 1
#define FOLLY_SUPPLY_MISSING_INT128_TRAITS 0
#define FOLLY_HAVE_EXTRANDOM_ARC4RANDOM 0
#define FOLLY_HAVE_GETRANDOM 0
#define FOLLY_HAVE_ELF 0
#define FOLLY_HAVE_DWARF 0
#define FOLLY_HAVE_SWAPCONTEXT 0
#define FOLLY_HAVE_BACKTRACE 0
#define FOLLY_USE_SYMBOLIZER 0

// Memory and threading
#define FOLLY_HAVE_WEAK_SYMBOLS 1
#define FOLLY_HAVE_LINUX_VDSO 0
#define FOLLY_HAVE_MALLOC_USABLE_SIZE 0
#define FOLLY_HAVE_VLA 1
#define FOLLY_HAVE_SHADOW_LOCAL_WARNINGS 1

// Networking (disabled for mobile)
#define FOLLY_HAVE_ACCEPT4 0
#define FOLLY_HAVE_PIPE2 0
#define FOLLY_HAVE_EPOLL 0
#define FOLLY_HAVE_EVENTFD 0
#define FOLLY_HAVE_UNISTD_H 1

// String and formatting
#define FOLLY_HAVE_WCHAR_SUPPORT 1

// Version info
#define FOLLY_VERSION "2024.11.18.00"

EOF

echo "    ✓ Generated folly-config.h with essential configuration"
echo "✓ Folly headers setup complete with configuration"
