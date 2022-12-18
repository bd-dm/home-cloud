import React, {FC, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StatusBar} from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {PhotoRow} from './components/photos-row/types';
import {PhotosRow} from './components/photos-row';

const sleep = (time: number) =>
  new Promise(resolve => setTimeout(() => resolve(undefined), time));

const App: FC = () => {
  const [imageRows, setImageRows] = useState<PhotoRow[]>([]);

  useEffect(() => {
    (async () => {
      await startBG();

      const photos = (await CameraRoll.getPhotos({first: 1000000})).edges;
      const rows: PhotoRow[] = [];

      for (let i = 0; i < photos.length; i += 3) {
        rows.push([
          {uri: photos[i]?.node?.image?.uri},
          {uri: photos[i + 1]?.node?.image?.uri},
          {uri: photos[i + 2]?.node?.image?.uri},
        ]);
      }

      setImageRows(rows);
    })();
  }, []);

  const startBG = async () => {
    const runBGProcess = async (taskId: string) => {
      for (let i = 0; i < 10000; i++) {
        await fetch(
          'https://webhook.site/35fb3854-a9e7-4b79-9d12-719df3161a90',
          {
            method: 'POST',
            body: JSON.stringify({taskId, i}),
          },
        );
        await sleep(1000);
      }
      BackgroundFetch.finish(taskId);
    };

    const onBGTimeout = (taskId: string) => {
      console.log('TIMEOUT', taskId);
      BackgroundFetch.finish(taskId);
    };

    let status = await BackgroundFetch.configure(
      {minimumFetchInterval: 15},
      runBGProcess,
      onBGTimeout,
    );
    console.log('[BackgroundFetch] configure status: ', status);
  };

  return (
    <SafeAreaView>
      <StatusBar />
      <FlatList
        data={imageRows}
        renderItem={row => <PhotosRow key={row.index} row={row.item} />}
      />
    </SafeAreaView>
  );
};

export default App;
