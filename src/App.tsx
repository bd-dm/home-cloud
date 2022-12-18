import React, {FC, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StatusBar} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {PhotoRow} from './components/photos-row/types';
import {PhotosRow} from './components/photos-row';

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
    const sleep = (time: number) =>
      new Promise(resolve => setTimeout(() => resolve(undefined), time));

    const veryIntensiveTask = async (
      taskDataArguments: {delay?: number} = {},
    ) => {
      const {delay} = taskDataArguments;

      for (let i = 0; BackgroundService.isRunning(); i++) {
        console.log(i);
        await sleep(delay ?? 1000);
        console.log(i, 'done');

        if (i > 500) {
          await BackgroundService.stop();
        }
      }
    };

    const options = {
      taskName: 'Example',
      taskTitle: 'ExampleTask title',
      taskDesc: 'ExampleTask description',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#ff00ff',
      linkingURI: 'yourSchemeHere://chat/jane',
      parameters: {
        delay: 1000,
      },
    };

    await BackgroundService.start(veryIntensiveTask, options);
    await BackgroundService.updateNotification({
      taskDesc: 'New ExampleTask description',
    });
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
