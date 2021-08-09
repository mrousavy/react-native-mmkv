#!/bin/bash

cd "$(dirname "$0")"
cd ..
echo "Running build script in $PWD"

rm -rf android-npm/*.aar

cd android
./gradlew clean
echo "Cleaned."

./gradlew assembleDebug
mv build/outputs/aar/android-debug.aar ../android-npm/react-native-mmkv-debug.aar
echo "Built debug."

./gradlew assembleRelease
mv build/outputs/aar/android-release.aar ../android-npm/react-native-mmkv-release.aar
echo "Built release."
