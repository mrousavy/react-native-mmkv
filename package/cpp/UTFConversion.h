#include <cstddef>
#include <cstdint>
#include <string>
#if defined(__ARM_NEON) || defined(__ARM_NEON__)
  #include <arm_neon.h>
#endif

// Convert a UTF–16 string (given as a pointer and length in char16_t units)
// into a UTF–8 std::string. This implementation is tuned for ARM/mobile:
// it uses NEON intrinsics to process blocks when the next 8 code–units are
// in the BMP and all require three UTF–8 bytes (which is common for non–Latin scripts).
// When any surrogates or code–points needing 1 or 2 UTF–8 bytes appear, we fall back
// to a scalar conversion that also handles surrogate pairs.
std::string utf16_to_utf8(const char16_t* input, size_t len) {
    // Worst–case expansion: every char16_t might become up to 3 bytes.
    std::string out;
    out.resize(len * 3);
    char* dest = &out[0];
    const char16_t* src = input;
    const char16_t* end = input + len;

#if defined(__ARM_NEON) || defined(__ARM_NEON__)
    // Process in blocks of 8 char16_t values (16 bytes) using NEON.
    while (src + 8 <= end) {
        // Load 8 UTF–16 code–units.
        uint16x8_t vec = vld1q_u16(reinterpret_cast<const uint16_t*>(src));

        // Check for any surrogates (i.e. values in [0xD800, 0xDFFF]).
        uint16x8_t low_bound  = vdupq_n_u16(0xD800);
        uint16x8_t high_bound = vdupq_n_u16(0xDFFF);
        uint16x8_t ge_d800 = vcgeq_u16(vec, low_bound);
        uint16x8_t le_dfff = vcleq_u16(vec, high_bound);
        uint16x8_t surrogate_mask = vandq_u16(ge_d800, le_dfff);
        // vmaxvq_u16 returns the maximum element in the vector.
        if (vmaxvq_u16(surrogate_mask) != 0) {
            break; // fall back to scalar conversion for mixed data.
        }

        // For each BMP non–surrogate code–unit the UTF–8 length is:
        //   1 byte if < 0x80, 2 bytes if < 0x0800, 3 bytes otherwise.
        // We want to vectorize only if every value in the block is >= 0x0800,
        // so that each produces exactly 3 bytes.
        uint16x8_t thr = vdupq_n_u16(0x0800);
        uint16x8_t is_lt = vcltq_u16(vec, thr);
        // Check if any element is less than 0x0800.
        uint16_t tmp[8];
        vst1q_u16(tmp, is_lt);
        bool all_three = true;
        for (int i = 0; i < 8; i++) {
            if (tmp[i] != 0) { // i.e. vec[i] < 0x0800
                all_three = false;
                break;
            }
        }
        if (!all_three)
            break; // fall back to scalar conversion.

        // All 8 code–units are in [0x0800, 0xFFFF] (and are not surrogates)
        // so each produces exactly 3 UTF–8 bytes.
        // Process them in a tight loop.
        for (int i = 0; i < 8; i++) {
            uint16_t ch = src[i];
            // Produce 3 bytes:
            //   byte0 = 0xE0 | (ch >> 12)
            //   byte1 = 0x80 | ((ch >> 6) & 0x3F)
            //   byte2 = 0x80 | (ch & 0x3F)
            dest[0] = static_cast<char>(0xE0 | (ch >> 12));
            dest[1] = static_cast<char>(0x80 | ((ch >> 6) & 0x3F));
            dest[2] = static_cast<char>(0x80 | (ch & 0x3F));
            dest += 3;
        }
        src += 8;
    }
#endif

    // Fallback scalar loop for the remaining code–units (and any blocks that weren’t fully 3–byte).
    while (src < end) {
        uint32_t cp; // code point
        uint16_t x = *src++;
        // Check for surrogate pair.
        if (x >= 0xD800 && x <= 0xDBFF && src < end) {
            uint16_t y = *src;
            if (y >= 0xDC00 && y <= 0xDFFF) {
                cp = ((x - 0xD800) << 10) + (y - 0xDC00) + 0x10000;
                src++;
            } else {
                cp = 0xFFFD; // invalid surrogate – replace with U+FFFD
            }
        } else {
            cp = x;
        }

        // Now emit cp as UTF–8.
        if (cp < 0x80) {
            *dest++ = static_cast<char>(cp);
        } else if (cp < 0x800) {
            *dest++ = static_cast<char>(0xC0 | (cp >> 6));
            *dest++ = static_cast<char>(0x80 | (cp & 0x3F));
        } else if (cp < 0x10000) {
            *dest++ = static_cast<char>(0xE0 | (cp >> 12));
            *dest++ = static_cast<char>(0x80 | ((cp >> 6) & 0x3F));
            *dest++ = static_cast<char>(0x80 | (cp & 0x3F));
        } else {
            *dest++ = static_cast<char>(0xF0 | (cp >> 18));
            *dest++ = static_cast<char>(0x80 | ((cp >> 12) & 0x3F));
            *dest++ = static_cast<char>(0x80 | ((cp >> 6) & 0x3F));
            *dest++ = static_cast<char>(0x80 | (cp & 0x3F));
        }
    }
    // Shrink the output string to the actual size.
    out.resize(dest - &out[0]);
    return out;
}
