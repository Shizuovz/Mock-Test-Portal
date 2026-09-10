import { MainNav } from "@/components/layout/main-nav";
import { getPortalAccessStatus } from "@/lib/billing/billing-service";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getPortalAccessStatus();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <MainNav access={access} />
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </div>
  );
}
