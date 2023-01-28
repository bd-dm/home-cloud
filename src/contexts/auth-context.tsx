import type {FC, PropsWithChildren} from 'react';
import React, {createContext, useContext, useEffect, useState} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';

export type AuthContextType = {
  isAuthorized: boolean;
  token: string | null;
  setToken: (token: string | null) => Promise<void>;
  logout: () => Promise<void>;
};

const defaultContext: AuthContextType = {
  isAuthorized: false,
  token: null,
  setToken: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthContextProvider: FC<PropsWithChildren> = ({children}) => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [_token, _setToken] = useState<string | null>(null);

  useEffect(() => {
    EncryptedStorage.getItem('token')
      .then((token = null) => {
        _setToken(token);
      })
      .catch(() => {
        _setToken(null);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  const setToken = async (token: string | null) => {
    try {
      if (token) {
        await EncryptedStorage.setItem('token', token);
      } else {
        await EncryptedStorage.removeItem('token');
      }
    } catch (e) {
      console.error(e);
    }

    _setToken(token);
  };

  const logout = async () => setToken(null);

  if (!isReady) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{token: _token, setToken, logout, isAuthorized: _token !== null}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
