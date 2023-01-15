import {NativeEventEmitter, EmitterSubscription} from 'react-native';
import {eventPrefix, nativeModule} from './constants';
import {
  BackgroundTaskId,
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

const upload = (options: ReliableUploaderOptions): Promise<UploadId> =>
  nativeModule.upload(options);

const cancel = (uploadId: string): Promise<boolean> =>
  nativeModule.cancel(uploadId);

const canSuspend = (): Promise<boolean> => nativeModule.canSuspend();

const backgroundTask = {
  getRemainingTime: (): Promise<number> =>
    nativeModule.bgTaskGetRemainingTime(),
  start: (): Promise<BackgroundTaskId> => nativeModule.bgTaskStart(),
  end: (id: BackgroundTaskId): Promise<void> => nativeModule.bgTaskEnd(id),
};

const ReliableUploader = {
  upload,
  cancel,
  on,
  canSuspend,
  backgroundTask,
};

export {ReliableUploader};
