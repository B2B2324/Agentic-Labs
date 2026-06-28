import 'dotenv/config';
import { App } from '@slack/bolt';
import { createClient } from '@supabase/supabase-js';

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🚀 Slack Outreach Agent starting...');

slackApp.message('ping', async ({ say }) => {
  await say('Pong! Slack Outreach Agent is running.');
});

// TODO: Add outreach queue logic, rate limiting, and DM sending here

(async () => {
  await slackApp.start();
  console.log('✅ Slack Outreach Agent is live!');
})();