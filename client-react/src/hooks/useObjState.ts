import React, { Reducer } from 'react';

type TNewStateFunc<S> = (oldState: S) => Partial<S>;
type TNewState<S> = Partial<S> | TNewStateFunc<S>;
type TInitState<S> = (initArg: S) => S;

const useObjState = <S extends object>(
  initialState: S,
  initFunc: TInitState<S> = initialState => initialState,
) => {
  const [state, setState] = React.useReducer<Reducer<S, TNewState<S>>, S>(
    (oldState, newState) => {
      const newStateFunc =
        typeof newState === 'function' ? (newState as TNewStateFunc<S>) : null;

      if (newStateFunc === null) {
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

export type { TNewStateFunc, TNewState, TInitState };
export default useObjState;
