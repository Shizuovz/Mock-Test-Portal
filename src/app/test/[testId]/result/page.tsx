import { notFound } from "next/navigation";
import { ResultReviewShell } from "@/components/test/result-review-shell";
import { getCatalogTestById } from "@/lib/content/catalog";
import {
  getLatestSubmittedResultForTest,
  getSubmittedResultForAttempt,
} from "@/lib/test-engine/result";

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

  return <ResultReviewShell testId={test.id} serverPayload={serverPayload} />;
}
