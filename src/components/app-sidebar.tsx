"use client"

import * as React from "react"

import { NavUser } from "@/components/nav-user"
import { SpaceCard } from "@/components/space-card"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { HomeIcon, SearchIcon, CalendarIcon, TicketIcon, UserIcon, TerminalIcon, XIcon } from "lucide-react"

// This is sample data
const data = {
  user: {
    name: "Hubzz",
    email: "hello@hubzz.app",
    avatar: "",
  },
  navMain: [
    {
      title: "Spaces",
      url: "#",
      icon: <HomeIcon />,
      isActive: true,
    },
    {
      title: "Search",
      url: "#",
      icon: <SearchIcon />,
      isActive: false,
    },
    {
      title: "Events",
      url: "#",
      icon: <CalendarIcon />,
      isActive: false,
    },
    {
      title: "Tickets",
      url: "#",
      icon: <TicketIcon />,
      isActive: false,
    },
    {
      title: "Profile",
      url: "#",
      icon: <UserIcon />,
      isActive: false,
    },
  ],
  spaces: [
    {
      id: "rooftop",
      title: "Hubzz Rooftop",
      users: [
        { id: 1, name: "Sarah Wilson", initials: "S" },
        { id: 2, name: "Alex Chen", initials: "A" },
        { id: 3, name: "Jordan Smith", initials: "J" },
        { id: 4, name: "Morgan Davis", initials: "M" },
        { id: 5, name: "Taylor Brown", initials: "T" },
      ],
      isJoined: true,
    },
    {
      id: "lounge",
      title: "The Lounge",
      users: [
        { id: 6, name: "Casey Johnson", initials: "C" },
        { id: 7, name: "Riley Park", initials: "R" },
      ],
      isJoined: false,
    },
    {
      id: "workshop",
      title: "Dev Workshop",
      users: [
        { id: 8, name: "Sam Torres", initials: "S" },
        { id: 9, name: "Drew Kim", initials: "D" },
        { id: 10, name: "Avery Lin", initials: "A" },
        { id: 11, name: "Blake Nguyen", initials: "B" },
        { id: 12, name: "Quinn Adams", initials: "Q" },
        { id: 13, name: "Reese Hall", initials: "R" },
      ],
      isJoined: false,
    },
    {
      id: "chill",
      title: "Chill Zone",
      users: [
        { id: 14, name: "Jamie Fox", initials: "J" },
      ],
      isJoined: false,
    },
    {
      id: "stage",
      title: "Main Stage",
      users: [
        { id: 15, name: "Pat Lee", initials: "P" },
        { id: 16, name: "Chris Wu", initials: "C" },
        { id: 17, name: "Dana Ruiz", initials: "D" },
        { id: 18, name: "Eli Grant", initials: "E" },
      ],
      isJoined: false,
    },
  ],
}

export function AppSidebar({ onSpaceSelect, ...props }: React.ComponentProps<typeof Sidebar> & { onSpaceSelect?: (title: string) => void }) {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState(data.navMain[0])
  const { open, setOpen, toggleSidebar } = useSidebar()

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="md:h-8 md:p-0" onClick={toggleSidebar}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {open ? <XIcon className="size-4" /> : <TerminalIcon className="size-4" />}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Hubzz</span>
                  <span className="truncate text-xs">Social Virtual World</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        setOpen(true)
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="text-base font-medium text-foreground">
            {activeItem?.title}
          </div>
          <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent className="flex flex-col gap-3 p-4">
              {data.spaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  title={space.title}
                  users={space.users}
                  isJoined={space.isJoined}
                  onJoin={() => onSpaceSelect?.(space.title)}
                />
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
