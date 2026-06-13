import { getAppContext } from "@/lib/context";
import { Card, PageHeader } from "@/components/ui";
import { NewRequestForm } from "@/components/new-request-form";
import { formatMoney } from "@/lib/format";

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; category?: string; amount?: string; description?: string }>;
}) {
  const ctx = (await getAppContext())!;
  const sp = await searchParams;
  const resubmitting = Boolean(sp.title || sp.amount || sp.description);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title={resubmitting ? "Resubmit request" : "New expense request"}
        description={
          resubmitting
            ? "We pre-filled this from your earlier request. Edit anything, then submit a fresh one."
            : `Submit to ${ctx.org.name} for review.`
        }
      />
      <Card className="p-6 sm:p-8">
        <NewRequestForm
          currency={ctx.org.default_currency}
          threshold={formatMoney(ctx.org.approval_threshold_minor, ctx.org.default_currency)}
          defaults={{
            title: sp.title,
            category: sp.category,
            amount: sp.amount,
            description: sp.description,
          }}
        />
      </Card>
    </div>
  );
}
