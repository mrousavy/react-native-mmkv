package com.margelo.nitro.mmkv

import androidx.annotation.Keep
import com.facebook.common.internal.DoNotStrip
import com.margelo.nitro.NitroModules

@DoNotStrip
@Keep
class HybridMMKVPlatformContext: HybridMMKVPlatformContextSpec() {
    override fun getBaseDirectory(): String {
        val context = NitroModules.applicationContext ?: throw Error("Cannot get MMKV base directory - No Android Context available!")
        return context.filesDir.absolutePath + "/mmkv";
    }

    override fun getAppGroupDirectory(): String? {
        // AppGroups do not exist on Android. It's iOS only.
        throw Error("getAppGroupDirectory() is not supported on Android! It's iOS only.")
    }
}
