#include <cstddef>
#include <cstdint>
#include <string>

// A super-optimized UTF16-to-UTF8 converter for ARM/mobile.
// It converts UTF16 input (given as a const char16_t* and length)
// into a std::string in UTF8. Two NEON fast-paths are used:
//
//   • If a block of 8 UTF16 code units are all in the range [0x0800,0xFFFF]
//     (and not surrogates), each produces exactly 3 UTF8 bytes.
//     We compute the three bytes in parallel and use vst3_u8 to store 24 bytes.
//
//   • If a block of 8 code units are all in the range [0x80,0x07FF] (i.e. none
//     are ASCII, so all are 2-byte UTF8), we use a similar approach with vst2_u8.
//
// In any other case (including surrogate pairs or mixed ranges) we fall back
// to a scalar loop that handles surrogate pairs and variable-length conversion.
std::string utf16_to_utf8(const char16_t* input, size_t len);
