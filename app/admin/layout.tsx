import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import AccessDenied from "@/components/ui/AccessDenied";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // 1. Ensure the user is authenticated via Clerk
  if (!userId) {
    return <AccessDenied />;
  }

  // 2. Fetch the user from the database to verify their role
  const user = await prisma.user.findUnique({
    where: { clerkID: userId },
    select: { role: true },
  });

  // 3. Prevent access if user does not exist or lacks ADMIN privileges
  if (!user || user.role !== "ADMIN") {
    return <AccessDenied />;
  }

  // 4. Render the authorized admin routes (e.g., product creation page)
  return <>{children}</>;
}
