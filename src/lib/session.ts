import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return decoded as { userId: string; role: 'user' | 'admin' };
    } catch (error) {
        return null;
    }
}

export async function protectRoute(role?: 'admin' | 'user') {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    if (role && session.role !== role) {
        if (role === 'admin') {
            redirect('/dashboard');
        } else {
            // If we ever have a strictly user-only route that admins shouldn't see
            // redirect('/admin'); 
        }
    }

    return session;
}
