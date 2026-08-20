"use client";

import { GradientText } from "@/components/shared/primitives";
import { Briefcase } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-blue-500/10">
          <Briefcase className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">
            <GradientText>Services Management</GradientText>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your service offerings and descriptions
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-surface/60 p-8 text-center">
        <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Services Section</h2>
        <p className="text-muted-foreground">
          This section will allow you to manage services, add new offerings, and update existing service information.
        </p>
      </div>
    </div>
  );
}