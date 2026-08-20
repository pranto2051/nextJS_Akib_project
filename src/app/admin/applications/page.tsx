"use client";

import { GradientText } from "@/components/shared/primitives";
import { Users } from "lucide-react";

export default function ApplicationsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-pink-500/10">
          <Users className="h-6 w-6 text-pink-500" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">
            <GradientText>Applications Management</GradientText>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage job applications and career inquiries
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-surface/60 p-8 text-center">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Applications Section</h2>
        <p className="text-muted-foreground">
          This section will allow you to manage job applications, review candidates, and track hiring progress.
        </p>
      </div>
    </div>
  );
}