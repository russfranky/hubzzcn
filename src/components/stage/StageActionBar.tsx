import { Button } from "@/components/ui/button"
import type { LayoutMode, ParticipantRole } from "@/lib/stage/types"
import { cn } from "@/lib/utils"
import {
  IconArrowSquareUp,
  IconExpand,
  IconGrid2,
  IconMicrophone,
  IconVideo,
  IconVolumeHigh,
  IconVolumeOff,
  IconWindow,
} from "./DockIcons"

const hit =
  "pointer-events-auto size-11 shrink-0 p-0 text-stage-fg hover:bg-stage-raised/80 @[40rem]:size-10"

export function StageActionBar({
  localRole,
  isMuted,
  videoOn,
  remoteMuted,
  raisedHand,
  layout,
  canProduce,
  canRaiseHand,
  fullscreen,
  onToggleMic,
  onToggleVideo,
  onToggleRemoteAudio,
  onRaiseHand,
  onSetLayout,
  onOpenPeople,
  onLeave,
  onToggleFullscreen,
}: {
  localRole: ParticipantRole
  isMuted: boolean
  videoOn: boolean
  remoteMuted: boolean
  raisedHand: boolean
  layout: LayoutMode
  canProduce: boolean
  canRaiseHand: boolean
  fullscreen: boolean
  onToggleMic: () => void
  onToggleVideo: () => void
  onToggleRemoteAudio: () => void
  onRaiseHand: () => void
  onSetLayout: (mode: LayoutMode) => void
  onOpenPeople: () => void
  onLeave: () => void
  onToggleFullscreen: () => void
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-30",
        layout === "spotlight"
          ? "from-stage-bg/70 bg-gradient-to-t to-transparent"
          : "bg-stage-bg"
      )}
    >
      <div className="stage-dock">
        <div className="stage-dock-left">
          <Button
            variant="ghost"
            className={cn(hit, "hidden @[22.5rem]:inline-flex")}
            aria-label={layout === "grid" ? "Spotlight layout" : "Grid layout"}
            aria-pressed={layout === "spotlight"}
            onClick={() =>
              onSetLayout(layout === "grid" ? "spotlight" : "grid")
            }
          >
            <IconGrid2 />
          </Button>
          <Button
            variant="ghost"
            className={cn(hit, "hidden @[32rem]:inline-flex")}
            aria-label={remoteMuted ? "Unmute stage audio" : "Mute stage audio"}
            aria-pressed={!remoteMuted}
            onClick={onToggleRemoteAudio}
          >
            {remoteMuted ? <IconVolumeOff /> : <IconVolumeHigh />}
          </Button>
        </div>

        <div className="stage-dock-center">
          {canProduce ? (
            <>
              <Button
                variant="ghost"
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                aria-pressed={!isMuted}
                onClick={onToggleMic}
                className={cn(hit, isMuted && "text-stage-leave")}
              >
                <IconMicrophone />
              </Button>
              <Button
                variant="ghost"
                aria-label={videoOn ? "Turn camera off" : "Turn camera on"}
                aria-pressed={videoOn}
                onClick={onToggleVideo}
                className={hit}
              >
                <IconVideo />
              </Button>
            </>
          ) : null}

          <Button
            variant="ghost"
            aria-label={
              canRaiseHand
                ? raisedHand
                  ? "Lower hand"
                  : "Raise hand"
                : "People"
            }
            aria-pressed={canRaiseHand ? raisedHand : undefined}
            onClick={canRaiseHand ? onRaiseHand : onOpenPeople}
            className={cn(
              hit,
              canRaiseHand && raisedHand && "text-stage-speak"
            )}
          >
            <IconArrowSquareUp />
          </Button>

          <Button
            variant="ghost"
            aria-label="Leave stage"
            className="bg-stage-leave text-stage-fg hover:bg-stage-leave/90 hover:text-stage-fg pointer-events-auto h-10 shrink-0 rounded-full px-3.5 text-xs font-semibold @[28rem]:h-8"
            onClick={onLeave}
          >
            <span className="@[28rem]:hidden">Leave</span>
            <span className="hidden @[28rem]:inline">Leave stage</span>
          </Button>
        </div>

        <div className="stage-dock-right">
          <Button
            variant="ghost"
            className={cn(hit, "hidden @[32rem]:inline-flex")}
            aria-label="Windowed"
            aria-pressed={!fullscreen}
            onClick={() => {
              if (fullscreen) onToggleFullscreen()
            }}
          >
            <IconWindow />
          </Button>
          <Button
            variant="ghost"
            className={cn(hit, "hidden @[22.5rem]:inline-flex")}
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            aria-pressed={fullscreen}
            onClick={onToggleFullscreen}
          >
            <IconExpand />
          </Button>
          <span className="sr-only">{localRole}</span>
        </div>
      </div>
    </div>
  )
}
