import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function authenticate() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        return decoded; // { userId, role }
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}
