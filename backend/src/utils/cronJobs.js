import { releaseExpiredHolds } from '../services/bookingService.js';
import { reconcileExpiredSubscriptions } from '../services/subscriptionService.js';

let intervalId = null;

export const startCronJobs = () => {
  console.log('[Scheduler] Background reconciliation engine started (running every 60 seconds).');

  // Run immediately on boot
  releaseExpiredHolds();
  reconcileExpiredSubscriptions();

  // Then interval every 60 seconds
  intervalId = setInterval(async () => {
    try {
      await releaseExpiredHolds();
      await reconcileExpiredSubscriptions();
    } catch (err) {
      console.error('[Scheduler] Error running background tasks:', err);
    }
  }, 60 * 1000);
};

export const stopCronJobs = () => {
  if (intervalId) {
    clearInterval(intervalId);
    console.log('[Scheduler] Background jobs stopped.');
  }
};

