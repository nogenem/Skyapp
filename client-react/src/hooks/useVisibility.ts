import React from 'react';

// https://stackoverflow.com/a/21935031
const useVisibility = () => {
  const [isVisible, setIsVisible] = React.useState(!document.hidden);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const onVisibilityChange = () => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    setIsVisible(old => {
      const visible = !document.hidden;
      return old !== visible ? visible : old;
    });
  };

  const onFocus = () => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const onBlur = () => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 1000);
  };

  React.useEffect(() => {
    document.addEventListener('visibilitychange', onVisibilityChange, false);
    window.addEventListener('focus', onFocus, false);
    window.addEventListener('blur', onBlur, false);

    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
      document.removeEventListener(
        'visibilitychange',
        onVisibilityChange,
        false,
      );
      window.removeEventListener('focus', onFocus, false);
      window.removeEventListener('blur', onBlur, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isVisible;
};

export default useVisibility;
