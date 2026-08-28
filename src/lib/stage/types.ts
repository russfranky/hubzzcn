/** Stage domain types — host | mod | speaker | listener. Pure data. */

export type ParticipantRole = "host" | "mod" | "speaker" | "listener"

export type LayoutMode = "grid" | "spotlight"

export interface Participant {
  id: string
  name: string
  avatar?: string
  /** Color token for People-panel chip when no photo. */
  chip: "rose" | "sky" | "violet" | "slate" | "amber"
  role: ParticipantRole
  isSpeaking: boolean
  isMuted: boolean
  videoOn: boolean
  /** Listener requested to join the stage. */
  raisedHand: boolean
}

export interface ChatMessage {
  id: string
  userId: string
  name: string
  body: string
}

export interface StageSession {
  id: string
  title: string
  layout: LayoutMode
  spotlightId: string | null
  participants: Participant[]
  localUserId: string
  remoteMuted: boolean
  peopleOpen: boolean
  chatOpen: boolean
  lastRail: "people" | "chat"
  messages: ChatMessage[]
  leaveOpen: boolean
}

export interface StageActions {
  toggleMic: () => void
  toggleVideo: () => void
  toggleRemoteAudio: () => void
  raiseHand: () => void
  setLayout: (mode: LayoutMode) => void
  setSpotlight: (id: string | null) => void
  openPeople: (open: boolean) => void
  openChat: (open: boolean) => void
  reopenRail: () => void
  sendChat: (body: string) => void
  clap: () => void
  requestLeave: () => void
  cancelLeave: () => void
  confirmLeave: () => void
  approveJoin: (id: string) => void
  denyJoin: (id: string) => void
  muteOther: (id: string) => void
  setRole: (id: string, role: ParticipantRole) => void
}
