import { EventTicket, type EventTicketProps } from "@/components/ui/event-ticket"
import type { Meta, Example } from "./types"

export const meta: Meta<typeof EventTicket> = {
  title: "EventTicket",
  slug: "tickets",  // preserves existing #tickets anchor in Landing.tsx nav
  navLabel: "Tickets",
  component: EventTicket,
  description:
    "Fixed-size ticket card (344×184px) representing a user's relationship to an event. " +
    "Four interactive states plus a loading skeleton.",
  category: "hubzz",
  notes: [
    "Always 344×184px — never resize or constrain with a parent container",
    "Use loading=true while fetching event data; never render an empty ticket",
    "host and space become <a> links when hostHref/spaceHref are provided",
    "ticketNumber truncates with ellipsis — no need to shorten it client-side",
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
  imageSrc: "/cn/ticket-bg.jpg",
}

export const Ready: Example<EventTicketProps> = {
  name: "Ready to join",
  args: { ...BASE, state: "ready", testId: "ticket-ready" } as EventTicketProps,
}

export const Upcoming: Example<EventTicketProps> = {
  name: "Upcoming",
  args: { ...BASE, state: "upcoming", countdown: { days: 1, hours: 10, minutes: 12 }, testId: "ticket-upcoming" } as EventTicketProps,
}

export const Joined: Example<EventTicketProps> = {
  name: "Joined",
  args: { ...BASE, state: "joined", testId: "ticket-joined" } as EventTicketProps,
}

export const Past: Example<EventTicketProps> = {
  name: "Past",
  args: { ...BASE, state: "past", testId: "ticket-past" } as EventTicketProps,
}

export const LongTitle: Example<EventTicketProps> = {
  name: "Long title",
  args: {
    state: "joined",
    title: "An Extremely Long Event Title That Wraps Across Multiple Lines To Test Card Height Growth",
    date: "FEB 3",
    time: "11:00 PM",
    host: "Valentina Restrepo-Gutiérrez",
    space: "The Grand Metropolitan Ballroom & Conference Centre",
    ticketNumber: "#RESERVATION/2024/00001/XTRA",
    imageSrc: "/cn/ticket-bg.jpg",
    onLeave: () => {},
    testId: "ticket-longTitle",
  } as EventTicketProps,
}

export const Loading: Example<EventTicketProps> = {
  name: "Loading",
  args: { loading: true, testId: "ticket-loading" } as EventTicketProps,
}

export const examples = [Ready, Upcoming, Joined, Past, LongTitle, Loading]
