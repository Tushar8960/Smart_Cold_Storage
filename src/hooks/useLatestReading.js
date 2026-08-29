import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { getLatestReading } from '../api/endpoints';
import { pickObject } from '../utils/data';
import { normalizeReading } from '../utils/readings';

// Polls /api/readings/latest on an interval so dashboard cards stay live.
// Also derives an "online/offline" flag based on how stale the last reading is.
export function useLatestReading(pollMs = 5000, staleAfterMs = 30000) {
  const [reading, setReading] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [previousPowerSource, setPreviousPowerSource] = useState(null);
  const [wasOnline, setWasOnline] = useState(null);
  const lastSignalAtRef = useRef(null);
  const powerSourceRef = useRef(null);
  const onlineRef = useRef(false);
  const initializedRef = useRef(false);

  const fetchReading = useCallback(async () => {
    try {
      const payload = await getLatestReading();
      const raw = pickObject(payload, ['reading', 'data']);
      const nextReading = normalizeReading(raw);
      const signalAt = nextReading?.timestamp ?? Date.now();
      const nextOnline = Date.now() - signalAt < staleAfterMs;

      startTransition(() => {
        if (nextReading?.powerSource && powerSourceRef.current !== nextReading.powerSource) {
          setPreviousPowerSource(powerSourceRef.current);
          powerSourceRef.current = nextReading.powerSource;
        }

        if (initializedRef.current) {
          setWasOnline(onlineRef.current);
        } else {
          initializedRef.current = true;
        }

        onlineRef.current = nextOnline;
        lastSignalAtRef.current = signalAt;
        setReading(nextReading);
        setLastUpdated(signalAt);
        setIsOnline(nextOnline);
        setError(null);
      });
    } catch (err) {
      startTransition(() => {
        const lastSignalAt = lastSignalAtRef.current;
        const stillOnline = lastSignalAt != null && Date.now() - lastSignalAt < staleAfterMs;

        if (initializedRef.current) {
          setWasOnline(onlineRef.current);
        }

        onlineRef.current = stillOnline;
        setIsOnline(stillOnline);
        setError(err);
      });
    } finally {
      setLoading(false);
    }
  }, [staleAfterMs]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchReading();
    }, 0);
    const intervalId = window.setInterval(() => {
      void fetchReading();
    }, pollMs);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [fetchReading, pollMs]);

  return {
    reading,
    error,
    isOnline,
    loading,
    lastUpdated,
    previousPowerSource,
    wasOnline,
    refetch: fetchReading,
  };
}
