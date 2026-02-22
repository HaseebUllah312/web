import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!clientId) {
        console.error('GOOGLE_CLIENT_ID is not set in environment variables.');
        return NextResponse.json(
            { error: 'OAuth is not configured. GOOGLE_CLIENT_ID is missing.' },
            { status: 500 }
        );
    }

    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        client_id: clientId,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };

    const qs = new URLSearchParams(options);

    return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
}
