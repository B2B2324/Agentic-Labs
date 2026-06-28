import 'dotenv/config';
import { App } from '@slack/bolt';
import { sendOutreachMessage } from './services/outreach.service.js';

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

console.log('🚀 Slack Outreach Agent starting...');

// Test command
slackApp.command('/trackply-test', async ({ ack, respond, payload }) => {
  await ack();

  const testUserId = payload.user_id; // sends to the person who ran the command
  const message = `Hey! This is a test message from the Trackply Slack Outreach Agent. Built with Agentic Labs.

Check it out: https://trackply.com`;

  const result = await sendOutreachMessage(slackApp, testUserId, message);

  if (result.success) {
    await respond('Test message sent successfully!');
  } else {
    await respond(`Failed to send: ${result.reason}`);
  }
});

// Simple ping
slackApp.message('ping', async ({ say }) => {
  await say('Pong! Slack Outreach Agent is running.');
});

(async () => {
  await slackApp.start();
  console.log('✅ Slack Outreach Agent is live!');
})();