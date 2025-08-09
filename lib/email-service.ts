import { Resend } from 'resend';
import sgMail from '@sendgrid/mail';

export interface BookingEmailData {
  bookingId: string;
  resourceName: string;
  customerName?: string;
  customerEmail: string;
  dateTime: string; // JST format
  cancelUrl: string;
  adminEmail?: string;
}

export interface EmailProvider {
  sendBookingConfirmation(data: BookingEmailData): Promise<void>;
  sendAdminNotification(data: BookingEmailData): Promise<void>;
}

class ResendProvider implements EmailProvider {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendBookingConfirmation(data: BookingEmailData): Promise<void> {
    const html = this.generateUserConfirmationHtml(data);
    
    await this.resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: data.customerEmail,
      subject: '【予約確認】ご予約が確定しました',
      html,
    });
  }

  async sendAdminNotification(data: BookingEmailData): Promise<void> {
    const html = this.generateAdminNotificationHtml(data);
    
    await this.resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: data.adminEmail!,
      subject: '【新規予約】新しい予約が作成されました',
      html,
    });
  }

  private generateUserConfirmationHtml(data: BookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>予約確認</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>予約確認</h1>
          </div>
          <div class="content">
            <p>この度はご予約いただきありがとうございます。</p>
            <p>ご予約が確定いたしましたのでお知らせいたします。</p>
            
            <div class="booking-info">
              <h2>予約情報</h2>
              <p><strong>予約ID:</strong> ${data.bookingId}</p>
              <p><strong>お名前:</strong> ${data.customerName || data.customerEmail}</p>
              <p><strong>店舗:</strong> ${data.resourceName}</p>
              <p><strong>日時:</strong> ${data.dateTime}</p>
            </div>
            
            <p>予約の変更やキャンセルをご希望の場合は、以下のボタンからお手続きください。</p>
            
            <div style="text-align: center;">
              <a href="${data.cancelUrl}" class="button">予約をキャンセル</a>
            </div>
            
            <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
            <p>当日お会いできることを楽しみにしております。</p>
          </div>
          <div class="footer">
            <p>このメールは自動送信されています。</p>
            <p>© 2024 予約システム</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateAdminNotificationHtml(data: BookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>新規予約通知</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 新規予約が作成されました</h1>
          </div>
          <div class="content">
            <p>新しい予約が作成されました。詳細をご確認ください。</p>
            
            <div class="booking-info">
              <h2>予約詳細</h2>
              <p><strong>予約ID:</strong> ${data.bookingId}</p>
              <p><strong>お客様名:</strong> ${data.customerName || data.customerEmail}</p>
              <p><strong>メールアドレス:</strong> ${data.customerEmail}</p>
              <p><strong>店舗:</strong> ${data.resourceName}</p>
              <p><strong>日時:</strong> ${data.dateTime}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.PUBLIC_SITE_URL}/admin" class="button">管理画面で確認</a>
            </div>
            
            <p>必要に応じて、お客様にご連絡をお取りください。</p>
          </div>
          <div class="footer">
            <p>このメールは自動送信されています。</p>
            <p>© 2024 予約システム - 管理者通知</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

class SendGridProvider implements EmailProvider {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async sendBookingConfirmation(data: BookingEmailData): Promise<void> {
    const html = this.generateUserConfirmationHtml(data);
    
    await sgMail.send({
      from: 'noreply@yourdomain.com',
      to: data.customerEmail,
      subject: '【予約確認】ご予約が確定しました',
      html,
    });
  }

  async sendAdminNotification(data: BookingEmailData): Promise<void> {
    const html = this.generateAdminNotificationHtml(data);
    
    await sgMail.send({
      from: 'noreply@yourdomain.com',
      to: data.adminEmail!,
      subject: '【新規予約】新しい予約が作成されました',
      html,
    });
  }

  private generateUserConfirmationHtml(data: BookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>予約確認</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4f46e5; }
          .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>予約確認</h1>
          </div>
          <div class="content">
            <p>この度はご予約いただきありがとうございます。</p>
            <p>ご予約が確定いたしましたのでお知らせいたします。</p>
            
            <div class="booking-info">
              <h2>予約情報</h2>
              <p><strong>予約ID:</strong> ${data.bookingId}</p>
              <p><strong>お名前:</strong> ${data.customerName || data.customerEmail}</p>
              <p><strong>店舗:</strong> ${data.resourceName}</p>
              <p><strong>日時:</strong> ${data.dateTime}</p>
            </div>
            
            <p>予約の変更やキャンセルをご希望の場合は、以下のボタンからお手続きください。</p>
            
            <div style="text-align: center;">
              <a href="${data.cancelUrl}" class="button">予約をキャンセル</a>
            </div>
            
            <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
            <p>当日お会いできることを楽しみにしております。</p>
          </div>
          <div class="footer">
            <p>このメールは自動送信されています。</p>
            <p>© 2024 予約システム</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateAdminNotificationHtml(data: BookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>新規予約通知</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669; }
          .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 新規予約が作成されました</h1>
          </div>
          <div class="content">
            <p>新しい予約が作成されました。詳細をご確認ください。</p>
            
            <div class="booking-info">
              <h2>予約詳細</h2>
              <p><strong>予約ID:</strong> ${data.bookingId}</p>
              <p><strong>お客様名:</strong> ${data.customerName || data.customerEmail}</p>
              <p><strong>メールアドレス:</strong> ${data.customerEmail}</p>
              <p><strong>店舗:</strong> ${data.resourceName}</p>
              <p><strong>日時:</strong> ${data.dateTime}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.PUBLIC_SITE_URL}/admin" class="button">管理画面で確認</a>
            </div>
            
            <p>必要に応じて、お客様にご連絡をお取りください。</p>
          </div>
          <div class="footer">
            <p>このメールは自動送信されています。</p>
            <p>© 2024 予約システム - 管理者通知</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export class EmailService {
  private provider: EmailProvider;
  private adminEmail?: string;
  private siteUrl: string;

  constructor() {
    const resendApiKey = process.env.RESEND_API_KEY;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    
    if (resendApiKey) {
      this.provider = new ResendProvider(resendApiKey);
    } else if (sendgridApiKey) {
      this.provider = new SendGridProvider(sendgridApiKey);
    } else {
      throw new Error('メールプロバイダーのAPIキーが設定されていません (RESEND_API_KEY または SENDGRID_API_KEY)');
    }

    this.adminEmail = process.env.ADMIN_EMAIL;
    this.siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:3000';
  }

  async sendBookingEmails(
    bookingId: string,
    resourceName: string,
    customerName: string | undefined,
    customerEmail: string,
    dateTimeJST: string
  ): Promise<{ userEmailSent: boolean; adminEmailSent: boolean }> {
    const cancelUrl = `${this.siteUrl}/cancel/${bookingId}`;
    const emailData: BookingEmailData = {
      bookingId,
      resourceName,
      customerName,
      customerEmail,
      dateTime: dateTimeJST,
      cancelUrl,
      adminEmail: this.adminEmail,
    };

    let userEmailSent = false;
    let adminEmailSent = false;

    // ユーザーへの確認メール
    try {
      await this.provider.sendBookingConfirmation(emailData);
      userEmailSent = true;
      console.log(`✅ 予約確認メール送信成功: ${customerEmail} (予約ID: ${bookingId})`);
    } catch (error) {
      console.error(`❌ 予約確認メール送信失敗: ${customerEmail} (予約ID: ${bookingId})`, error);
    }

    // 管理者への通知メール
    if (this.adminEmail) {
      try {
        await this.provider.sendAdminNotification(emailData);
        adminEmailSent = true;
        console.log(`✅ 管理者通知メール送信成功: ${this.adminEmail} (予約ID: ${bookingId})`);
      } catch (error) {
        console.error(`❌ 管理者通知メール送信失敗: ${this.adminEmail} (予約ID: ${bookingId})`, error);
      }
    } else {
      console.warn('⚠️ ADMIN_EMAIL が設定されていません。管理者通知メールをスキップします。');
    }

    return { userEmailSent, adminEmailSent };
  }
}

// 必要なメール依存関係があるかチェック
export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);
}