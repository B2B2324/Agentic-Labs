import { logOutreach } from './supabase.service.js';
import { RateLimiter } from '../utils/rate-limiter.js';

const rateLimiter = new RateLimiter(40); // 40 messages per day default

export async function sendOutreachMessage(slackApp, slackUserId, message) {
  if (!rateLimiter.canSend()) {
    console.log('Daily limit reached');
    return { success: false, reason: 'daily_limit_reached' };
  }

  try {
    await slackApp.client.chat.postMessage({
      channel: slackUserId,
      text: message
    });

    rateLimiter.recordSend();
    await logOutreach({
      userId: null, // we'll link this later
      slackUserId,
      message,
      status: 'sent'
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send DM:', error);
    await logOutreach({
      userId: null,
      slackUserId,
      message,
      status: 'failed'
    });
    return { success: false, reason: error.message };
  }
}