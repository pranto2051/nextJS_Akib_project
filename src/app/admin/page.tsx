"use client";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  FileText,
  FolderKanban,
  Inbox,
  Mail,
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { GradientText } from "@/components/shared/primitives";
import { adminList, adminStats, leadStats } from "@/lib/admin.functions";

const queryClient = new QueryClient();

const STAT_META: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  services: { label: "Services", icon: Briefcase, color: "text-blue-500" },
  products: { label: "Products", icon: Package, color: "text-purple-500" },
  projects: { label: "Projects", icon: FolderKanban, color: "text-green-500" },
  blog_posts: { label: "Blog posts", icon: FileText, color: "text-orange-500" },
  contact_messages: { label: "Messages", icon: Inbox, color: "text-red-500" },
  applications: { label: "Applications", icon: Users, color: "text-pink-500" },
  newsletter_subscribers: { label: "Subscribers", icon: Mail, color: "text-cyan-500" },
};

const STATUS_ORDER = ["NEW", "CONTACTED", "INTERESTED", "CONVERTED", "LOST"] as const;

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500",
  CONTACTED: "bg-yellow-500",
  INTERESTED: "bg-purple-500",
  CONVERTED: "bg-green-500",
  LOST: "bg-red-500",
};

function AdminOverview() {
  const stats = useQuery({ queryKey: ["admin", "stats"], queryFn: adminStats });
  const leads = useQuery({ queryKey: ["admin", "lead-stats"], queryFn: leadStats });
  const messages = useQuery({
    queryKey: ["admin", "messages", "latest"],
    queryFn: () =>
      adminList({
        table: "contact_messages",
        orderBy: "created_at",
        ascending: false,
        limit: 6,
      }),
  });

  const counts = stats.data?.counts ?? {};
  const byStatus = leads.data?.byStatus ?? {};
  const maxStatus = Math.max(1, ...STATUS_ORDER.map((status) => byStatus[status] ?? 0));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            <GradientText>Dashboard Overview</GradientText>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {stats.data
              ? `${stats.data.unreadMessages} unread message${stats.data.unreadMessages === 1 ? "" : "s"}`
              : "Loading live counts…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            System Online
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="New requests today"
          value={leads.data?.today ?? "—"}
          accent
          icon={TrendingUp}
        />
        <Metric label="This week" value={leads.data?.week ?? "—"} icon={Clock} />
        <Metric
          label="Conversion rate"
          value={leads.data ? `${Math.round(leads.data.conversionRate * 100)}%` : "—"}
          icon={CheckCircle}
          accent
        />
        <Metric
          label="Avg. response time"
          value={
            leads.data?.avgHoursToContact != null
              ? `${leads.data.avgHoursToContact.toFixed(1)}h`
              : "—"
          }
          icon={AlertCircle}
        />
      </section>

      {/* Charts and Analytics */}
      <section className="grid gap-6 lg:grid-cols-2">
        <EnhancedCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold">Request Funnel</h2>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {STATUS_ORDER.map((status) => {
              const value = byStatus[status] ?? 0;
              const percentage = (value / maxStatus) * 100;
              return (
                <div key={status} className="group">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[status]}`} />
                      <span className="font-medium">{status}</span>
                    </div>
                    <span className="text-muted-foreground font-semibold">{value}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={`h-full rounded-full ${STATUS_COLORS[status]} transition-all duration-500 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </EnhancedCard>

        <EnhancedCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold">Product Interest</h2>
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-surface-2 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Most Requested</p>
              <p className="font-semibold text-lg">
                {leads.data?.topProduct?.[0] ?? "—"}
                {leads.data?.topProduct ? (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({leads.data.topProduct[1]} requests)
                  </span>
                ) : (
                  ""
                )}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-surface-2 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Top Category</p>
              <p className="font-semibold text-lg">{leads.data?.topCategory?.[0] ?? "—"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">All Products</p>
              {Object.entries(leads.data?.byProduct ?? {})
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([name, value]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <span className="text-sm truncate flex-1">{name}</span>
                    <span className="text-sm font-semibold text-muted-foreground ml-4">
                      {value}
                    </span>
                  </div>
                ))}
              {leads.data && Object.keys(leads.data.byProduct).length === 0 && (
                <p className="text-sm text-muted-foreground py-2">No requests yet.</p>
              )}
            </div>
          </div>
        </EnhancedCard>
      </section>

      {/* Content Statistics */}
      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Content Statistics</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(STAT_META).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <EnhancedCard key={key} className="p-5 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {meta.label}
                    </p>
                    <p className="font-display text-3xl font-bold">
                      {stats.isPending ? "—" : (counts[key] ?? 0)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg bg-surface-2 ${meta.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </EnhancedCard>
            );
          })}
        </div>
      </section>

      {/* Latest Messages */}
      <section>
        <h2 className="font-display text-xl font-semibold mb-4">Latest Contact Messages</h2>
        <EnhancedCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="hidden px-4 py-3 sm:table-cell font-semibold">Message</th>
                </tr>
              </thead>
              <tbody>
                {(messages.data ?? []).map((row) => (
                  <tr
                    key={String(row["id"])}
                    className="border-t border-border hover:bg-surface-2/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{String(row["name"] ?? "")}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {String(row["email"] ?? "")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-border/70 px-2 py-0.5 text-xs font-medium">
                        {String(row["status"] ?? "")}
                      </span>
                    </td>
                    <td className="hidden max-w-md truncate px-4 py-3 text-muted-foreground sm:table-cell">
                      {String(row["message"] ?? "")}
                    </td>
                  </tr>
                ))}
                {!messages.isPending && (messages.data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      No messages yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </EnhancedCard>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div
      className="rounded-xl border border-border/60 p-5"
      style={accent ? { backgroundImage: "var(--gradient-subtle)" } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-3 font-display text-3xl font-bold">{value}</p>
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-surface-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}

function EnhancedCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border/60 bg-surface/60 ${className}`}>
      {children}
    </div>
  );
}

function AdminPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminOverview />
    </QueryClientProvider>
  );
}

export default AdminPage;
