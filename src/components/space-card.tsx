import {
  Item,
  ItemHeader,
  ItemFooter,
  ItemTitle,
} from "@/components/ui/item"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface SpaceUser {
  id: number
  name: string
  initials: string
  avatar?: string
}

interface SpaceCardProps {
  title: string
  users: SpaceUser[]
  isJoined?: boolean
  onJoin?: () => void
  onLeave?: () => void
}

export function SpaceCard({
  title,
  users,
  isJoined = false,
  onJoin,
  onLeave,
}: SpaceCardProps) {
  return (
    <Item variant="outline" size="sm">
      <ItemHeader>
        <ItemTitle>{title}</ItemTitle>
      </ItemHeader>
      <ItemFooter>
        <AvatarGroup className="*:data-[slot=avatar]:ring-sidebar">
          {users.slice(0, 3).map((user) => (
            <Avatar key={user.id} size="sm">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
          ))}
          {users.length > 3 && (
            <AvatarGroupCount>+{users.length - 3}</AvatarGroupCount>
          )}
        </AvatarGroup>
        {isJoined ? (
          <Button variant="outline" size="xs" onClick={onLeave}>
            Leave
          </Button>
        ) : (
          <Button size="xs" onClick={onJoin}>
            Join
          </Button>
        )}
      </ItemFooter>
    </Item>
  )
}
