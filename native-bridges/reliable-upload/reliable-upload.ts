import type {EmitterSubscription} from 'react-native';
import {NativeEventEmitter} from 'react-native';
import {eventPrefix, nativeModule} from './constants';
import type {
  ReliableUploaderEvent,
  ReliableUploaderOptions,
  ReliableUploaderTask,
} from './types';

const on = (
  event: ReliableUploaderEvent,
  listener: (data: ReliableUploaderTask) => void,
): EmitterSubscription => {
  const eventEmitter = new NativeEventEmitter(nativeModule);

  return eventEmitter.addListener(eventPrefix + event, data => {
    listener(data);
  });
};

const upload = async (items: ReliableUploaderOptions[]): Promise<boolean> =>
  nativeModule.uploadItems(items);

type FilePath = string;
const getAssetPath = async (fileId: string): Promise<FilePath> =>
  nativeModule.getAssetPath(fileId);

type FileHash = string;
const getFileHash = async (filePath: string): Promise<FileHash> =>
  nativeModule.getFileHash(filePath);

const ReliableUploader = {
  upload,
  getAssetPath,
  getFileHash,
  on,
};

export {ReliableUploader};
