#pragma once

#include "JSValue.h"
#include "NativeModules.h"

using namespace winrt::Microsoft::ReactNative;

namespace winrt::ReactNativeMmkv
{

REACT_MODULE(ReactNativeModule, L"ReactNativeMmkv")
struct ReactNativeModule
{
    void installMmkv();

    REACT_INIT(Initialize)
    void Initialize(ReactContext const &reactContext) noexcept
    {
        m_reactContext = reactContext;
        installMmkv();
    }

    private:
        ReactContext m_reactContext{nullptr};
};

} // namespace winrt::ReactNativeMmkv
