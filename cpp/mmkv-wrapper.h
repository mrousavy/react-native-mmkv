#ifndef EXAMPLE_H
#define EXAMPLE_H

#include <jsi/jsilib.h>
#include <jsi/jsi.h>

namespace mmkv {
    void setup(facebook::jsi::Runtime& jsiRuntime);
    void teardown();
}

#endif /* EXAMPLE_H */
