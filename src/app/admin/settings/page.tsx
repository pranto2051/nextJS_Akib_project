"use client";

import { GradientText } from "@/components/shared/primitives";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-purple-500/10">
          <Settings className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">
            <GradientText>Settings Management</GradientText>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure site settings and preferences
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-surface/60 p-8 text-center">
        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Settings Section</h2>
        <p className="text-muted-foreground">
          This section will allow you to manage site settings, configure SEO, update contact information, and customize the appearance.
        </p>
      </div>
    </div>
  );
}