import { useEffect, useState } from "react"

import { useStageSession } from "@/lib/stage/use-stage-session"
import { StageActionBar } from "./StageActionBar"
import { StageChatPanel } from "./StageChatPanel"
import { StageEventHeader } from "./StageEventHeader"
import { StageGrid } from "./StageGrid"
import { StageLeaveConfirm } from "./StageLeaveConfirm"
import { StagePeoplePanel } from "./StagePeoplePanel"
import { StageSpotlight } from "./StageSpotlight"

/**
 * Production mount target for SpaceHUD when QueueItem.type === "native".
 * Root is pointer-events-none; interactive regions opt in.
 */
export function StageShell() {
  const {
    session,
    local,
    localRole,
    mayProduce,
    mayModerate,
    mayRequest,
    maySpotlight,
    onStage,
    audience,
    speaking,
    actions,
  } = useStageSession()

  const [fullscreen, setFullscreen] = useState(false)
  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", sync)
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [])

  const hosts = onStage.filter((p) => p.role === "host" || p.role === "mod")
  const stageOnly = onStage.filter((p) => p.role === "speaker")
  const spotlightActive =
    onStage.find((p) => p.id === session.spotlightId) ??
    speaking ??
    onStage[0] ??
    null
  const railOpen = session.peopleOpen || session.chatOpen

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.()
    } else {
      void document.exitFullscreen?.()
    }
  }

  return (
    <div
      className="stage-hud pointer-events-none"
      data-rail={railOpen ? "on" : "off"}
      data-testid="stage-hud"
    >
      <StageEventHeader
        title={session.title}
        railOpen={railOpen}
        onReopenRail={actions.reopenRail}
      />

      <div className="stage-hud-stage">
        <div className="pointer-events-auto h-full min-h-0">
          {session.layout === "spotlight" ? (
            <StageSpotlight
              active={spotlightActive}
              others={onStage}
              outputMuted={session.remoteMuted}
              onSelect={
                maySpotlight ? (id) => actions.setSpotlight(id) : undefined
              }
            />
          ) : (
            <StageGrid
              participants={onStage}
              outputMuted={session.remoteMuted}
              onSelect={
                maySpotlight
                  ? (id) => {
                      actions.setSpotlight(id)
                      actions.setLayout("spotlight")
                    }
                  : undefined
              }
            />
          )}
        </div>

        <div
          aria-hidden
          className="stage-lower-fade sm:h-stage-fade pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32"
        />

        <StageActionBar
          localRole={localRole}
          isMuted={local?.isMuted ?? true}
          videoOn={local?.videoOn ?? false}
          remoteMuted={session.remoteMuted}
          raisedHand={local?.raisedHand ?? false}
          layout={session.layout}
          canProduce={mayProduce}
          canRaiseHand={mayRequest}
          fullscreen={fullscreen}
          onToggleMic={actions.toggleMic}
          onToggleVideo={actions.toggleVideo}
          onToggleRemoteAudio={actions.toggleRemoteAudio}
          onRaiseHand={actions.raiseHand}
          onSetLayout={actions.setLayout}
          onOpenPeople={() => actions.openPeople(true)}
          onLeave={actions.requestLeave}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>

      {railOpen ? (
        <div className="stage-hud-rail pointer-events-auto">
          {session.peopleOpen ? (
            <StagePeoplePanel
              hosts={hosts}
              stage={stageOnly}
              audience={audience}
              canModerate={mayModerate}
              canRaiseHand={mayRequest}
              raisedHand={local?.raisedHand ?? false}
              onClose={() => actions.openPeople(false)}
              onOpenChat={() => actions.openChat(true)}
              onApprove={actions.approveJoin}
              onDeny={actions.denyJoin}
              onMute={actions.muteOther}
              onSetRole={actions.setRole}
              onRaiseHand={actions.raiseHand}
            />
          ) : (
            <StageChatPanel
              messages={session.messages}
              rankedIds={
                new Set(
                  session.participants
                    .filter((p) => p.role === "host" || p.role === "mod")
                    .map((p) => p.id)
                )
              }
              onClose={() => actions.openChat(false)}
              onOpenPeople={() => actions.openPeople(true)}
              onSend={actions.sendChat}
              onClap={actions.clap}
            />
          )}
        </div>
      ) : null}

      <StageLeaveConfirm
        open={session.leaveOpen}
        alreadyAudience={localRole === "listener"}
        onCancel={actions.cancelLeave}
        onConfirm={actions.confirmLeave}
      />
    </div>
  )
}
