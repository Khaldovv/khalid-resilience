import { useState, useCallback, useRef } from 'react';

/**
 * ============================================================================
 *  useSubmitGuard — Red Team Auto-Fix for Race Conditions
 * ============================================================================
 *  Prevents:
 *  - Double/triple-click form submissions
 *  - Concurrent API calls creating duplicate entries
 *  - UI button spam during crisis situations
 *
 *  Usage:
 *    const { isSubmitting, guardedSubmit } = useSubmitGuard();
 *    <button onClick={guardedSubmit(handleSave)} disabled={isSubmitting}>
 * ============================================================================
 */
export function useSubmitGuard(cooldownMs = 2000) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitRef = useRef(0);

  const guardedSubmit = useCallback((fn) => {
    return async (...args) => {
      const now = Date.now();
      // Cooldown: reject if within cooldown window
      if (now - lastSubmitRef.current < cooldownMs) {
        console.warn('[SUBMIT GUARD] Rejected — cooldown active');
        return;
      }
      // Reject if already submitting
      if (isSubmitting) {
        console.warn('[SUBMIT GUARD] Rejected — already submitting');
        return;
      }

      lastSubmitRef.current = now;
      setIsSubmitting(true);
      try {
        await fn(...args);
      } catch (err) {
        console.error('[SUBMIT GUARD] Submission error:', err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [isSubmitting, cooldownMs]);

  return { isSubmitting, guardedSubmit };
}

/**
 * useDebounce — Debounced value for search/filter inputs
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef(null);

  useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timerRef.current);
  }, [value, delay])();

  return debouncedValue;
}

/**
 * Truncate text input to maxLength characters — for paste-bomb protection
 */
export function truncateInput(value, maxLength = 5000) {
  if (typeof value !== 'string') return value;
  return value.length > maxLength ? value.substring(0, maxLength) : value;
}

export default useSubmitGuard;
