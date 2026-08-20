"use client";

import { GradientText } from "@/components/shared/primitives";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-red-500/10">
          <MessageSquare className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">
            <GradientText>Messages Management</GradientText>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage contact messages and inquiries
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-surface/60 p-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Messages Section</h2>
        <p className="text-muted-foreground">
          This section will allow you to view and respond to contact messages from visitors.
        </p>
      </div>
    </div>
  );
}