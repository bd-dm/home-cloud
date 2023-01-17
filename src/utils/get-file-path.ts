import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';

const getFilePath = async (
  file: PhotoIdentifier,
): Promise<string | undefined> => {
  const {
    node: {
      image: {uri},
    },
  } = file;

  try {
    // @ts-ignore
    return (await CameraRoll.iosGetImageDataById(uri)).node.image.filepath;
  } catch (error) {
    return undefined;
  }
};

export {getFilePath};
