/**
 * Activity feed component.
 * 
 * Pattern: Shows recent activity in a tenant.
 */

interface ActivityItem {
  id: string;
  action: string;
  actorName: string | null;
  actorEmail: string;
  resourceType?: string;
  createdAt: Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  emptyMessage?: string;
}

export function ActivityFeed({
  activities,
  emptyMessage = "No recent activity",
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

function ActivityItem({ activity }: { activity: ActivityItem }) {
  const actionLabels: Record<string, string> = {
    "auth.login": "signed in",
    "auth.logout": "signed out",
    "auth.register": "created account",
    "tenant.create": "created organization",
    "tenant.update": "updated organization settings",
    "team.invite": "invited a team member",
    "team.remove": "removed a team member",
    "team.role_change": "changed a member's role",
    "api_key.create": "created an API key",
    "api_key.revoke": "revoked an API key",
    "settings.update": "updated settings",
  };

  const actionIcons: Record<string, string> = {
    auth: "🔐",
    tenant: "🏢",
    team: "👥",
    api_key: "🔑",
    settings: "⚙️",
  };

  const actionType = activity.action.split(".")[0] ?? "default";
  const icon = actionIcons[actionType] ?? "📋";
  const label = actionLabels[activity.action] ?? activity.action;

  const timeAgo = getTimeAgo(activity.createdAt);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors duration-200">
      <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium">
            {activity.actorName ?? activity.actorEmail.split("@")[0]}
          </span>{" "}
          <span className="text-muted-foreground">{label}</span>
          {activity.resourceType && (
            <span className="text-muted-foreground">
              {" "}
              ({activity.resourceType})
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
