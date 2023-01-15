import React, {FC, useEffect, useMemo, useState} from 'react';
import {
  Button,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import {PhotoRow, PhotosRow} from './components';
import {
  ReliableUploader,
  ReliableUploaderEvent,
  ReliableUploaderOptions,
} from '../native-bridges';

const UPLOAD_URL = 'https://webhook.site/7da8f8bc-6eba-4e04-8f26-e417f36784c2';

const getOptionsForUpload = async (
  uri: string,
): Promise<ReliableUploaderOptions> => {
  const filePath =
    Platform.OS === 'ios'
      ? // @ts-ignore
        (await CameraRoll.iosGetImageDataById(uri)).node.image.filepath
      : uri;

  return {
    url: UPLOAD_URL,
    method: 'POST',
    filePath,
    field: 'file',
  };
};

const App: FC = () => {
  const [photos, setPhotos] = useState<PhotoIdentifier[]>([]);

  useEffect(() => {
    (async () => await fetchPhotos())();
  }, []);

  const imageRows = useMemo(() => {
    const rows: PhotoRow[] = [];

    for (let i = 0; i < photos.length; i += 3) {
      rows.push([
        {uri: photos[i]?.node?.image?.uri},
        {uri: photos[i + 1]?.node?.image?.uri},
        {uri: photos[i + 2]?.node?.image?.uri},
      ]);
    }

    return rows;
  }, [photos]);

  const fetchPhotos = async () => {
    const {edges: photosFromRoll} = await CameraRoll.getPhotos({
      assetType: 'All',
      first: 999999999,
    });
    setPhotos(photosFromRoll);
  };

  const uploadPhotos = async () => {
    let taskId = await ReliableUploader.backgroundTask.start();

    ReliableUploader.on(ReliableUploaderEvent.Expired, data => {
      console.log('BG EXPIRED!', data.id, 'current?', data.id === taskId);
    });

    const upload = async (uri: string) => {
      try {
        await ReliableUploader.upload(await getOptionsForUpload(uri));
      } catch (e) {}
    };

    await Promise.allSettled(photos.map(photo => upload(photo.node.image.uri)));
  };

  return (
    <SafeAreaView>
      <StatusBar />
      <Button title={'Start uploading'} onPress={uploadPhotos} />
      <FlatList
        data={imageRows}
        renderItem={row => <PhotosRow key={row.index} row={row.item} />}
      />
    </SafeAreaView>
  );
};

export default App;
