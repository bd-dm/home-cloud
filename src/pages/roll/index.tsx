import type {FC} from 'react';
import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  PlatformColor,
  View,
} from 'react-native';
import type {PhotoIdentifier} from '@react-native-camera-roll/camera-roll';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import type {PhotoRow} from '../../components';
import {PhotosRow} from '../../components';
import type {ReliableUploaderOptions} from '../../../native-bridges';
import {ReliableUploader} from '../../../native-bridges';
import {getFilePath} from '../../utils';
import {useAuthContext} from '../../contexts';

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

export const RollPage: FC = () => {
  const [files, setFiles] = useState<PhotoIdentifier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {logout} = useAuthContext();

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
    <View
      style={{
        flex: 1,
        backgroundColor: PlatformColor('systemBackground'),
      }}>
      <View
        style={{
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: PlatformColor('systemBackground'),
        }}>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Button
            title={'Start uploading'}
            color={PlatformColor('label')}
            onPress={uploadPhotos}
          />
        )}
        <Button
          title={'Logout'}
          color={PlatformColor('label')}
          onPress={logout}
        />
      </View>
      <FlatList
        data={imageRows}
        style={{backgroundColor: PlatformColor('systemBackground')}}
        renderItem={row => <PhotosRow key={row.index} row={row.item} />}
      />
    </View>
  );
};
