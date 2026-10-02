import * as React from "react"
import { Ticket } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const DEFAULT_AVATAR_COLORS = ["#4c5663", "#6a584d", "#485a52"]
const CARD_PHOTO_LINE = "inset 0 0 0 0.5px rgba(252,253,254,0.14)"
const DEFAULT_GRADIENT =
  "linear-gradient(135deg, #3d4a5c 0%, #1a1f28 50%, #2a3540 100%)"
const AVATAR_STACK_LIMIT = 3
/** Neighbor circle r=13 sits 6px overlapped → center at x=33; +3px gap (LabSpaceCard). */
const GAP_MASK =
  "radial-gradient(circle 16px at 33px 13px, transparent 15.6px, black 16.4px)"

export type SpaceCardAttendance = "here" | "empty" | "construction"
export type SpaceCardAction = "join" | "here" | "leave" | "none"

/** Presentational attendee — mirrors pre-alpha SpaceUser / User leaf. */
export type SpaceCardUser = {
  id: string | number
  name: string
  /** PFP URL; falls back to a colored silhouette. */
  avatar?: string
  /** Silhouette / fallback fill (pre-alpha iconStroke / color). */
  color?: string
  initials?: string
}

/** Per-space preview framing — pre-alpha PreviewConfig. */
export type SpaceCardPreviewConfig = {
  scale?: number
  offsetX?: number
  offsetY?: number
}

export type SpaceCardProps = {
  title: string
  /** Gradient fallback when `image` is absent. */
  gradient?: string
  /** Live / bundled space preview image (pre-alpha card `image`). */
  image?: string
  imageAlt?: string
  previewConfig?: SpaceCardPreviewConfig | null
  attendance?: SpaceCardAttendance
  /**
   * Attendee stack (pre-alpha). When omitted and attendance is `"here"`,
   * `avatarColors` provides the portal-stub color-dot fallback.
   */
  users?: SpaceCardUser[]
  /** Stacked color-dot avatars shown when `users` is omitted and attendance is `"here"`. */
  avatarColors?: string[]
  browseLabel?: string
  onBrowse?: () => void
  browseAriaLabel?: string
  /** Optional ⓘ control — pre-alpha SpaceCardHelpers.InfoIcon. */
  onInfo?: () => void
  infoAriaLabel?: string
  /** Show the ticket glyph beside the title (space-cards EventTitle). */
  showTicket?: boolean
  action?: SpaceCardAction
  onJoin?: () => void
  onLeave?: () => void
  /** DEF-017: path-less / closed spaces render a disabled Join pill. */
  joinDisabled?: boolean
  joinDisabledTitle?: string
  /**
   * Host-owned elapsed label when action is `"here"` (pre-alpha TimeInSpace).
   * Product owns the ticker; the kit only renders the chip.
   */
  elapsedLabel?: string
  elapsedVerbose?: string
  spaceId?: string
  className?: string
}

function placeholderAvatar(color: string): string {
  const safe = color.startsWith("#") ? color : `#${color}`
  const encoded = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
      `<rect width="100" height="100" fill="${safe}"/>` +
      `<circle cx="50" cy="38" r="16" fill="rgba(255,255,255,0.25)"/>` +
      `<ellipse cx="50" cy="80" rx="26" ry="20" fill="rgba(255,255,255,0.25)"/>` +
      `</svg>`
  )
  return `data:image/svg+xml,${encoded}`
}

function previewFramingStyle(
  config?: SpaceCardPreviewConfig | null
): React.CSSProperties {
  if (!config) return {}
  const style: React.CSSProperties = {}
  if (
    typeof config.scale === "number" &&
    Number.isFinite(config.scale) &&
    config.scale !== 1
  ) {
    style.transform = `scale(${config.scale})`
  }
  const x =
    typeof config.offsetX === "number" && Number.isFinite(config.offsetX)
      ? config.offsetX
      : 50
  const y =
    typeof config.offsetY === "number" && Number.isFinite(config.offsetY)
      ? config.offsetY
      : 50
  if (x !== 50 || y !== 50) style.objectPosition = `${x}% ${y}%`
  return style
}

