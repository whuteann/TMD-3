import React, {
  useContext, useState
} from "react";


interface RefreshProviderProps {
  children: React.ReactNode
}

interface RefreshContextProps {
  refresh: boolean,
  refreshList: (list: string) => void,
  toRefresh: string
}

const Context = React.createContext<RefreshContextProps | null>(null);

export const useRefreshContext = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useRefreshContext was used outside of its Provider");
  }

  return context;
};

const RefreshProvider = ({ children }: RefreshProviderProps) => {
  const [refresh, setRefresh] = useState(false);
  const [toRefresh, setToRefresh] = useState("");

  const refreshList = (list: string) => {
    setToRefresh(list);
    setRefresh(!refresh);
  }

  const contextValue = {
    refresh,
    refreshList,
    toRefresh
  };

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
};

export default RefreshProvider;