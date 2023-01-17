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

const UPLOAD_URL = 'http://192.168.0.103:8080/upload';

const getOptionsForUpload = async (
  file: PhotoIdentifier,
): Promise<ReliableUploaderOptions> => {
  const fileId = file.node.image.uri.split('/')[2];

  return {
    url: UPLOAD_URL,
    method: 'POST',
    fileId,
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
      assetType: 'Videos',
      first: 25,
    });

    setFiles(photosFromRoll);
  };

  const uploadPhotos = async () => {
    setIsLoading(true);

    // let taskId = await ReliableUploader.backgroundTask.start();
    //
    // ReliableUploader.on(ReliableUploaderEvent.Expired, data => {
    //   console.log('BG EXPIRED!', data.id, 'current?', data.id === taskId);
    // });
    //
    // ReliableUploader.on(ReliableUploaderEvent.Error, data => {
    //   console.log('BG ERROR!', data.id, 'current?', data.id === taskId);
    // });
    //
    // // listen for other ReliableUploader events
    // ReliableUploader.on(ReliableUploaderEvent.ProgressUpdated, data => {
    //   console.log(
    //     'BG ProgressUpdated!',
    //     data.id,
    //     'current?',
    //     data.id === taskId,
    //   );
    // });
    //
    // ReliableUploader.on(ReliableUploaderEvent.Completed, data => {
    //   console.log('BG Completed!', data.id, 'current?', data.id === taskId);
    // });
    //
    // ReliableUploader.on(ReliableUploaderEvent.Cancelled, data => {
    //   console.log('BG CANCELLED!', data.id, 'current?', data.id === taskId);
    // });

    const itemsToUpload: ReliableUploaderOptions[] = await Promise.all(
      files.map(file => getOptionsForUpload(file)),
    );

    console.log(`Uploading ${itemsToUpload.length} items`);

    ReliableUploader.upload(itemsToUpload);

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
