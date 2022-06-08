import React, {
  useCallback, useContext, useMemo, useState,
} from "react";

import Loading from "../components/atoms/loading/loading";

interface LoadingProviderProps {
	children: React.ReactNode
}

interface LoadingContextProps {
	isLoading: boolean
	start: () => void
	end: () => void
}

const Context = React.createContext<LoadingContextProps | null>(null);

export const useLoadingState = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useUserContext was used outside of its Provider");
  }

  return context;
};

const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isLoading, toggle] = useState<boolean>(false);

  const start = useCallback(() => {
    toggle(true);
  }, []);

  const end = useCallback(() => {
    toggle(false);
  }, []);

  const contextValue = useMemo(() => ({
    isLoading,
    start,
    end,
  }), [isLoading, start, end]);

  return (
	  <Context.Provider value={contextValue}>
		  <Loading preset="dark" open={isLoading} />
		  {children}
	  </Context.Provider>
  );
};

export default LoadingProvider;
