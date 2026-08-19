import {
  EventTicket,
  type EventTicketProps,
} from "@/components/hubzz/event-ticket"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof EventTicket> = {
  title: "EventTicket",
  slug: "tickets",
  navLabel: "Event Ticket",
  component: EventTicket,
  description:
    "Fixed-size Hubzz event artifact with ready, upcoming, joined, past, and loading states.",
  category: "hubzz",
  layer: "component",
  notes: [
    "The 344×184 geometry is part of the public component contract.",
    "Use loading=true while event data is unresolved.",
    "Host and space become links when href props are provided.",
    "The component delegates actions to Button and loading treatment to Skeleton.",
  ],
}

const BASE: Partial<EventTicketProps> = {
  title: "A Moment to Remember",
  date: "JAN 11, 2024",
  time: "09:00 PM",
  host: "group",
  hostHref: "#",
  space: "Space",
  spaceHref: "#",
  ticketNumber: "#00001/03123",
  imageSrc: "/favicon.svg",
}

export const Ready: Example<EventTicketProps> = {
  name: "Ready to join",
  args: { ...BASE, state: "ready", testId: "ticket-ready" } as EventTicketProps,
}

export const Upcoming: Example<EventTicketProps> = {
  name: "Upcoming",
  args: {
    ...BASE,
    state: "upcoming",
    countdown: { days: 1, hours: 10, minutes: 12 },
    testId: "ticket-upcoming",
  } as EventTicketProps,
}

export const Joined: Example<EventTicketProps> = {
  name: "Joined",
  args: {
    ...BASE,
    state: "joined",
    testId: "ticket-joined",
  } as EventTicketProps,
}

export const Past: Example<EventTicketProps> = {
  name: "Past",
  args: { ...BASE, state: "past", testId: "ticket-past" } as EventTicketProps,
}

export const LongTitle: Example<EventTicketProps> = {
  name: "Long title",
  args: {
    state: "joined",
    title:
      "An Extremely Long Event Title That Wraps Across Multiple Lines To Test Card Height Growth",
    date: "FEB 3",
    time: "11:00 PM",
    host: "Valentina Restrepo-Gutiérrez",
    space: "The Grand Metropolitan Ballroom & Conference Centre",
    ticketNumber: "#RESERVATION/2024/00001/XTRA",
    imageSrc: "/favicon.svg",
    onLeave: () => {},
    testId: "ticket-longTitle",
  } as EventTicketProps,
}

export const Loading: Example<EventTicketProps> = {
  name: "Loading",
  args: { loading: true, testId: "ticket-loading" } as EventTicketProps,
}

export const examples = [Ready, Upcoming, Joined, Past, LongTitle, Loading]
