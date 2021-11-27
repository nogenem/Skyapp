import React from 'react';

import debounce from 'lodash.debounce';

const useDebounce = (
  func: (...args: any) => any,
  delay: number,
  dependencies: React.DependencyList = [],
) => {
  const debouncedFunc = React.useCallback(debounce(func, delay), dependencies);

  React.useEffect(() => {
    return () => {
      debouncedFunc.cancel && debouncedFunc.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return debouncedFunc;
};

export default useDebounce;
