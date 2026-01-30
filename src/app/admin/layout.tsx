import { protectRoute } from '@/lib/session';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await protectRoute('admin'); // Validates session + admin role

    return <>{children}</>;
}