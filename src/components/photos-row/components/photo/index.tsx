import React, {FC} from 'react';
import {Photo as PhotoType} from '../../types';
import {Image, View} from 'react-native';
import {styles} from './styles';

interface PhotoProps {
  item: PhotoType;
}

const Photo: FC<PhotoProps> = ({item}) => {
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={{uri: item.uri}} />
    </View>
  );
};

export {Photo};
