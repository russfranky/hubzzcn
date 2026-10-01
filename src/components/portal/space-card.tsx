import {
  SpaceCard as HubzzSpaceCard,
  type SpaceCardAttendance,
} from "@/components/hubzz/space-card"
import type { PortalSpace } from "@/lib/portal/types"

export function SpaceCard({
  space,
  browseLabel,
  onBrowse,
  onJoin,
}: {
  space: PortalSpace
  browseLabel?: string
  onBrowse?: () => void
  onJoin?: () => void
}) {
  const attendance: SpaceCardAttendance = space.current
    ? "here"
    : space.underConstruction
      ? "construction"
      : "empty"

  return (
    <HubzzSpaceCard
      spaceId={space.id}
      title={space.title}
      gradient={space.gradient}
      attendance={attendance}
      browseLabel={browseLabel}
      onBrowse={onBrowse}
      browseAriaLabel={
        browseLabel
          ? `View ${space.title} and ${space.attachedCount ?? 0} attached spaces`
          : undefined
      }
      onJoin={onJoin}
      action={
        space.current
          ? "here"
          : space.underConstruction
            ? "none"
            : onJoin
              ? "join"
              : "none"
      }
    />
  )
}
