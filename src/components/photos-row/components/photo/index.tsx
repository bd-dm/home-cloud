import type {FC} from 'react';
import React from 'react';
import type {RollFile} from '../../types';
import {Image, PlatformColor, Text, View} from 'react-native';
import {styles} from './styles';

interface PhotoProps {
  item: RollFile;
}

const Photo: FC<PhotoProps> = ({item}) => {
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={{uri: item.uri}} />
      {item.isUploaded ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <Text
            style={{
              color: PlatformColor('label'),
            }}>
            Uploaded
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export {Photo};
