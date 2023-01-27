import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';

export type AuthContextType = {
  isAuthorized: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
};

const defaultContext: AuthContextType = {
  isAuthorized: false,
  token: null,
  setToken: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthContextProvider: FC<PropsWithChildren> = ({children}) => {
  const [token, setToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{token, setToken, isAuthorized: token !== null}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
