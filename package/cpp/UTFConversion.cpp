#include "UTFConversion.h"

#if defined(__ARM_NEON) || defined(__ARM_NEON__)
#include <arm_neon.h>
#endif

std::string utf16_to_utf8(const char16_t* input, size_t len) {
  // Preallocate worst-case output: every code unit might be 3 bytes.
  std::string out;
  out.resize(len * 3);
  char* dest = &out[0];
  const char16_t* src = input;
  const char16_t* end = input + len;

#if defined(__ARM_NEON) || defined(__ARM_NEON__)
  // Preload frequently used constants into NEON registers.
  const uint16x8_t v_d800 = vdupq_n_u16(0xD800);
  const uint16x8_t v_dfff = vdupq_n_u16(0xDFFF);
  const uint16x8_t v_thr = vdupq_n_u16(0x0800);
  const uint16x8_t v_mask3F = vdupq_n_u16(0x3F);
  const uint16x8_t v_constE0 = vdupq_n_u16(0xE0); // for 3-byte header: 0xE0
  const uint16x8_t v_constC0 = vdupq_n_u16(0xC0); // for 2-byte header: 0xC0
  const uint16x8_t v_const80 = vdupq_n_u16(0x80); // for continuation bytes

  while (src + 8 <= end) {
    // Load 8 UTF16 code units.
    uint16x8_t vec = vld1q_u16(reinterpret_cast<const uint16_t*>(src));

    // Check for any surrogates (i.e. values in [0xD800, 0xDFFF]).
    uint16x8_t ge_d800 = vcgeq_u16(vec, v_d800);
    uint16x8_t le_dfff = vcleq_u16(vec, v_dfff);
    uint16x8_t surrogate = vandq_u16(ge_d800, le_dfff);
    if (vmaxvq_u16(surrogate) != 0) {
      // At least one code unit is in the surrogate range.
      break; // Fallback to scalar conversion (which handles surrogate pairs).
    }

    // Compute the minimum and maximum values in the vector.
    const uint16_t min_val = vminvq_u16(vec);
    const uint16_t max_val = vmaxvq_u16(vec);

    if (min_val >= 0x0800) {
      // All 8 code units are >= 0x0800, so each produces exactly 3 UTF8 bytes.
      // Byte 0: 0xE0 | (ch >> 12)
      uint16x8_t ch_shr12 = vshrq_n_u16(vec, 12);
      uint16x8_t v0_16 = vorrq_u16(ch_shr12, v_constE0);
      uint8x8_t v0 = vmovn_u16(v0_16);

      // Byte 1: 0x80 | ((ch >> 6) & 0x3F)
      uint16x8_t ch_shr6 = vshrq_n_u16(vec, 6);
      uint16x8_t v1_16 = vandq_u16(ch_shr6, v_mask3F);
      v1_16 = vorrq_u16(v1_16, v_const80);
      uint8x8_t v1 = vmovn_u16(v1_16);

      // Byte 2: 0x80 | (ch & 0x3F)
      uint16x8_t v2_16 = vandq_u16(vec, v_mask3F);
      v2_16 = vorrq_u16(v2_16, v_const80);
      uint8x8_t v2 = vmovn_u16(v2_16);

      // Use NEON’s interleaved store to output 24 bytes at once.
      uint8x8x3_t out3;
      out3.val[0] = v0;
      out3.val[1] = v1;
      out3.val[2] = v2;
      vst3_u8(reinterpret_cast<uint8_t*>(dest), out3);

      src += 8;
      dest += 24;
      continue;
    } else if (max_val < 0x0800 && min_val >= 0x80) {
      // All 8 code units are in [0x80, 0x07FF]. (Note: if any were <0x80,
      // that would be ASCII—but we assume non-ASCII data, so we get a uniform block.)
      // Each produces exactly 2 UTF8 bytes.
      // Byte 0: 0xC0 | (ch >> 6)
      uint16x8_t ch_shr6 = vshrq_n_u16(vec, 6);
      uint16x8_t v0_16 = vorrq_u16(ch_shr6, v_constC0);
      uint8x8_t v0 = vmovn_u16(v0_16);

      // Byte 1: 0x80 | (ch & 0x3F)
      uint16x8_t v1_16 = vandq_u16(vec, v_mask3F);
      v1_16 = vorrq_u16(v1_16, v_const80);
      uint8x8_t v1 = vmovn_u16(v1_16);

      // Interleave and store 16 bytes at once.
      uint8x8x2_t out2;
      out2.val[0] = v0;
      out2.val[1] = v1;
      vst2_u8(reinterpret_cast<uint8_t*>(dest), out2);

      src += 8;
      dest += 16;
      continue;
    }
    // If the block mixes 1-, 2-, or 3-byte cases, fall back to the scalar loop.
    break;
  }
#endif

  // Fallback scalar conversion for any remaining or mixed data.
  while (src < end) {
    uint32_t cp; // decoded Unicode code point
    uint16_t x = *src++;
    if (x >= 0xD800 && x <= 0xDBFF && src < end) {
      uint16_t y = *src;
      if (y >= 0xDC00 && y <= 0xDFFF) {
        cp = ((x - 0xD800) << 10) + (y - 0xDC00) + 0x10000;
        src++;
      } else {
        cp = 0xFFFD; // Invalid surrogate pair.
      }
    } else {
      cp = x;
    }

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
  out.resize(dest - &out[0]);
  return out;
}
