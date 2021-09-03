import React from 'react'
import {Nullable} from './types'

export function useInterval(callback: (...args: any) => void, delay: Nullable<number>) {
  const savedCallback = React.useRef<(...args: any) => void>();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      (savedCallback as { current: (...args: any) => void }).current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

