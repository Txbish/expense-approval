import { getAppContext } from "@/lib/context";
import { Card } from "@/components/ui";
import { NewRequestForm } from "@/components/new-request-form";
import { formatMoney } from "@/lib/format";

export default async function NewRequestPage() {
  const ctx = (await getAppContext())!;
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">New expense request</h1>
        <p className="text-sm text-slate-500">Submit to {ctx.org.name} for review.</p>
      </div>
      <Card className="p-6">
        <NewRequestForm
          currency={ctx.org.default_currency}
          threshold={formatMoney(ctx.org.approval_threshold_minor, ctx.org.default_currency)}
        />
      </Card>
    </div>
  );
}
