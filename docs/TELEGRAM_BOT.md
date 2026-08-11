# Telegram birthday bot (Shajira)

Posts “Happy birthday” in your family Telegram group at ~10:00 in a chosen
timezone, with the age they turn and a birthday card image. Also DMs the
person when they have linked the bot with `/start`.

## 1. Create the bot (once)

1. Open Telegram → [@BotFather](https://t.me/BotFather)
2. `/newbot` — name e.g. `Shajira Birthdays`, username e.g. `shajira_birthdays_bot`
3. Copy the **bot token**
4. Optional: `/setjoingrouproups` → Enable (so you can add it to a family group)
5. `/setprivacy` → **Disable** (needed so the bot sees group add events reliably)

## 2. Secrets in Supabase

Project → **Edge Functions** → Secrets (or CLI):

```bash
supabase secrets set TELEGRAM_BOT_TOKEN="123456:ABC..."
supabase secrets set TELEGRAM_WEBHOOK_SECRET="pick-a-long-random-string"
supabase secrets set TELEGRAM_CRON_SECRET="pick-another-long-random-string"
# Already present for other functions — reuse:
# SUPABASE_SERVICE_ROLE_KEY / SUPABASE_URL are injected automatically on hosted Edge Functions
```

Also set (Dashboard → Project Settings → Edge Functions → Secrets) if not auto:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET` — any long random string; Telegram will send it as `X-Telegram-Bot-Api-Secret-Token`
- `TELEGRAM_CRON_SECRET` — same value as GitHub Action secret `SHAJIRA_TELEGRAM_CRON_SECRET`

## 3. Run the SQL migration

In Supabase → SQL Editor, run:

`supabase/migrations/20260810000001_telegram_birthday_bot.sql`

## 4. Deploy Edge Functions

```bash
cd familytree-x2
supabase functions deploy telegram-webhook
supabase functions deploy birthday-telegram
```

Point Telegram at the webhook (replace PROJECT_REF and secrets):

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://PROJECT_REF.supabase.co/functions/v1/telegram-webhook" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET" \
  -d "allowed_updates=[\"message\",\"my_chat_member\"]"
```

## 5. Hourly cron

Supabase → Database → Extensions → enable `pg_cron` and `pg_net` (if available),
then run:

```sql
-- Call the birthday function every hour (UTC). The function itself checks
-- the family timezone + send_hour before posting.
select cron.schedule(
  'shajira-birthday-telegram',
  '5 * * * *',
  $$
  select net.http_post(
    url := 'https://PROJECT_REF.supabase.co/functions/v1/birthday-telegram',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

If `pg_net` / storing the service role in DB is awkward on free tier, use a
**GitHub Action** instead (see `.github/workflows/birthday-telegram.yml`).

GitHub → repo **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `SHAJIRA_TELEGRAM_CRON_SECRET` | Same as Supabase `TELEGRAM_CRON_SECRET` |

The workflow already uses the public Supabase URL for this project.

## 6. In the app (owner)

Settings → **Telegram birthdays**:

1. Turn **Enabled** on
2. Pick timezone (e.g. Pacific Time) and hour (default 10)
3. Open the bot link, add the bot to your family group
4. Tap **Test send** once the group id is captured
5. For DMs: create a link for a person and have them open it in Telegram

## Limits

- Needs full birth dates (`YYYY-MM-DD`). Year-only rows are skipped.
- One family timezone for the group (not GPS).
- Each person must `/start` (or open their invite link) once for private DMs.
