import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/context";
import { Card } from "@/components/ui";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const ctx = (await getAppContext())!;
  if (ctx.role !== "admin") redirect("/dashboard");

  const threshold = (ctx.org.approval_threshold_minor / 100).toFixed(2);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Organization settings</h1>
        <p className="text-sm text-slate-500">Currency and approval policy for {ctx.org.name}.</p>
      </div>
      <Card className="p-6">
        <SettingsForm
          name={ctx.org.name}
          currency={ctx.org.default_currency}
          threshold={threshold}
        />
      </Card>
    </div>
  );
}
