import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { getTargetTemperature, setTargetTemperature } from '../api/endpoints';
import { toNumber, pickObject } from '../utils/data';

function extractTargetC(payload) {
  const container = pickObject(payload, ['target', 'data']);
  const candidates = [
    payload,
    payload?.targetC,
    payload?.target,
    container?.targetC,
    container?.target,
    container?.value,
  ];

  for (const candidate of candidates) {
    const parsed = toNumber(candidate);
    if (parsed != null) {
      return parsed;
    }
  }

  return null;
}

export function useTargetTemperature() {
  const [targetC, setTargetC] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const targetRef = useRef(null);

  const refreshTarget = useCallback(async () => {
    try {
      const payload = await getTargetTemperature();
      const nextTarget = extractTargetC(payload);

      startTransition(() => {
        targetRef.current = nextTarget;
        setTargetC(nextTarget);
        setError(null);
      });
    } catch (err) {
      startTransition(() => {
        setError(err);
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTarget = useCallback(async (nextTarget) => {
    const previousTarget = targetRef.current;

    startTransition(() => {
      targetRef.current = nextTarget;
      setTargetC(nextTarget);
      setSaving(true);
      setError(null);
    });

    try {
      const payload = await setTargetTemperature(nextTarget);
      const confirmedTarget = extractTargetC(payload);

      startTransition(() => {
        if (confirmedTarget != null) {
          targetRef.current = confirmedTarget;
          setTargetC(confirmedTarget);
        }
      });
    } catch (err) {
      startTransition(() => {
        targetRef.current = previousTarget;
        setTargetC(previousTarget);
        setError(err);
      });
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshTarget();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshTarget]);

  return {
    targetC,
    error,
    loading,
    saving,
    refreshTarget,
    updateTarget,
  };
}
