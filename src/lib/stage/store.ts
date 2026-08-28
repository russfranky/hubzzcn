import { useSyncExternalStore } from "react"

import { notifyVoicePort } from "./ports"
import { canModerate, canProduce, canRaiseHand } from "./roles"
import { LOCAL_USER_ID, SEED_MESSAGES, SEED_PARTICIPANTS } from "./seed"
import type {
  ChatMessage,
  LayoutMode,
  Participant,
  ParticipantRole,
  StageActions,
  StageSession,
} from "./types"

type Store = StageSession & StageActions

const INITIAL: StageSession = {
  id: "dropin-hearth-1",
  title: "Hubzz tower",
  layout: "grid",
  spotlightId: LOCAL_USER_ID,
  participants: SEED_PARTICIPANTS,
  localUserId: LOCAL_USER_ID,
  remoteMuted: false,
  peopleOpen: true,
  chatOpen: false,
  lastRail: "people",
  messages: SEED_MESSAGES,
  leaveOpen: false,
}

let state: Store
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function set(partial: Partial<Store> | ((current: Store) => Partial<Store>)) {
  const next = typeof partial === "function" ? partial(state) : partial
  state = { ...state, ...next }
  emit()
}

function get() {
  return state
}

const actions: StageActions = {
  toggleMic: () =>
    set((s) => {
      const me = s.participants.find((p) => p.id === s.localUserId)
      if (!me || !canProduce(me.role)) return s
      const nextMuted = !me.isMuted
      notifyVoicePort((port) => port.setMicEnabled(!nextMuted))
      return {
        participants: s.participants.map((p) =>
          p.id === s.localUserId
            ? {
                ...p,
                isMuted: nextMuted,
                isSpeaking: !nextMuted,
              }
            : p
        ),
      }
    }),

  toggleVideo: () =>
    set((s) => {
      const me = s.participants.find((p) => p.id === s.localUserId)
      if (!me || !canProduce(me.role)) return s
      const videoOn = !me.videoOn
      notifyVoicePort((port) => port.setCamEnabled(videoOn))
      return {
        participants: s.participants.map((p) =>
          p.id === s.localUserId ? { ...p, videoOn } : p
        ),
      }
    }),

  toggleRemoteAudio: () => {
    const next = !get().remoteMuted
    notifyVoicePort((port) => port.setOutputMuted(next))
    set({ remoteMuted: next })
  },

  raiseHand: () =>
    set((s) => {
      const me = s.participants.find((p) => p.id === s.localUserId)
      if (!me || !canRaiseHand(me.role)) return s
      return {
        participants: s.participants.map((p) =>
          p.id === s.localUserId ? { ...p, raisedHand: !p.raisedHand } : p
        ),
      }
    }),

  setLayout: (layout: LayoutMode) => set({ layout }),

  setSpotlight: (spotlightId: string | null) => {
    if (spotlightId == null) {
      set({ spotlightId: null })
      return
    }
    const onStage = get().participants.some(
      (p) => p.id === spotlightId && p.role !== "listener"
    )
    if (!onStage) return
    set({ spotlightId })
  },

  openPeople: (peopleOpen: boolean) =>
    set((s) => ({
      peopleOpen,
      chatOpen: peopleOpen ? false : s.chatOpen,
      lastRail: peopleOpen ? "people" : s.lastRail,
    })),

  openChat: (chatOpen: boolean) =>
    set((s) => ({
      chatOpen,
      peopleOpen: chatOpen ? false : s.peopleOpen,
      lastRail: chatOpen ? "chat" : s.lastRail,
    })),

  reopenRail: () =>
    set((s) =>
      s.lastRail === "chat"
        ? { chatOpen: true, peopleOpen: false }
        : { peopleOpen: true, chatOpen: false }
    ),

  sendChat: (body: string) =>
    set((s) => {
      const text = body.trim()
      if (!text) return s
      const me = s.participants.find((p) => p.id === s.localUserId)
      const msg: ChatMessage = {
        id: `m-${Date.now()}`,
        userId: s.localUserId,
        name: me?.name.split(" ")[0] ?? "You",
        body: text,
      }
      return { messages: [...s.messages, msg] }
    }),

  clap: () =>
    set((s) => {
      const me = s.participants.find((p) => p.id === s.localUserId)
      const msg: ChatMessage = {
        id: `m-${Date.now()}`,
        userId: s.localUserId,
        name: me?.name.split(" ")[0] ?? "You",
        body: "👏",
      }
      return { messages: [...s.messages, msg] }
    }),

  requestLeave: () => set({ leaveOpen: true }),
  cancelLeave: () => set({ leaveOpen: false }),

  confirmLeave: () =>
    set((s) => ({
      leaveOpen: false,
      peopleOpen: false,
      chatOpen: s.chatOpen,
      spotlightId: s.spotlightId === s.localUserId ? null : s.spotlightId,
      participants: s.participants.map((p) =>
        p.id !== s.localUserId || p.role === "listener"
          ? p
          : {
              ...p,
              role: "listener" as const,
              isMuted: true,
              isSpeaking: false,
              videoOn: false,
              raisedHand: false,
            }
      ),
    })),

  approveJoin: (id: string) =>
    set((s) => {
      const me = s.participants.find((p) => p.id === s.localUserId)
      if (!me || !canModerate(me.role)) return s
      if (id === s.localUserId) return s
      return {
        participants: s.participants.map((p) =>
          p.id === id
            ? { ...p, role: "speaker", raisedHand: false, isMuted: false }
            : p
        ),
      }
    }),

  denyJoin: (id: string) =>
    set((s) => {
      const me = s.participants.find((p) => p.id === s.localUserId)
      if (!me || !canModerate(me.role)) return s
      return {
        participants: s.participants.map((p) =>
          p.id === id ? { ...p, raisedHand: false } : p
        ),
      }
    }),

  muteOther: (id: string) =>
    set((s) => {
      const me = s.participants.find((p) => p.id === s.localUserId)
      if (!me || !canModerate(me.role)) return s
      if (id === s.localUserId) return s
      return {
        participants: s.participants.map((p) =>
          p.id === id ? { ...p, isMuted: true, isSpeaking: false } : p
        ),
      }
    }),

  setRole: (id: string, role: ParticipantRole) =>
    set((s) => {
      const me = s.participants.find((p) => p.id === s.localUserId)
      if (!me || !canModerate(me.role)) return s
      const hosts = s.participants.filter((p) => p.role === "host")
      const target = s.participants.find((p) => p.id === id)
      if (target?.role === "host" && role !== "host" && hosts.length <= 1) {
        return s
      }
      return {
        participants: s.participants.map((p) =>
          p.id === id
            ? {
                ...p,
                role,
                raisedHand: false,
                isMuted: role === "listener" ? true : p.isMuted,
                isSpeaking: role === "listener" ? false : p.isSpeaking,
                videoOn: role === "listener" ? false : p.videoOn,
              }
            : p
        ),
      }
    }),
}

state = {
  ...INITIAL,
  participants: SEED_PARTICIPANTS.map((p) => ({ ...p })),
  messages: SEED_MESSAGES.map((m) => ({ ...m })),
  ...actions,
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useStageStore(): Store {
  return useSyncExternalStore(subscribe, get, get)
}

export function getStageStore() {
  return get()
}

export function getLocal(s: {
  participants: Participant[]
  localUserId: string
}) {
  return s.participants.find((p) => p.id === s.localUserId) ?? null
}

export function resetStageStore() {
  set({
    ...INITIAL,
    participants: SEED_PARTICIPANTS.map((p) => ({ ...p })),
    messages: SEED_MESSAGES.map((m) => ({ ...m })),
  })
}
