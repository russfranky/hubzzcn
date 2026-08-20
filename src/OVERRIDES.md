# shadcn Overrides

Customizations made on top of stock shadcn components. Each entry documents what was changed and why.

## 1. Sidebar header icon — close when extended

**File:** `src/components/app-sidebar.tsx`
**Component:** SidebarHeader logo button (icon sidebar)
**Change:** TerminalIcon swaps to XIcon when sidebar is expanded (`open` state from `useSidebar()`). Clicking toggles the sidebar open/closed via `toggleSidebar()`. Removed `asChild` + `<a>` wrapper since it's now a button action, not a link.
**Reason:** User-requested. Provides visual affordance to close the extended nav panel.

## 2. Removed SidebarTrigger from content header

**File:** `src/pages/SidebarApp.tsx`
**Change:** Removed `SidebarTrigger` button and adjacent `Separator` from the main content header. The toggle functionality is now handled by the icon sidebar header button (override #1).
**Reason:** User-requested. Redundant since the close/logo button in the icon sidebar already toggles the sidebar.

## 3. Avatar single-letter initials

**File:** `src/components/app-sidebar.tsx`
**Change:** All user initials changed from two letters ("SW") to single letters ("S").
**Reason:** User-requested. Cleaner look at small avatar sizes.

## 4. AvatarGroup ring matches sidebar background

**File:** `src/components/space-card.tsx`
**Change:** Added `className="*:data-[slot=avatar]:ring-sidebar"` to `AvatarGroup` to override the default `ring-background` with `ring-sidebar`, matching the sidebar panel color behind the avatars.
**Reason:** User-requested. The default `ring-background` (#181B1F) doesn't match the sidebar surface (#24262B) where the avatars sit.
