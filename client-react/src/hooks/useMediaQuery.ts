import React from 'react';

const useMediaQuery = (mediaQuery: string) => {
  const [isMatch, setIsMatch] = React.useState(false);

  React.useEffect(() => {
    const list = window.matchMedia(mediaQuery);
    setIsMatch(list.matches);

    const handleChanges = (e: MediaQueryListEvent) => setIsMatch(e.matches);
    list.addEventListener('change', handleChanges);
    return () => {
      list.removeEventListener('change', handleChanges);
    };
  }, [mediaQuery]);

  return isMatch;
};

export default useMediaQuery;
