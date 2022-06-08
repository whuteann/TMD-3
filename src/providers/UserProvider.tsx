import React, {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";

import { useDispatch, useSelector } from "react-redux";
import Validate from 'validate.js';
import useAuthState from "../hooks/useAuthState";
import { UserSelector, setUser, TokenSelector, setToken } from "../redux/reducers/Auth";
import { User } from "../types/User";
import { AUTH_LOGGED_IN, AUTH_LOGGED_OUT, AUTH_LOADING } from '../constants/Auth';
import { getUserDetail } from "../services/UserServices";
import { getToken } from "../services/NotificationServices";
import { Platform } from "react-native";

interface UserProviderProps {
  children: React.ReactNode
}

interface UserContextProps {
  status: string,
  login: (user: User) => void
  logout: () => void
}

const Context = React.createContext<UserContextProps | null>(null);

export const useUserContext = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useUserContext was used outside of its Provider");
  }

  return context;
};

const UserProvider = ({ children }: UserProviderProps) => {
  const { isSessionAlive, session, clearSession, getLoggedInUser } = useAuthState();
  const dispatch = useDispatch();
  const user = useSelector(UserSelector);
  const token = useSelector(TokenSelector);
  const [authStatus, updateState] = useState<string>(AUTH_LOADING);

  const sessionChanged = async () => {
    updateState(AUTH_LOADING);

    if (isSessionAlive === true) {
      let _user = user;
      let _token = token;

      if (Validate.isEmpty(_user)) {
        getUserDetail(session.uid, (user: User) => {
          _user = user;

          if (Validate.isEmpty(_user)) {
            return logout();
          }

          login(_user!);
        }, () => {
          return logout();
        });

        if (Platform.OS !== "web") {
          getToken().then(token => {
            dispatch(setToken(token));
          })
        }
      }
    } else if (isSessionAlive === false) {
      logout();
    }
  }

  useEffect(() => {
    sessionChanged();
  }, [isSessionAlive]);

  const logout = useCallback(async () => {
    await clearSession();

    updateState(AUTH_LOGGED_OUT);
  }, [clearSession]);

  const login = async (user: User) => {
    dispatch(setUser(user));
    updateState(AUTH_LOGGED_IN);
  }

  const contextValue = useMemo(() => ({
    status: authStatus,
    login,
    logout,
  }), [authStatus, login, logout]);

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
};

export default UserProvider;