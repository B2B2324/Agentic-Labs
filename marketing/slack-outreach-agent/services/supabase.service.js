import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function logOutreach({ userId, slackUserId, message, status }) {
  const { error } = await supabase
    .from('slack_outreach_log')
    .insert({
      user_id: userId,
      slack_user_id: slackUserId,
      message,
      status,
      sent_at: new Date().toISOString()
    });

  if (error) console.error('Supabase log error:', error);
}

export async function getOutreachStats() {
  const { data, error } = await supabase
    .from('slack_outreach_log')
    .select('status', { count: 'exact' })
    .gte('sent_at', new Date(new Date().setHours(0,0,0,0)).toISOString());

  if (error) return { sentToday: 0 };
  return { sentToday: data?.length || 0 };
}