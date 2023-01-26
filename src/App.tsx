import React, {FC, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  SafeAreaView,
  StatusBar,
  View,
} from 'react-native';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import {PhotoRow, PhotosRow} from './components';
import {ReliableUploader, ReliableUploaderOptions} from '../native-bridges';
import {getFilePath} from './utils';

const UPLOAD_URL = 'http://192.168.0.103:3001/files';
// const UPLOAD_URL = 'https://home-cloud-server.bd-dm.site/files';

const getOptionsForUpload = async (
  file: PhotoIdentifier,
): Promise<ReliableUploaderOptions> => {
  const fileId = file.node.image.uri.split('/')[2];

  return {
    url: UPLOAD_URL,
    method: 'POST',
    fileId,
    filePath: await getFilePath(file),
    field: 'file',
  };
};

const App: FC = () => {
  const [files, setFiles] = useState<PhotoIdentifier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => await fetchPhotos())();
  }, []);

  const imageRows = useMemo(() => {
    const rows: PhotoRow[] = [];

    for (let i = 0; i < files.length; i += 3) {
      rows.push([
        {uri: files[i]?.node?.image?.uri},
        {uri: files[i + 1]?.node?.image?.uri},
        {uri: files[i + 2]?.node?.image?.uri},
      ]);
    }

    return rows;
  }, [files]);

  const fetchPhotos = async () => {
    const {edges: photosFromRoll} = await CameraRoll.getPhotos({
      assetType: 'All',
      first: 99999999,
    });

    setFiles(photosFromRoll);
  };

  const uploadPhotos = async () => {
    setIsLoading(true);

    const itemsToUpload: ReliableUploaderOptions[] = await Promise.all(
      files.map(file => getOptionsForUpload(file)),
    );

    console.log(`Uploading ${itemsToUpload.length} items`);

    await ReliableUploader.upload(itemsToUpload);

    setIsLoading(false);
  };

  return (
    <SafeAreaView>
      <StatusBar />
      <View
        style={{padding: 10, alignItems: 'center', justifyContent: 'center'}}>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Button title={'Start uploading'} onPress={uploadPhotos} />
        )}
      </View>
      <FlatList
        data={imageRows}
        renderItem={row => <PhotosRow key={row.index} row={row.item} />}
      />
    </SafeAreaView>
  );
};

export default App;
