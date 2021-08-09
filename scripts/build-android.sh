#!/bin/bash

cd "$(dirname "$0")"
cd ..
echo "Running build script in $PWD"

rm -rf android-npm/*.aar

cd android
./gradlew clean
echo "Cleaned."

./gradlew assembleDebug
mv android/build/outputs/aar/android-debug.aar android-npm
echo "Built debug."

./gradlew assembleRelease
mv android/build/outputs/aar/android-release.aar android-npm
echo "Built release."
