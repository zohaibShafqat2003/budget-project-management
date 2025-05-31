"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

interface DroppableContainerProps {
  id: string
  title: string
  itemCount: number
  children: React.ReactNode
}

export function DroppableContainer({ id, title, itemCount, children }: DroppableContainerProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full min-h-[300px] border rounded-lg",
        isOver ? "border-primary/70 bg-primary/5" : "border-border bg-card"
      )}
    >
      <div className="p-3 border-b bg-muted/50 flex items-center justify-between rounded-t-lg">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-full">
          {itemCount}
        </div>
      </div>
      <div className="p-3 flex-1 overflow-y-auto max-h-[calc(100vh-300px)]">
        {children}
      </div>
    </div>
  )
} 