import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { auth } from "../functions/Firebase";
import {
  reset, UserSelector
} from "../redux/reducers/Auth";
import { User } from "../types/User";

export default function () {
  const dispatch = useDispatch();
  const user = useSelector(UserSelector);

  const [session, setSession] = useState<any>(undefined);
  const [isSessionAlive, setSessionAlive] = useState<boolean | null>(null);

  const onAuthStateChanged = async (state: any) => {
    setSession(state);
    setSessionAlive(!!state);
  };

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);

    return subscriber;
  }, []);
  
  const clearSession = async () => {
    dispatch(reset());
    
    setSession(null);
    setSessionAlive(false);
  };

  const getLoggedInUser = async (session: any): Promise<User | null> => {
    if (!session) return null;

    const user = session;
    
    return user;
  };

  return {
    isSessionAlive,
    session,
    clearSession, 
    getLoggedInUser
  };
}
