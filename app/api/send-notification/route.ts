import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route für E-Mail-Benachrichtigungen
 * 
 * Diese Route ist vorbereitet für die Integration mit einem E-Mail-Service
 * wie Resend, SendGrid oder ähnlichen Diensten.
 * 
 * Aktuell als Mock-Funktion implementiert - aktivieren Sie den E-Mail-Service
 * in der sendEmail-Funktion.
 */

interface NotificationRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Mock-Funktion für E-Mail-Versand
 * Ersetzen Sie diese Funktion mit der tatsächlichen E-Mail-API-Integration
 */
async function sendEmail(data: NotificationRequest): Promise<boolean> {
  // TODO: Integrieren Sie hier Ihren E-Mail-Service
  // Beispiel für Resend:
  /*
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    await resend.emails.send({
      from: 'PetriMarkt <noreply@petrimarkt.ch>',
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
  */

  // Mock: Logge die E-Mail-Daten (nur für Entwicklung)
  console.log('📧 Mock E-Mail würde gesendet werden:', {
    to: data.to,
    subject: data.subject,
    html: data.html.substring(0, 100) + '...',
  });

  // Simuliere erfolgreichen Versand
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    // Validierung
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // E-Mail senden
    const success = await sendEmail({ to, subject, html, text });

    if (success) {
      return NextResponse.json(
        { message: 'Notification sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-notification route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET-Methode für Health-Check
export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok',
      message: 'Notification API is ready',
      note: 'Currently running in mock mode. Configure your email service to enable actual sending.'
    },
    { status: 200 }
  );
}


