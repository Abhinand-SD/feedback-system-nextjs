import { protectRoute } from '@/lib/session';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await protectRoute(); // Validates session, redirects if invalid

    return <>{children}</>;
}
