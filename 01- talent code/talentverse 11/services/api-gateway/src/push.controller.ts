
import { Controller, Post, Body } from '@nestjs/common';
import * as webpush from 'web-push';

webpush.setVapidDetails(
  process.env.WEBPUSH_SUBJECT || 'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

@Controller('v1/push')
export class PushController {
  @Post('subscribe')
  async subscribe(@Body() body: any){
    // body: { userId, subscription: { endpoint, keys:{p256dh, auth} } }
    // TODO: persist to DB; simplified here
    // In production, save to push_subscription table
    return { ok: true }
  }

  @Post('send')
  async send(@Body() body: any){
    // body: { userId, title, message, subscription }
    const payload = JSON.stringify({ title: body.title || 'TalentVerse', body: body.message || 'Hello' })
    await webpush.sendNotification(body.subscription, payload)
    return { ok: true }
  }
}
