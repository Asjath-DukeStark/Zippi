/**
 * Safely triggers mobile device vibration using the Web Vibration API.
 * Patterns:
 * - 'light' (default): 15ms single pulse for standard clicks, button taps, increment/decrement
 * - 'medium': 30ms single pulse for modal overlays, drawer toggles
 * - 'double': [15, 50, 15] for add-to-cart operations or wishlist toggles
 * - 'success': [15, 30, 15] double tap for successful orders or saved state confirmations
 * - 'error': [50, 50, 50] triple heartbeat for cancellations, errors, or empty state triggers
 */
export const triggerHapticFeedback = (pattern: 'light' | 'medium' | 'double' | 'success' | 'error' | number | number[] = 'light') => {
  if (typeof window !== 'undefined' && window.navigator && typeof window.navigator.vibrate === 'function') {
    try {
      const isEnabled = localStorage.getItem('zippi_haptic_enabled') !== 'false';
      if (!isEnabled) {
        return;
      }
      let vibrationPattern: number | number[];
      if (pattern === 'light') {
        vibrationPattern = 15;
      } else if (pattern === 'medium') {
        vibrationPattern = 30;
      } else if (pattern === 'double') {
        vibrationPattern = [15, 50, 15];
      } else if (pattern === 'success') {
        vibrationPattern = [15, 30, 15];
      } else if (pattern === 'error') {
        vibrationPattern = [50, 50, 50];
      } else {
        vibrationPattern = pattern;
      }
      window.navigator.vibrate(vibrationPattern);
    } catch (e) {
      // Safe fallback if permission is denied, sandboxed in iframe, or unsupported
    }
  }
};
