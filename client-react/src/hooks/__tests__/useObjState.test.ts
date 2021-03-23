import { renderHook, act } from '@testing-library/react-hooks';

import useObjState from '../useObjState';

describe('useObjState', () => {
  it('Allows to change `state` using an object', () => {
    const initialState = { hello: 'world', ola: 'mundo' };

    const { result } = renderHook(() =>
      useObjState<typeof initialState>(initialState),
    );

    act(() => {
      const [, setState] = result.current;
      setState({ hello: 'mundo' });
    });

    const [state] = result.current;
    expect(state.hello).toBe('mundo');
  });

  it('Allows to change `state` using a function', () => {
    const initialState = { hello: 'world', ola: 'mundo' };

    const { result } = renderHook(() =>
      useObjState<typeof initialState>(initialState),
    );

    act(() => {
      const [, setState] = result.current;
      setState(oldState => ({ hello: oldState.hello + '-mundo' }));
    });

    const [state] = result.current;
    expect(state.hello).toBe('world-mundo');
  });
});
