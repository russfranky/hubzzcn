import type { ParticipantRole } from "./types"

const CAN_PRODUCE: ParticipantRole[] = ["host", "mod", "speaker"]
const CAN_MODERATE: ParticipantRole[] = ["host", "mod"]

export function canProduce(role: ParticipantRole) {
  return CAN_PRODUCE.includes(role)
}

export function canModerate(role: ParticipantRole) {
  return CAN_MODERATE.includes(role)
}

export function canRaiseHand(role: ParticipantRole) {
  return role === "listener"
}

export function canSpotlight(role: ParticipantRole) {
  return CAN_PRODUCE.includes(role)
}

export const ROLE_LABEL: Record<ParticipantRole, string> = {
  host: "Host",
  mod: "Mod",
  speaker: "Stage",
  listener: "Audience",
}
