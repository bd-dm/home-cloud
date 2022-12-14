import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  useColorScheme,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

const App = () => {
  const [images, setImages] = useState<string[]>([]);
  const isDarkMode = useColorScheme() === 'dark';

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
