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
import type {PhotoRow, RollFile} from '../../components';
import {PhotosRow} from '../../components';
import type {ReliableUploaderOptions} from '../../../native-bridges';
import {ReliableUploader} from '../../../native-bridges';
import {useAuthContext} from '../../contexts';
import {filesApi} from '../../api';
import {config} from '../../config';

const UPLOAD_URL = `${config.api.host}/files`;
// const UPLOAD_URL = 'https://home-cloud-server.bd-dm.site/files';

type LocalFile = PhotoIdentifier;

const getOptionsForUpload = async (
  filePath: string,
  token: string,
): Promise<ReliableUploaderOptions> => {
  return {
    url: UPLOAD_URL,
    method: 'POST',
    filePath,
    field: 'file',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const getFileIdFromUri = (uri: string) => {
  return uri.split('/')[2];
};

export const RollPage: FC = () => {
  const [files, setFiles] = useState<RollFile[]>([]);
  const [isPrepareReady, setIsPrepareReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {token, logout} = useAuthContext();

  useEffect(() => {
    (async () => {
      const localFiles = await getLocalFiles();
      await prepareFiles(localFiles);
    })();
  }, []);

  const imageRows = useMemo(() => {
    const rows: PhotoRow[] = [];

    for (let i = 0; i < files.length; i += 3) {
      rows.push([files[i], files[i + 1], files[i + 2]]);
    }

    return rows;
  }, [files]);

  const prepareFiles = async (localFiles: LocalFile[]) => {
    const uploadedFiles = await filesApi.filesControllerFindAll();

    const rollFiles: RollFile[] = await Promise.all(
      localFiles.map(async file => {
        const fileId = getFileIdFromUri(file.node.image.uri);
        const filePath = await ReliableUploader.getAssetPath(fileId);
        const fileHash = await ReliableUploader.getFileHash(filePath);
        const uploadedFile = uploadedFiles.find(
          uploadedFileEl => uploadedFileEl.fileHash === fileHash,
        );

        return {
          id: fileId,
          uri: file.node.image.uri,
          fileHash,
          isUploaded: !!uploadedFile,
        };
      }),
    );

    setFiles(rollFiles);
    setIsPrepareReady(true);
  };

  const getLocalFiles = async (): Promise<LocalFile[]> => {
    const {edges: photosFromRoll} = await CameraRoll.getPhotos({
      assetType: 'All',
      first: 99999999,
    });

    return photosFromRoll;
  };

  const uploadFiles = async () => {
    try {
      setIsLoading(true);

      const itemsToUpload: ReliableUploaderOptions[] = await Promise.all(
        files.map(file => getOptionsForUpload(file.id, token!)),
      );

      await ReliableUploader.upload(itemsToUpload);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: PlatformColor('systemBackground'),
      }}>
      <View
        style={{
          padding: 5,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: PlatformColor('systemBackground'),
        }}>
        {isLoading || !isPrepareReady ? (
          <ActivityIndicator />
        ) : (
          <Button
            title={'Start uploading'}
            color={PlatformColor('label')}
            onPress={uploadFiles}
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
