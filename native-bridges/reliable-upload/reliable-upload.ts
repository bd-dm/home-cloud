import {NativeEventEmitter, EmitterSubscription} from 'react-native';
import {eventPrefix, nativeModule} from './constants';
import {
  ReliableUploaderEvent,
  ReliableUploaderOptions,
  ReliableUploaderTask,
  UploadId,
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

const upload = (items: ReliableUploaderOptions[]): Promise<UploadId[]> =>
  nativeModule.uploadItems(items);

const cancel = (uploadId: string): Promise<boolean> =>
  nativeModule.uploadItems(uploadId);

const ReliableUploader = {
  upload,
  cancel,
  on,
};

export {ReliableUploader};
