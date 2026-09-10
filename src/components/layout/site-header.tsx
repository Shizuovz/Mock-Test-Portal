import { getPortalAccessStatus } from "@/lib/billing/billing-service";
import { MainNav } from "@/components/layout/main-nav";

export async function SiteHeader() {
  const access = await getPortalAccessStatus();
  return <MainNav access={access} />;
}
