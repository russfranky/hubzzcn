import * as React from "react"

type Props = {
  items: readonly { id: string }[]
  focusOwner: string
  label: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

type FocusSnapshot = {
  element: HTMLElement
  rowId: string | null
  previousIds: string[]
}

function usable(element: HTMLElement) {
  return (
    element.isConnected &&
    element.tabIndex >= 0 &&
    !element.matches(":disabled") &&
    !element.closest("[hidden], [inert]") &&
    element.getClientRects().length > 0
  )
}

/**
 * Capture actual focus before React mutates the DOM, not when a command is sent.
 * getSnapshotBeforeUpdate has no equivalent pre-mutation function-component hook.
 * This boundary owns only focus; it never changes a host snapshot or emits commands.
 */
export class MqsFocusBoundary extends React.Component<Props> {
  private section = React.createRef<HTMLElement>()

  getSnapshotBeforeUpdate(previous: Readonly<Props>): FocusSnapshot | null {
    const root = this.section.current
    const doc = root?.ownerDocument
    const ElementType = doc?.defaultView?.HTMLElement
    const element = doc?.activeElement
    if (
      !root ||
      !doc?.hasFocus() ||
      !ElementType ||
      !(element instanceof ElementType)
    ) {
      return null
    }
    const owner = element.closest("[data-mqs-focus-owner]")
    if (owner?.getAttribute("data-mqs-focus-owner") !== this.props.focusOwner) {
      return null
    }
    return {
      element,
      rowId:
        element
          .closest("[data-mqs-focus-row]")
          ?.getAttribute("data-mqs-focus-row") ?? null,
      previousIds: previous.items.map((item) => item.id),
    }
  }

  componentDidUpdate(
    _previous: Readonly<Props>,
    _state: Readonly<unknown>,
    snapshot: FocusSnapshot | null
  ) {
    const root = this.section.current
    if (!root?.isConnected || !snapshot || usable(snapshot.element)) return
    const doc = root.ownerDocument
    // Respect another component's deliberate focus change during this commit.
    if (
      !doc.hasFocus() ||
      (doc.activeElement !== snapshot.element &&
        doc.activeElement !== doc.body &&
        doc.activeElement !== doc.documentElement)
    )
      return

    if (snapshot.rowId !== null) {
      const grips = new Map(
        Array.from(root.querySelectorAll<HTMLElement>("[data-mqs-focus-grip]"))
          .filter(usable)
          .map((element) => [
            element.getAttribute("data-mqs-focus-grip"),
            element,
          ])
      )
      const index = snapshot.previousIds.indexOf(snapshot.rowId)
      const candidates = [
        snapshot.rowId,
        ...snapshot.previousIds.slice(index + 1),
        ...snapshot.previousIds.slice(0, Math.max(0, index)).reverse(),
        ...this.props.items.map((item) => item.id),
      ]
      for (const id of candidates) {
        const target = grips.get(id)
        if (target) {
          target.focus()
          return
        }
      }
    }

    // Empty queues favor recovery/import. Disabled transport or seek controls
    // favor Play/Pause. Mute remains available when optional callbacks are absent.
    const order = this.props.items.length
      ? ["play", "mute", "load", "close"]
      : ["load", "close", "mute"]
    const controls = Array.from(
      root.querySelectorAll<HTMLElement>("[data-mqs-focus-fallback]")
    ).filter(usable)
    for (const name of order) {
      const target = controls.find(
        (element) => element.getAttribute("data-mqs-focus-fallback") === name
      )
      if (target) {
        target.focus()
        return
      }
    }
  }

  render() {
    return (
      <section
        ref={this.section}
        data-testid="mqs-window"
        data-mqs-focus-owner={this.props.focusOwner}
        aria-label={this.props.label}
        className={this.props.className}
        style={this.props.style}
      >
        {this.props.children}
      </section>
    )
  }
}
