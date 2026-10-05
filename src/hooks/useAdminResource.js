import { useCallback, useEffect, useState } from 'react';

/**
 * Loads one admin resource. `fetcher` must be stable (wrap it in useCallback
 * or define it at module level) because a new fetcher triggers a reload.
 */
export function useAdminResource(fetcher) {
  const [result, setResult] = useState({ fetcher: null, data: null, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    fetcher()
      .then((data) => active && setResult({ fetcher, data, error: '' }))
      .catch((error) => active && setResult({ fetcher, data: null, error: error.message }));
    return () => {
      active = false;
    };
  }, [fetcher, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  const setData = useCallback(
    (updater) =>
      setResult((current) => ({
        ...current,
        data: typeof updater === 'function' ? updater(current.data) : updater,
      })),
    [],
  );

  return {
    data: result.fetcher === fetcher ? result.data : null,
    error: result.fetcher === fetcher ? result.error : '',
    loading: result.fetcher !== fetcher,
    reload,
    setData,
  };
}
