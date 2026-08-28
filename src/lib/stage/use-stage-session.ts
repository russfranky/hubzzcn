import { useMemo } from "react"

import { canModerate, canProduce, canRaiseHand, canSpotlight } from "./roles"
import { getLocal, getStageStore, useStageStore } from "./store"
import type { StageActions } from "./types"

/** Thin adapter — presentational Stage* components consume this, never the store. */
export function useStageSession() {
  const store = useStageStore()
  const local = getLocal(store)
  const localRole = local?.role ?? "listener"

  const onStage = store.participants.filter((p) => p.role !== "listener")
  const audience = store.participants.filter((p) => p.role === "listener")
  const pending = audience.filter((p) => p.raisedHand)
  const speaking =
    store.participants.find((p) => p.isSpeaking) ?? onStage[0] ?? null

  const actions: StageActions = useMemo(
    () => ({
      toggleMic: () => getStageStore().toggleMic(),
      toggleVideo: () => getStageStore().toggleVideo(),
      toggleRemoteAudio: () => getStageStore().toggleRemoteAudio(),
      raiseHand: () => getStageStore().raiseHand(),
      setLayout: (mode) => getStageStore().setLayout(mode),
      setSpotlight: (id) => getStageStore().setSpotlight(id),
      openPeople: (open) => getStageStore().openPeople(open),
      openChat: (open) => getStageStore().openChat(open),
      reopenRail: () => getStageStore().reopenRail(),
      sendChat: (body) => getStageStore().sendChat(body),
      clap: () => getStageStore().clap(),
      requestLeave: () => getStageStore().requestLeave(),
      cancelLeave: () => getStageStore().cancelLeave(),
      confirmLeave: () => getStageStore().confirmLeave(),
      approveJoin: (id) => getStageStore().approveJoin(id),
      denyJoin: (id) => getStageStore().denyJoin(id),
      muteOther: (id) => getStageStore().muteOther(id),
      setRole: (id, role) => getStageStore().setRole(id, role),
    }),
    []
  )

  return {
    session: store,
    local,
    localRole,
    mayProduce: local ? canProduce(local.role) : false,
    mayModerate: local ? canModerate(local.role) : false,
    mayRequest: local ? canRaiseHand(local.role) : false,
    maySpotlight: local ? canSpotlight(local.role) : false,
    onStage,
    audience,
    pending,
    speaking,
    actions,
  }
}
