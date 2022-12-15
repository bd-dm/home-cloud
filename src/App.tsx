import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  useColorScheme,
} from 'react-native';
import BackgroundService from 'react-native-background-actions';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import TrackPlayer, {Event, State} from 'react-native-track-player';
// @ts-ignore
import a from './assets/dummy.mp3';

const startBG = async () => {
  const sleep = (time: number) =>
    new Promise(resolve => setTimeout(() => resolve(undefined), time));

  const veryIntensiveTask = async (
    taskDataArguments: {delay?: number} = {},
  ) => {
    const {delay} = taskDataArguments;

    const listenerChange = TrackPlayer.addEventListener(
      Event.PlaybackState,
      async newState => {
        if (newState.state === State.Paused) {
          await TrackPlayer.play();
        }
      },
    );

    await TrackPlayer.setupPlayer();
    await TrackPlayer.add([
      {
        url: a,
        title: 'Test Title',
        artist: 'Artist',
        duration: 200000,
      },
    ]);
    await TrackPlayer.play();

    for (let i = 0; BackgroundService.isRunning(); i++) {
      console.log(i);
      await sleep(delay ?? 1000);
      console.log(i, 'done');

      if (i > 500) {
        listenerChange.remove();
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

const App = () => {
  const [images, setImages] = useState<string[]>([]);
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    (async () => {
      await startBG();
    })();
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    (async () => {
      const photos = await CameraRoll.getPhotos({first: 10});
      setImages(
        photos.edges.map(
          ({
            node: {
              image: {uri},
            },
          }) => uri,
        ),
      );
    })();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <FlatList
        data={images}
        renderItem={({item}) => (
          <Image
            style={{width: 200, height: 200}}
            key={item}
            source={{uri: item}}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default App;
