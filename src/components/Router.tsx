import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
}

export const RouterContext = createContext<RouterContextType>({
  path: '/',
  navigate: () => {},
});

export function RouterProvider({ 
  initialPath = '/', 
  children 
}: { 
  initialPath?: string; 
  children: React.ReactNode; 
}) {
  const [path, setPath] = useState(initialPath);

  useEffect(() => {
    // Sync state with current location on client
    setPath(window.location.pathname);

    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    setPath(to);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', to);
      window.scrollTo(0, 0);
    }
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function usePath() {
  return useContext(RouterContext);
}

export function Link({ 
  to, 
  children, 
  className,
  id
}: { 
  to: string; 
  children: React.ReactNode; 
  className?: string; 
  id?: string;
}) {
  const { navigate } = usePath();
  const handleClick = (e: React.MouseEvent) => {
    // Only intercept normal left clicks without modifier keys
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      navigate(to);
    }
  };
  return (
    <a id={id} href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
