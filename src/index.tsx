import { NativeModules } from 'react-native';

type MmkvType = {
  multiply(a: number, b: number): Promise<number>;
};

const { Mmkv } = NativeModules;

export default Mmkv as MmkvType;
