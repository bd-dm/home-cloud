enum ReliableUploaderEvent {
  ProgressUpdated = 'ProgressUpdated',
  Error = 'Error',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Expired = 'Expired',
}

interface ReliableUploaderOptions {
  url: string;
  method: 'PUT' | 'POST';
  fileId: string;
  field: string;
  headers?: Record<string, string>;
}

interface ReliableUploaderTask {
  id: number;
}

type UploadId = string;
type BackgroundTaskId = number;

export {ReliableUploaderEvent};

export type {
  UploadId,
  ReliableUploaderTask,
  BackgroundTaskId,
  ReliableUploaderOptions,
};