/** SpaceCardHelpers.InfoIcon — circle-ⓘ in #FCFDFE, not Lucide. */
function InfoIconButton({
  onClick,
  "aria-label": ariaLabel,
}: {
  onClick: () => void
  "aria-label": string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="size-5 shrink-0 cursor-pointer border-none bg-transparent p-0 opacity-50 transition-opacity hover:opacity-80"
      data-name="Icon_line / info"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7.5" stroke="#FCFDFE" strokeWidth="1.5" />
        <path
          d="M10 13.5V9.5"
          stroke="#FCFDFE"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        <circle cx="10" cy="7" r="0.75" fill="#FCFDFE" />
      </svg>
    </button>
  )
}

function ColorDotStack({ colors }: { colors: string[] }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex items-center">
        <div className="flex pr-[6px]">
          {colors.map((color, index) => {
            const gapMask =
              index < colors.length - 1 ? GAP_MASK : undefined

            return (
              <span
                key={`${color}-${index}`}
                className="relative shrink-0 rounded-[32px]"
                style={{ height: 26, width: 26, marginRight: -6 }}
              >
                <div
                  className="relative size-full overflow-hidden rounded-full"
                  style={{
                    background: color,
                    WebkitMaskImage: gapMask,
                    maskImage: gapMask,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      boxShadow: "inset 0 0 0 1px rgba(252,253,254,0.42)",
                    }}
                  />
                </div>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SpaceUserAvatar({
  user,
  masked,
}: {
  user: SpaceCardUser
  masked?: boolean
}) {
  const [thumbFailed, setThumbFailed] = React.useState(false)
  const [showTooltip, setShowTooltip] = React.useState(false)
  const color = user.color ?? "#555"
  const src =
    !thumbFailed && user.avatar ? user.avatar : placeholderAvatar(color)
  const gapMask = masked ? GAP_MASK : undefined
  const initials =
    user.initials ??
    user.name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()

  return (
    <span
      className="relative shrink-0 rounded-[32px]"
      style={{ height: 26, width: 26, marginRight: -6 }}
      onPointerEnter={() => setShowTooltip(true)}
      onPointerLeave={() => setShowTooltip(false)}
    >
      {/* Hotbar-style tooltip (SpaceCardHelpers.UserAvatar) — lives on the
          wrapper, not the masked Avatar, so gap mask never clips the name. */}
      {showTooltip ? (
        <div
          className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 whitespace-nowrap rounded-md px-2 py-1"
          style={{
            background: "#1a1a1e",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.6)",
          }}
        >
          <p
            className="text-[11px] text-[#c0c0c0]"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
          >
            {user.name}
          </p>
          <div
            className="absolute top-full left-3 -mt-px"
            style={{
              width: 0,
              height: 0,
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderTop: "4px solid #1a1a1e",
            }}
          />
        </div>
      ) : null}
      {/* Force 26px: Avatar size="sm" ships data-[size=sm]:size-6 (24px), which
          beats plain size-full on specificity and mis-calibrates the SoT gap mask. */}
      <Avatar
        size="sm"
        className="size-full after:hidden data-[size=sm]:size-full"
        style={{ WebkitMaskImage: gapMask, maskImage: gapMask }}
      >
        <AvatarImage
          src={src}
          alt={user.name}
          onError={() => setThumbFailed(true)}
          style={{ background: color }}
        />
        <AvatarFallback
          className="text-[9px] text-primary-foreground"
          style={{ background: color }}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
    </span>
  )
}

function UserStack({ users }: { users: SpaceCardUser[] }) {
  const shown = users.slice(0, AVATAR_STACK_LIMIT)
  const overflow = users.length - shown.length

  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex items-center">
        <div className="flex pr-[6px]">
          {shown.map((user, index) => (
            <SpaceUserAvatar
              key={user.id}
              user={user}
              masked={index < shown.length - 1}
            />
          ))}
        </div>
        {overflow > 0 ? (
          <span className="ml-2 text-[13px] leading-[20px] font-medium text-[#fcfdfe] opacity-85">
            +{overflow}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function EmptyAttendance() {
  return (
    <div className="flex shrink-0 items-center gap-2 opacity-60">
      <div className="relative flex size-[20px] items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#fcfdfe] opacity-50 [animation-duration:12s] motion-safe:animate-spin" />
        <svg
          width="14"
          height="14"
          viewBox="0 0 18 18"
          fill="none"
          className="relative opacity-50"
          aria-hidden="true"
        >
          <circle cx="6" cy="6.5" r="1.3" fill="#fcfdfe" />
          <circle cx="12" cy="6.5" r="1.3" fill="#fcfdfe" />
          <path
            d="M5.5 13.5C6.8 11.5 11.2 11.5 12.5 13.5"
            stroke="#fcfdfe"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <p className="text-[13px] leading-[20px] font-medium text-[#fcfdfe] opacity-70">
        Nobody&apos;s here
      </p>
    </div>
  )
}

function SpaceAttendance({
  attendance,
  users,
  avatarColors,
}: {
  attendance: SpaceCardAttendance
  users?: SpaceCardUser[]
  avatarColors: string[]
}) {
  if (attendance === "construction") {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <p className="text-[13px] leading-[20px] font-medium text-[#fcfdfe] opacity-70">
          Under construction
        </p>
      </div>
    )
  }

  if (users && users.length > 0) {
    return <UserStack users={users} />
  }

  if (attendance === "here") {
    return <ColorDotStack colors={avatarColors} />
  }

  return <EmptyAttendance />
}

/** LabSpaceCard TimeInSpace — filled clock SVG + hardcoded #7c878e (not Lucide / muted). */
function TimeInSpaceChip({
  label,
  verbose,
}: {
  label: string
  verbose?: string
}) {
  return (
    <span
      title={verbose}
      className="flex shrink-0 items-center gap-1.5 self-end px-3.5 text-[13px] leading-[16px] font-medium tabular-nums text-[#7c878e]"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 12 12"
        fill="none"
        className="shrink-0 opacity-60"
        aria-hidden="true"
      >
        <circle cx="6" cy="6" r="5" fill="#7c878e" />
        <circle cx="6" cy="6" r="4" fill="#24262b" />
        <rect x="5.5" y="3" width="1" height="3.5" rx="0.5" fill="#7c878e" />
        <rect x="5.5" y="5.5" width="2.5" height="1" rx="0.5" fill="#7c878e" />
      </svg>
      {label}
    </span>
  )
}

function resolveAction(
  attendance: SpaceCardAttendance,
  action: SpaceCardAction | undefined,
  onJoin: (() => void) | undefined,
  onLeave: (() => void) | undefined
): SpaceCardAction {
  if (action) return action
  if (attendance === "here") return "here"
  if (attendance === "construction") return "none"
  if (onLeave) return "leave"
  return onJoin ? "join" : "none"
}

/**
 * Presentational Hubzz space card — visual leaf from pre-alpha
 * `profile-panel/components/spaces/SpaceCard.tsx` (LabSpaceCard) and
 * `space-cards/components/spaces/SpaceCardHelpers.tsx` (EventTitle /
 * Attendance / SpaceButton / InfoIcon). Product owns join/browse/info
 * handlers, elapsed ticking, and preview assets.
 */
export function SpaceCard({
  title,
  gradient = DEFAULT_GRADIENT,
  image,
  imageAlt = "",
  previewConfig,
  attendance = "empty",
  users,
  avatarColors = DEFAULT_AVATAR_COLORS,
  browseLabel,
  onBrowse,
  browseAriaLabel,
  onInfo,
  infoAriaLabel,
  showTicket = false,
  action,
  onJoin,
  onLeave,
  joinDisabled = false,
  joinDisabledTitle = "This space isn't open yet",
  elapsedLabel,
  elapsedVerbose,
  spaceId,
  className,
}: SpaceCardProps) {
  const resolvedAction = resolveAction(attendance, action, onJoin, onLeave)
  const framing = previewFramingStyle(previewConfig)

  return (
    <div
      data-slot="space-card"
      data-space-id={spaceId}
      data-name="Space card"
      className={cn(
        "relative aspect-[7/2] min-h-[5.75rem] w-full shrink-0 overflow-hidden rounded-[12px] bg-card",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
        {image ? (
          <img
            src={image}
            alt={imageAlt}
            className="absolute inset-0 size-full object-cover"
            style={framing}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: gradient }} />
        )}
        {/* OverlayFull — uniform 36% black for readability (imports/OverlayFull). */}
        <div
          data-name="venue-overlay"
          className="absolute inset-0 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2),0px_0px_2px_0px_rgba(0,0,0,0.08),0px_2px_6px_0px_rgba(0,0,0,0.1)]"
          style={{ background: "rgba(0,0,0,0.36)" }}
        />
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ boxShadow: CARD_PHOTO_LINE }}
      />

      <div className="relative z-10 flex h-full w-full flex-col justify-between overflow-hidden">
        <div className="flex items-start justify-between p-3">
          <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
            {showTicket ? (
              <Ticket
                className="size-5 shrink-0 text-[#fcfdfe]"
                aria-hidden="true"
              />
            ) : null}
            <h2 className="min-w-0 overflow-hidden text-sm leading-5 font-bold text-ellipsis whitespace-nowrap text-[#fcfdfe]">
              {title}
            </h2>
          </div>

          <div className="ml-3 flex shrink-0 items-center gap-2">
            {browseLabel && onBrowse ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={onBrowse}
                aria-label={browseAriaLabel ?? `Browse ${title}`}
                className="h-auto p-0 text-[13px] leading-5 text-[#fcfdfe] hover:bg-transparent hover:text-[#fcfdfe]"
              >
                {browseLabel}
              </Button>
            ) : null}
            {onInfo ? (
              <InfoIconButton
                onClick={onInfo}
                aria-label={infoAriaLabel ?? `Space info for ${title}`}
              />
            ) : null}
          </div>
        </div>

        <div className="flex w-full items-center justify-between px-3 pb-3">
          <SpaceAttendance
            attendance={attendance}
            users={users}
            avatarColors={avatarColors}
          />

          {resolvedAction === "here" ? (
            elapsedLabel ? (
              <TimeInSpaceChip label={elapsedLabel} verbose={elapsedVerbose} />
            ) : (
              <span className="px-3.5 text-[12px] font-medium text-[#fcfdfe]">
                Here
              </span>
            )
          ) : resolvedAction === "leave" && onLeave ? (
            <Button
              size="xs"
              type="button"
              variant="ghost"
              onClick={onLeave}
              className="h-auto shrink-0 rounded-full border border-[#464f55] bg-transparent px-3.5 py-[6px] text-[12px] leading-[18px] font-semibold text-[#fcfdfe] hover:bg-[#393e44] hover:text-[#fcfdfe]"
            >
              Leave
            </Button>
          ) : resolvedAction === "join" ? (
            joinDisabled ? (
              <Button
                size="xs"
                type="button"
                variant="ghost"
                disabled
                title={joinDisabledTitle}
                className="shrink-0 rounded-full bg-[#3a3d44] px-3.5 text-[12px] font-semibold text-[#9aa2a9] disabled:opacity-100"
              >
                Join
              </Button>
            ) : onJoin ? (
              <Button
                size="xs"
                type="button"
                variant="ghost"
                onClick={onJoin}
                className="shrink-0 rounded-full bg-gradient-to-b from-[#9a77ff] to-[#735ffa] px-3.5 text-[12px] font-semibold text-[#fcfdfe] hover:opacity-90 hover:text-[#fcfdfe]"
              >
                Join
              </Button>
            ) : null
          ) : null}
        </div>
      </div>
    </div>
  )
}
