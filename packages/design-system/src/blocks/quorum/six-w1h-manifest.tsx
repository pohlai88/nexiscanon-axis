"use client"

/**
 * 6W1H Manifest Display - Quorum Kernel Audit Context
 *
 * Displays full contextual information for any action or decision.
 * Implements A01-CANONICAL.md §5 — Nexus Doctrine (100-Year Recall Promise)
 *
 * 6W1H Context:
 * - WHO: Actor + delegation chain + approval chain
 * - WHAT: Action type + affected entities
 * - WHEN: Timestamp + effective date + fiscal period
 * - WHERE: Tenant + location + system context
 * - WHY: Reason code + justification + business context
 * - WHICH: Options presented + selected option + policy overrides
 * - HOW: Execution path + method + evidence
 *
 * @example
 * ```tsx
 * import { SixW1HManifest } from "@workspace/design-system"
 *
 * <SixW1HManifest
 *   data={eventData}
 *   variant="card"
 *   showDangerZone={true}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card"
import { Badge } from "@/components/badge"
import { Separator } from "@/components/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/collapsible"
import {
  User,
  FileText,
  Calendar,
  MapPin,
  HelpCircle,
  List,
  Settings,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Shield,
  Clock,
  Building,
  Paperclip,
} from "lucide-react"

// ============================================================================
// Types (A01-CANONICAL.md §5 compliant)
// ============================================================================

export interface Actor {
  id: string
  name: string
  role?: string
  email?: string
  avatarUrl?: string
}

export interface EntityRef {
  id: string
  type: string
  label: string
  href?: string
}

export interface PolicyRef {
  id: string
  name: string
  description?: string
  severity?: "info" | "warning" | "error"
}

export interface EvidenceRef {
  id: string
  type: "file" | "link" | "email" | "document"
  label: string
  href?: string
  uploadedAt?: string
}

export interface SixW1HData {
  /** Event/Action ID */
  eventId: string

  /** WHO performed this action */
  who: {
    actor: Actor
    onBehalfOf?: Actor
    approvalChain?: Actor[]
  }

  /** WHAT action was taken */
  what: {
    action: string
    actionType: string
    sourceDocument?: EntityRef
    affectedEntities?: EntityRef[]
  }

  /** WHEN it occurred */
  when: {
    timestamp: string | Date
    effectiveDate?: string | Date
    period?: string
    timezone?: string
  }

  /** WHERE in the system/organization */
  where: {
    tenant: string
    location?: string
    branch?: string
    systemContext?: string
  }

  /** WHY was this decision made */
  why?: {
    reasonCode?: string
    justification?: string
    businessContext?: string
  }

  /** WHICH options were available */
  which?: {
    optionsPresented?: string[]
    selectedOption?: string
    policyOverrides?: PolicyRef[]
  }

  /** HOW it was executed */
  how?: {
    executionPath?: string
    method?: "ui" | "api" | "import" | "automation" | "system"
    evidence?: EvidenceRef[]
  }

  /** Danger Zone metadata (if policies were overridden) */
  dangerZone?: {
    violatedPolicies: PolicyRef[]
    riskScore: number
    warningsAcknowledged?: string[]
    overrideApprovedBy?: Actor
  }
}

export interface SixW1HManifestProps {
  /** 6W1H event data */
  data: SixW1HData
  /** Display variant */
  variant?: "card" | "panel" | "inline" | "compact"
  /** Show danger zone section */
  showDangerZone?: boolean
  /** Initially collapsed sections */
  collapsedSections?: ("who" | "what" | "when" | "where" | "why" | "which" | "how")[]
  /** Callback when entity is clicked */
  onEntityClick?: (entity: EntityRef) => void
  /** Callback when actor is clicked */
  onActorClick?: (actor: Actor) => void
  /** Custom className */
  className?: string
}

// ============================================================================
// Helper Components
// ============================================================================

function SectionHeader({
  icon: Icon,
  label,
  isOpen,
  onClick,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  isOpen: boolean
  onClick: () => void
  badge?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 py-2 text-sm font-semibold text-foreground",
        "hover:text-primary transition-colors"
      )}
    >
      {isOpen ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span>{label}</span>
      {badge}
    </button>
  )
}

function ActorDisplay({
  actor,
  role,
  onClick,
}: {
  actor: Actor
  role?: string
  onClick?: (actor: Actor) => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        onClick && "cursor-pointer hover:text-primary"
      )}
      onClick={() => onClick?.(actor)}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {actor.avatarUrl ? (
          <img
            src={actor.avatarUrl}
            alt={actor.name}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          actor.name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{actor.name}</span>
        {(role || actor.role) && (
          <span className="text-xs text-muted-foreground">
            {role || actor.role}
          </span>
        )}
      </div>
    </div>
  )
}

