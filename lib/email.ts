import 'server-only';
import { Resend } from 'resend';
import sgMail from '@sendgrid/mail';
import type { BookingNotification, EmailConfig } from '@/types';
import { toJSTString } from '@/utils/time';

const emailConfig: EmailConfig = {
  provider: (process.env.EMAIL_PROVIDER as 'resend' | 'sendgrid') || 'resend',
  apiKey: process.env.EMAIL_PROVIDER === 'sendgrid' 
    ? process.env.SENDGRID_API_KEY! 
    : process.env.RESEND_API_KEY!,
  fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
};

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(emailConfig.apiKey);
  }
  return resendClient;
}

function initSendGrid(): void {
  sgMail.setApiKey(emailConfig.apiKey);
}

export async function sendBookingConfirmation(notification: BookingNotification): Promise<void> {
  const subject = '予約確認 - ご予約が完了しました';
  const htmlContent = generateBookingEmail(notification);
  const textContent = generateBookingEmailText(notification);

  try {
    if (emailConfig.provider === 'resend') {
      await sendWithResend({
        to: notification.to,
        subject,
        html: htmlContent,
        text: textContent,
      });
    } else {
      await sendWithSendGrid({
        to: notification.to,
        subject,
        html: htmlContent,
        text: textContent,
      });
    }
  } catch (error) {
    console.error('メール送信エラー:', error);
    throw new Error('メール送信に失敗しました');
  }
}

async function sendWithResend({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resend = getResendClient();
  
  const { error } = await resend.emails.send({
    from: emailConfig.fromEmail,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw error;
  }
}

async function sendWithSendGrid({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  initSendGrid();

  const msg = {
    to,
    from: emailConfig.fromEmail,
    subject,
    html,
    text,
  };

  await sgMail.send(msg);
}

function generateBookingEmail(notification: BookingNotification): string {
  const startJST = toJSTString(notification.startTime);
  const endJST = toJSTString(notification.endTime);

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>予約確認</title>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
            .booking-details { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>予約確認</h1>
            </div>
            <div class="content">
                <p>${notification.customerName} 様</p>
                <p>この度はご予約いただき、ありがとうございます。<br>以下の内容で予約が確定いたしました。</p>
                
                <div class="booking-details">
                    <h3>予約詳細</h3>
                    <p><strong>予約ID:</strong> ${notification.bookingId}</p>
                    <p><strong>リソース:</strong> ${notification.resourceName}</p>
                    <p><strong>日時:</strong> ${startJST} ～ ${endJST.split(' ')[1]}</p>
                </div>

                <p>当日はお時間に遅れないようお越しください。</p>
                <p>ご質問がございましたら、お気軽にお問い合わせください。</p>
            </div>
            <div class="footer">
                <p>このメールは予約システムより自動送信されています。</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function generateBookingEmailText(notification: BookingNotification): string {
  const startJST = toJSTString(notification.startTime);
  const endJST = toJSTString(notification.endTime);

  return `
予約確認

${notification.customerName} 様

この度はご予約いただき、ありがとうございます。
以下の内容で予約が確定いたしました。

【予約詳細】
予約ID: ${notification.bookingId}
リソース: ${notification.resourceName}
日時: ${startJST} ～ ${endJST.split(' ')[1]}

当日はお時間に遅れないようお越しください。
ご質問がございましたら、お気軽にお問い合わせください。

---
このメールは予約システムより自動送信されています。
  `;
}