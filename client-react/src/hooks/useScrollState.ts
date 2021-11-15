import React from 'react';

import debounce from 'lodash.debounce';

export enum EScrollStates {
  INDETERMINED = 'INDETERMINED',
  AT_TOP = 'AT_TOP',
  AT_BOTTOM = 'AT_BOTTOM',
  IN_BETWEEN = 'IN_BETWEEN',
}

const useScrollState = (element: HTMLElement | null) => {
  const [state, setState] = React.useState(EScrollStates.INDETERMINED);

  const onScroll = React.useCallback((evt: Event) => {
    const target = evt.target as HTMLElement;

    let newState = EScrollStates.IN_BETWEEN;
    if (isScrollAtTop(target)) {
      newState = EScrollStates.AT_TOP;
    } else if (isScrollAtBottom(target)) {
      newState = EScrollStates.AT_BOTTOM;
    }

    setState(newState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (element) {
      const debouncedOnScroll = debounce(onScroll, 150);

      element.addEventListener('scroll', debouncedOnScroll);
      return () => {
        if (element) element.removeEventListener('scroll', debouncedOnScroll);
      };
    }
  }, [element, onScroll]);

  return state;
};

const isScrollAtTop = (element: HTMLElement) => element.scrollTop === 0;

const isScrollAtBottom = (element: HTMLElement) =>
  element.scrollTop === element.scrollHeight - element.clientHeight;

export default useScrollState;
