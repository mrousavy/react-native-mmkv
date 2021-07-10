#pragma once

#include <jsi/jsi.h>

using namespace facebook;

class MMKV;

namespace react {
namespace mmkv {

class MmkvBinding : public jsi::HostObject {
    public:
        MmkvBinding(MMKV *mmkv);

        /*
        * `jsi::HostObject` specific overloads.
        */
        jsi::Value get(jsi::Runtime &runtime, jsi::PropNameID const &name) override;

    private:
        MMKV *mmkv_;
};

} // namespace mmkv
} // namespace react
