import type {FC} from 'react';
import React from 'react';
import {View} from 'react-native';
import type {PhotoRow} from './types';
import {Photo} from './components/photo';
import {styles} from './styles';

interface PhotosRowProps {
  row: PhotoRow;
}

const PhotosRow: FC<PhotosRowProps> = ({row}) => {
  return (
    <View style={styles.rowContainer}>
      {row.map((photo, index) =>
        photo ? <Photo key={index} item={photo} /> : null,
      )}
    </View>
  );
};

export {PhotosRow};
