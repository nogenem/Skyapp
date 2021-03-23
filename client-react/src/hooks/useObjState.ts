import React, { Reducer } from 'react';

type TNewStateFunc<S> = (oldState: Partial<S>) => Partial<S>;
type TNewState<S> = Partial<S> | TNewStateFunc<Partial<S>>;

const noop = <S>(oldState: S) => oldState;

const useObjState = <S extends object>(
  initialState: S,
  initFunc = undefined,
) => {
  const [state, setState] = React.useReducer<Reducer<S, TNewState<S>>>(
    (oldState, newState) => {
      const newStateFunc =
        typeof newState === 'function' ? (newState as TNewStateFunc<S>) : noop;

      if (newStateFunc === noop) {
        return { ...oldState, ...newState };
      } else {
        return { ...oldState, ...newStateFunc(oldState) };
      }
    },
    initialState,
    initFunc,
  );
  return [state, setState] as const;
};

export default useObjState;
