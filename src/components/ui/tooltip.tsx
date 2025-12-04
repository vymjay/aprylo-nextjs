// components/ui/tooltip.tsx
'use client'

import React, { ReactNode } from 'react'

interface TooltipProps {
  text: string
  position?: 'top' | 'right' | 'bottom' | 'left'
  children: ReactNode  // <-- add this line
}

export default function Tooltip({ text, position = 'top', children }: TooltipProps) {
  return (
    <div className="relative group inline-block">
      {children}
      <span
        role="tooltip"
        className={`
          absolute z-10
          whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity
          group-hover:opacity-100 group-focus:opacity-100
          ${
            position === 'top'
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
              : position === 'right'
              ? 'left-full ml-2 top-1/2 -translate-y-1/2'
              : position === 'bottom'
              ? 'top-full mt-2 left-1/2 -translate-x-1/2'
              : 'right-full mr-2 top-1/2 -translate-y-1/2'
          }
        `}
      >
        {text}
      </span>
    </div>
  )
}