function EntityLink({
  entity,
  onClick,
}: {
  entity: EntityRef
  onClick?: (entity: EntityRef) => void
}) {
  return (
    <button
      onClick={() => onClick?.(entity)}
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-sm",
        "bg-muted hover:bg-accent transition-colors"
      )}
    >
      <span className="text-muted-foreground">{entity.type}:</span>
      <span className="font-medium">{entity.label}</span>
      {entity.href && <ExternalLink className="h-3 w-3" />}
    </button>
  )
}

function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  })
}

// ============================================================================
// Main Component
// ============================================================================

export function SixW1HManifest({
  data,
  variant = "card",
  showDangerZone = true,
  collapsedSections = [],
  onEntityClick,
  onActorClick,
  className,
}: SixW1HManifestProps) {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    () => {
      const sections = ["who", "what", "when", "where", "why", "which", "how"]
      return sections.reduce(
        (acc, section) => ({
          ...acc,
          [section]: !collapsedSections.includes(section as typeof collapsedSections[number]),
        }),
        {}
      )
    }
  )

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const hasDangerZone = showDangerZone && data.dangerZone && data.dangerZone.violatedPolicies.length > 0

  const content = (
    <div className="space-y-4">
      {/* Danger Zone Alert */}
      {hasDangerZone && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <h4 className="font-semibold text-destructive">Danger Zone</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                This action violated {data.dangerZone!.violatedPolicies.length} policy(s)
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="destructive">
                  Risk Score: {data.dangerZone!.riskScore}/100
                </Badge>
                {data.dangerZone!.overrideApprovedBy && (
                  <span className="text-xs text-muted-foreground">
                    Override by: {data.dangerZone!.overrideApprovedBy.name}
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-1">
                {data.dangerZone!.violatedPolicies.map((policy) => (
                  <div
                    key={policy.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Shield className="h-3 w-3 text-destructive" />
                    <span>{policy.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WHO Section */}
      <Collapsible open={openSections.who} onOpenChange={() => toggleSection("who")}>
        <CollapsibleTrigger>
          <SectionHeader
            icon={User}
            label="WHO"
            isOpen={openSections.who ?? true}
            onClick={() => toggleSection("who")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 pt-2 space-y-3">
          <div>
            <span className="text-xs text-muted-foreground">Actor:</span>
            <ActorDisplay actor={data.who.actor} onClick={onActorClick} />
          </div>
          {data.who.onBehalfOf && (
            <div>
              <span className="text-xs text-muted-foreground">On behalf of:</span>
              <ActorDisplay actor={data.who.onBehalfOf} onClick={onActorClick} />
            </div>
          )}
          {data.who.approvalChain && data.who.approvalChain.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Approval Chain:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {data.who.approvalChain.map((actor, index) => (
                  <React.Fragment key={actor.id}>
                    <ActorDisplay actor={actor} onClick={onActorClick} />
                    {index < data.who.approvalChain!.length - 1 && (
                      <span className="text-muted-foreground">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* WHAT Section */}
      <Collapsible open={openSections.what} onOpenChange={() => toggleSection("what")}>
        <CollapsibleTrigger>
          <SectionHeader
            icon={FileText}
            label="WHAT"
            isOpen={openSections.what ?? true}
            onClick={() => toggleSection("what")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 pt-2 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{data.what.actionType}</Badge>
            <span className="font-medium">{data.what.action}</span>
          </div>
          {data.what.sourceDocument && (
            <div>
              <span className="text-xs text-muted-foreground">Source Document:</span>
              <div className="mt-1">
                <EntityLink entity={data.what.sourceDocument} onClick={onEntityClick} />
              </div>
            </div>
          )}
          {data.what.affectedEntities && data.what.affectedEntities.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Affected Entities:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {data.what.affectedEntities.map((entity) => (
                  <EntityLink key={entity.id} entity={entity} onClick={onEntityClick} />
                ))}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* WHEN Section */}
      <Collapsible open={openSections.when} onOpenChange={() => toggleSection("when")}>
        <CollapsibleTrigger>
          <SectionHeader
            icon={Calendar}
            label="WHEN"
            isOpen={openSections.when ?? true}
            onClick={() => toggleSection("when")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 pt-2 space-y-2">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Timestamp:</span>
              <span className="font-medium">{formatDate(data.when.timestamp)}</span>
            </div>
            {data.when.effectiveDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Effective:</span>
                <span className="font-medium">
                  {formatDate(data.when.effectiveDate, { hour: undefined, minute: undefined })}
                </span>
              </div>
            )}
            {data.when.period && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Period:</span>
                <Badge variant="secondary">{data.when.period}</Badge>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* WHERE Section */}
      <Collapsible open={openSections.where} onOpenChange={() => toggleSection("where")}>
        <CollapsibleTrigger>
          <SectionHeader
            icon={MapPin}
            label="WHERE"
            isOpen={openSections.where ?? true}
            onClick={() => toggleSection("where")}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 pt-2 space-y-2">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tenant:</span>
              <span className="font-medium">{data.where.tenant}</span>
            </div>
            {data.where.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{data.where.location}</span>
              </div>
            )}
            {data.where.branch && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-medium">{data.where.branch}</span>
              </div>
            )}
            {data.where.systemContext && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">System:</span>
                <Badge variant="outline">{data.where.systemContext}</Badge>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* WHY Section */}
      {data.why && (
        <>
          <Separator />
          <Collapsible open={openSections.why} onOpenChange={() => toggleSection("why")}>
            <CollapsibleTrigger>
              <SectionHeader
                icon={HelpCircle}
                label="WHY"
                isOpen={openSections.why ?? true}
                onClick={() => toggleSection("why")}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 pt-2 space-y-2">
              {data.why.reasonCode && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Reason:</span>
                  <Badge variant="secondary">{data.why.reasonCode}</Badge>
                </div>
              )}
              {data.why.justification && (
                <div>
                  <span className="text-xs text-muted-foreground">Justification:</span>
                  <p className="mt-1 text-sm bg-muted p-2 rounded">
                    "{data.why.justification}"
                  </p>
                </div>
              )}
              {data.why.businessContext && (
                <div>
                  <span className="text-xs text-muted-foreground">Business Context:</span>
                  <p className="mt-1 text-sm">{data.why.businessContext}</p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </>
      )}

      {/* WHICH Section */}
      {data.which && (
        <>
          <Separator />
          <Collapsible open={openSections.which} onOpenChange={() => toggleSection("which")}>
            <CollapsibleTrigger>
              <SectionHeader
                icon={List}
                label="WHICH"
                isOpen={openSections.which ?? true}
                onClick={() => toggleSection("which")}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 pt-2 space-y-2">
              {data.which.optionsPresented && data.which.optionsPresented.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Options Presented:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {data.which.optionsPresented.map((option, index) => (
                      <Badge
                        key={index}
                        variant={option === data.which?.selectedOption ? "default" : "outline"}
                      >
                        {option}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {data.which.policyOverrides && data.which.policyOverrides.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Policy Overrides:</span>
                  <div className="mt-1 space-y-1">
                    {data.which.policyOverrides.map((policy) => (
                      <div key={policy.id} className="flex items-center gap-2 text-sm">
                        <Shield className="h-3 w-3 text-amber-500" />
                        <span>{policy.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </>
      )}

      {/* HOW Section */}
      {data.how && (
        <>
          <Separator />
          <Collapsible open={openSections.how} onOpenChange={() => toggleSection("how")}>
            <CollapsibleTrigger>
              <SectionHeader
                icon={Settings}
                label="HOW"
                isOpen={openSections.how ?? true}
                onClick={() => toggleSection("how")}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 pt-2 space-y-2">
              {data.how.method && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Method:</span>
                  <Badge variant="outline">{data.how.method.toUpperCase()}</Badge>
                </div>
              )}
              {data.how.executionPath && (
                <div>
                  <span className="text-xs text-muted-foreground">Execution Path:</span>
                  <code className="mt-1 block text-xs bg-muted p-2 rounded font-mono">
                    {data.how.executionPath}
                  </code>
                </div>
              )}
              {data.how.evidence && data.how.evidence.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Evidence:</span>
                  <div className="mt-1 space-y-1">
                    {data.how.evidence.map((evidence) => (
                      <div
                        key={evidence.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                        <a
                          href={evidence.href}
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {evidence.label}
                        </a>
                        {evidence.uploadedAt && (
                          <span className="text-xs text-muted-foreground">
                            ({formatDate(evidence.uploadedAt)})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  )

  // Render based on variant
  if (variant === "card") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            6W1H Context
          </CardTitle>
          <CardDescription>
            Event ID: {data.eventId}
          </CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    )
  }

  if (variant === "panel") {
    return (
      <div className={cn("rounded-lg border bg-card p-4", className)}>
        <h3 className="mb-4 font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          6W1H Context — {data.eventId}
        </h3>
        {content}
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("text-sm", className)}>
        <div className="flex flex-wrap gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{data.who.actor.name}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>WHO: {data.who.actor.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-1 text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>{data.what.action}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDate(data.when.timestamp)}</span>
          </div>
          {hasDangerZone && (
            <Badge variant="destructive" className="text-xs">
              ⚠️ Risk: {data.dangerZone!.riskScore}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  // Default: inline
  return <div className={className}>{content}</div>
}

// ============================================================================
// Export Types
// ============================================================================

export type {
  Actor,
  EntityRef,
  PolicyRef,
  EvidenceRef,
  SixW1HData,
}
