import type {FC} from 'react';
import React from 'react';
import type {Photo as PhotoType} from '../../types';
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
