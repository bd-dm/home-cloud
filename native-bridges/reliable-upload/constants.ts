import {NativeModules} from 'react-native';

const NAME = 'ReliableUploader';

const nativeModule = NativeModules[NAME];

const eventPrefix = `${NAME}-`;

export {NAME, nativeModule, eventPrefix};
