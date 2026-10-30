"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetFindingQuery, useRegenerateFindingExplanationMutation } from "@/features/findings/findings-api";
import { useSelector } from "react-redux";
import { selectCurrentOrgId } from "@/store/org-slice";

export function ExplanationPanel({ findingId }: { findingId: string }) {
  const orgId = useSelector(selectCurrentOrgId);
  const { data: finding, isLoading } = useGetFindingQuery(
    { organizationId: orgId!, findingId },
    { skip: !orgId, pollingInterval: 2000 }
  );
  const explanation = finding?.explanation;
  const [regenerate, { isLoading: regenerating }] = useRegenerateFindingExplanationMutation();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 120000);
    return () => clearTimeout(t);
  }, []);

  if (isLoading && !explanation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI explanation — AI-generated from the evidence above</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  const status = explanation?.status || "PENDING";

  if (status === "PENDING" || status === "GENERATING") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI explanation — AI-generated from the evidence above</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Generating explanation...</p>
          {slow && <p className="text-xs text-muted-foreground mt-1">This is taking longer than expected.</p>}
        </CardContent>
      </Card>
    );
  }

  if (status === "FAILED") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI explanation — AI-generated from the evidence above</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">{explanation?.errorMessage || "Failed to generate explanation."}</p>
          <Button
            size="sm"
            onClick={async () => {
              await regenerate({ organizationId: orgId!, findingId });
            }}
            disabled={regenerating}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI explanation — AI-generated from the evidence above</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {explanation?.summary && (
          <div>
            <div className="font-medium mb-1">Summary</div>
            <p className="whitespace-pre-wrap">{explanation.summary}</p>
          </div>
        )}
        {explanation?.observedFacts && explanation.observedFacts.length > 0 && (
          <div>
            <div className="font-medium mb-1">Observed facts</div>
            <ul className="list-disc pl-5 space-y-1">
              {explanation.observedFacts.map((f: any, i: number) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
        {explanation?.associatedSignals && explanation.associatedSignals.length > 0 && (
          <div>
            <div className="font-medium mb-1">Associated signals</div>
            <ul className="list-disc pl-5 space-y-1">
              {explanation.associatedSignals.map((f: any, i: number) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
        {explanation?.possibleExplanations && explanation.possibleExplanations.length > 0 && (
          <div>
            <div className="font-medium mb-1">Possible explanations (hypotheses, not confirmed)</div>
            <ul className="list-disc pl-5 space-y-1">
              {explanation.possibleExplanations.map((f: any, i: number) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
        {explanation?.investigationSteps && explanation.investigationSteps.length > 0 && (
          <div>
            <div className="font-medium mb-1">Investigation steps</div>
            <ul className="list-disc pl-5 space-y-1">
              {explanation.investigationSteps.map((f: any, i: number) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
        {explanation?.whatWeDontKnow && explanation.whatWeDontKnow.length > 0 && (
          <div>
            <div className="font-medium mb-1">What we don&apos;t know</div>
            <ul className="list-disc pl-5 space-y-1">
              {explanation.whatWeDontKnow.map((f: any, i: number) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}
        {explanation?.rawText && !explanation.summary && (
          <p className="whitespace-pre-wrap">{explanation.rawText}</p>
        )}
      </CardContent>
    </Card>
  );
}