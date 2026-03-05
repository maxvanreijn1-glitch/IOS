import { NextResponse } from 'next/server';
import { sign } from '../../lib/jwt';
import { getUserByEmail } from '../../lib/auth';

export async function POST(request) {
    const { email, password } = await request.json();

    const user = await getUserByEmail(email);
    // Add your existing authentication logic here
    const isValid = (user && user.password === password); // Example validation

    if (!isValid) return new Response('Unauthorized', { status: 401 });

    // User authenticated, set session cookie
    const token = sign(user);
    const response = NextResponse.json({ user });
    response.cookies.set('session', user.sessionId); // Set existing session cookie
    response.headers.set('Authorization', `Bearer ${token}`); // Optional: if needed in the response header
    return response;
}