type RollFile = {
  id: string;
  uri: string;
  fileHash?: string;
  isUploaded?: boolean;
};

type PhotoRow =
  | [RollFile, RollFile, RollFile]
  | [RollFile, RollFile]
  | [RollFile];

export type {RollFile, PhotoRow};
