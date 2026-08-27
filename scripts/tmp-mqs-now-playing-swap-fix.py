from pathlib import Path

path = Path("src/pages/MqsPrototype.tsx")
text = path.read_text()
old = '''            onDragOver={(event) => {
              if (!dragSource) return

              const row = (event.target as HTMLElement).closest(
                '[data-testid="upcoming-row"]'
              )
              const rect = event.currentTarget.getBoundingClientRect()
              const edge = Math.min(48, rect.height * 0.2)

              if (row) {
                if (event.clientY <= rect.top + edge) {
                  event.currentTarget.scrollTop -= 24
                } else if (event.clientY >= rect.bottom - edge) {
                  event.currentTarget.scrollTop += 24
                }
              }

              if (dragSource === "current") {
                setQueueTailDropActive(false)
                return
              }

              event.preventDefault()
              event.dataTransfer.dropEffect = "move"
              setQueueTailDropActive(!row)
            }}
'''
new = '''            onDragOver={(event) => {
              if (!dragSource) return

              const row = (event.target as HTMLElement).closest(
                '[data-testid="upcoming-row"]'
              )
              const rect = event.currentTarget.getBoundingClientRect()
              const edge = Math.min(48, rect.height * 0.2)

              if (event.clientY <= rect.top + edge) {
                event.currentTarget.scrollTop -= 24
              } else if (event.clientY >= rect.bottom - edge) {
                event.currentTarget.scrollTop += 24
              }

              if (dragSource === "current") {
                setQueueTailDropActive(false)
                return
              }

              event.preventDefault()
              event.dataTransfer.dropEffect = "move"
              setQueueTailDropActive(!row)
            }}
'''
count = text.count(old)
if count != 1:
    raise SystemExit(f"edge autoscroll anchor count: {count}")
path.write_text(text.replace(old, new, 1))
