#pragma once
#include <cstddef>
#include <cstdint>
#include <arm_neon.h>

// Converts a UTF-16 string (of length 'len') to UTF-8.
// 'dst' must be preallocated to hold enough bytes (worst-case each UTF-16 can yield up to 3-4 bytes).
// Returns the number of UTF-8 bytes written.
size_t utf16_to_utf8(const char16_t* src, size_t len, char* dst) {
    const char16_t* src_end = src + len;
    char* dst_start = dst;

    // --- Fast path: use NEON to convert blocks of 8 UTF-16 code units when all are ASCII ---
    while (src + 8 <= src_end) {
        // Load 8 UTF-16 code units
        uint16x8_t vec = vld1q_u16(reinterpret_cast<const uint16_t*>(src));
        // If any value is >= 0x80, we can’t use the fast ASCII path.
        // vmaxvq_u16() returns the maximum element in the vector.
        if (vmaxvq_u16(vec) >= 0x80)
            break;
        // All values are ASCII so we can narrow them to 8 bits.
        uint8x8_t ascii = vmovn_u16(vec);
        // Store 8 bytes to dst.
        vst1_u8(reinterpret_cast<uint8_t*>(dst), ascii);
        src += 8;
        dst += 8;
    }

    // --- Fallback: scalar conversion for non-ASCII (and surrogate pair) handling ---
    while (src < src_end) {
        uint32_t codepoint;
        char16_t w = *src++;

        // Check if this code unit is the start of a surrogate pair.
        if (w >= 0xD800 && w <= 0xDBFF) { // High surrogate
            if (src < src_end) {
                char16_t w2 = *src;
                if (w2 >= 0xDC00 && w2 <= 0xDFFF) { // Low surrogate
                    src++;
                    codepoint = 0x10000 + (((w - 0xD800) << 10) | (w2 - 0xDC00));
                } else {
                    // Invalid surrogate pair, substitute replacement character
                    codepoint = 0xFFFD;
                }
            } else {
                // Truncated surrogate pair
                codepoint = 0xFFFD;
            }
        } else if (w >= 0xDC00 && w <= 0xDFFF) {
            // Unpaired low surrogate
            codepoint = 0xFFFD;
        } else {
            codepoint = w;
        }

        // Write out the codepoint in UTF-8.
        if (codepoint < 0x80) {
            *dst++ = static_cast<char>(codepoint);
        } else if (codepoint < 0x800) {
            *dst++ = static_cast<char>((codepoint >> 6) | 0xC0);
            *dst++ = static_cast<char>((codepoint & 0x3F) | 0x80);
        } else if (codepoint < 0x10000) {
            *dst++ = static_cast<char>((codepoint >> 12) | 0xE0);
            *dst++ = static_cast<char>(((codepoint >> 6) & 0x3F) | 0x80);
            *dst++ = static_cast<char>((codepoint & 0x3F) | 0x80);
        } else {
            *dst++ = static_cast<char>((codepoint >> 18) | 0xF0);
            *dst++ = static_cast<char>(((codepoint >> 12) & 0x3F) | 0x80);
            *dst++ = static_cast<char>(((codepoint >> 6) & 0x3F) | 0x80);
            *dst++ = static_cast<char>((codepoint & 0x3F) | 0x80);
        }
    }
    return static_cast<size_t>(dst - dst_start);
}
