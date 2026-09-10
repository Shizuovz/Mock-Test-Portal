import { notFound } from "next/navigation";
import { ResultReviewShell } from "@/components/test/result-review-shell";
import { SiteHeader } from "@/components/layout/site-header";
import { getCatalogTestById } from "@/lib/content/catalog";
import {
  getLatestSubmittedResultForTest,
  getSubmittedResultForAttempt,
} from "@/lib/test-engine/result";
import { getPortalAccessStatus } from "@/lib/billing/billing-service";

export const dynamic = "force-dynamic";

type TestResultPageProps = {
  params: Promise<{
    testId: string;
  }>;
  searchParams: Promise<{
    attemptId?: string;
  }>;
};

export default async function TestResultPage({
  params,
  searchParams,
}: TestResultPageProps) {
  const { testId } = await params;
  const { attemptId } = await searchParams;
  const test = await getCatalogTestById(testId);

  if (!test) {
    notFound();
  }

  const serverPayload = attemptId
    ? await getSubmittedResultForAttempt(attemptId)
    : await getLatestSubmittedResultForTest(test.id);

  const access = await getPortalAccessStatus();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <div className="flex-1">
        <ResultReviewShell testId={test.id} serverPayload={serverPayload} access={access} />
      </div>
    </div>
  );
}
