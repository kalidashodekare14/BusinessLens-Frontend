"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLoadDemoDataMutation } from "@/features/auth/auth-api";

export function NoDataState({ organizationId }: { organizationId: string | null }) {
  const router = useRouter();
  const [loadDemo, { isLoading }] = useLoadDemoDataMutation();

  const handleDemo = async () => {
    if (!organizationId) return;
    await loadDemo(organizationId).unwrap();
    router.push("/dashboard");
  };

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Add your data to get started</h3>
          <p className="text-sm text-muted-foreground">Load demo data to explore, or import your own CSV.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDemo} disabled={isLoading || !organizationId}>
            Load demo data
          </Button>
          <Button variant="outline" onClick={() => router.push("/imports/new")}>
            Import CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
