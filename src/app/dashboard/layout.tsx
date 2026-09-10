import { SiteHeader } from "@/components/layout/site-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <SiteHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
