import {NativeModules} from 'react-native';

const NAME = 'RNReliableUploader';

const nativeModule = NativeModules[NAME];
const eventPrefix = `${NAME}-`;

export {NAME, nativeModule, eventPrefix};
