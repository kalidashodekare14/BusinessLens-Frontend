"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { organizationSchema, type OrganizationFormValues } from "@/features/auth/schemas";
import { useCreateOrganizationMutation, useLoadDemoDataMutation } from "@/features/auth/auth-api";
import { useAppDispatch } from "@/store/hooks";
import { setCurrentOrganizationId } from "@/store/org-slice";
import { normalizeError } from "@/store/base-api";

const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "BDT", label: "BDT" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<1 | 2>(1);
  const [createOrg, { isLoading: creating }] = useCreateOrganizationMutation();
  const [loadDemoData, { isLoading: loadingDemo }] = useLoadDemoDataMutation();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const browserTz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      currency: "USD",
      timezone: browserTz,
    },
    mode: "onSubmit",
  });

  const onCreateOrg = async (values: OrganizationFormValues) => {
    setServerError(null);
    try {
      const result = await createOrg(values).unwrap();
      const id = (result as any)?.id || (result as any)?.data?.id;
      if (id) {
        setOrgId(id);
        dispatch(setCurrentOrganizationId(id));
      }
      setStep(2);
    } catch (err: any) {
      const apiErr = normalizeError(err);
      if (apiErr.status === 0) {
        setServerError("Network error. Please try again.");
        return;
      }
      setServerError(apiErr.message || "Failed to create organization.");
    }
  };

  const handleLoadDemo = async () => {
    if (!orgId) {
      toast.error("Please create your business first");
      setStep(1);
      return;
    }
    try {
      await loadDemoData(orgId).unwrap();
      toast.success("Demo data loaded");
      router.push("/dashboard");
    } catch (err: any) {
      const apiErr = normalizeError(err);
      toast.error(apiErr.message || "Failed to load demo data");
    }
  };

  const handleStartImport = () => {
    router.push("/imports/new");
  };

  const handleLater = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8">
        <div className="mb-8 text-center">
          <div className="mb-4 text-sm text-muted-foreground">
            {step === 1 ? "1 Business · 2 Data" : "1 Business · 2 Data"}
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              1
            </div>
            <div className={`h-px w-16 ${step >= 2 ? "bg-primary" : "bg-border"}`} />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              2
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Create your business</h1>
            </div>
            {serverError ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </div>
            ) : null}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateOrg)} className="space-y-4" noValidate>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Acme Store" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Used to display amounts. One currency per workspace.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time zone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? "Creating..." : "Continue"}
                </Button>
              </form>
            </Form>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Add your data</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Try with demo data</h3>
                  <p className="text-sm text-muted-foreground">
                    Sample orders for about 5 months. See findings in under a minute.
                  </p>
                </div>
                <Button onClick={handleLoadDemo} disabled={loadingDemo} className="w-full">
                  {loadingDemo ? "Loading..." : "Load demo data"}
                </Button>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Import my CSV</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your orders and products files and map the columns.
                  </p>
                </div>
                <Button onClick={handleStartImport} variant="outline" className="w-full">
                  Start import
                </Button>
              </div>
            </div>
            <div className="text-center">
            <button onClick={handleLater} className="text-sm text-muted-foreground hover:text-foreground">
              I&apos;ll do this later
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
