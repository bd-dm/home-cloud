interface Photo {
  uri: string;
}

type PhotoRow = [Photo, Photo, Photo] | [Photo, Photo] | [Photo];

export type {Photo, PhotoRow};
