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

type FileId = string;
type FileHash = string;
const getFileHash = async (fileId: FileId): Promise<FileHash> =>
  nativeModule.getFileHash(fileId);

const ReliableUploader = {
  upload,
  getFileHash,
  on,
};

export {ReliableUploader};
