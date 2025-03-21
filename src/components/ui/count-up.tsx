"use client"

import { useEffect, useState, useRef } from "react"

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function OptimizedCountUp({ 
  end, 
  duration = 2, 
  suffix = "", 
  prefix = "" 
}: CountUpProps) {
  const [count, setCount] = useState(0)
  const countRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    const step = end / (duration * 60) // 60fps
    const startTime = Date.now()
    const targetTime = startTime + duration * 1000
    
    const updateCount = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)
      
      countRef.current = Math.floor(progress * end)
      setCount(countRef.current)
      
      if (now < targetTime) {
        timerRef.current = setTimeout(updateCount, 16) // ~60fps
      } else {
        setCount(end) // Ensure final value is exact
      }
    }
    
    updateCount()
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [end, duration])
  
  return (
    <span>{prefix}{count}{suffix}</span>
  )
}