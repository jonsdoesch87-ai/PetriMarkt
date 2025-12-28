/**
 * Analytics Helper Functions
 * DSGVO/nDSG compliant analytics management
 * 
 * Analytics collection is disabled by default and only enabled
 * when the user explicitly consents.
 */

import { analytics, enableAnalytics, disableAnalytics } from './firebase';
import { logEvent, EventNameString } from 'firebase/analytics';

/**
 * Check if analytics is available and enabled
 */
export const isAnalyticsEnabled = (): boolean => {
  return analytics !== null;
};

/**
 * Track a custom event (only if analytics is enabled)
 */
export const trackEvent = async (
  eventName: EventNameString | string,
  eventParams?: { [key: string]: any }
): Promise<void> => {
  if (!analytics || !isAnalyticsEnabled()) {
    return;
  }

  try {
    await logEvent(analytics, eventName as EventNameString, eventParams);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Track page view (only if analytics is enabled)
 */
export const trackPageView = async (pagePath: string): Promise<void> => {
  await trackEvent('page_view', {
    page_path: pagePath,
  });
};

/**
 * Initialize analytics consent
 * Call this when user accepts analytics cookies
 */
export const acceptAnalytics = async (): Promise<void> => {
  await enableAnalytics();
  // Track the consent event
  await trackEvent('analytics_consent', { consent: true });
};

/**
 * Revoke analytics consent
 * Call this when user rejects analytics cookies
 */
export const rejectAnalytics = async (): Promise<void> => {
  await disableAnalytics();
};

// Re-export analytics functions
export { enableAnalytics, disableAnalytics, analytics };


