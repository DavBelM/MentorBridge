"use client"

import { useEffect, useRef, ReactNode } from "react"

interface AnimateOnScrollProps {
  children: ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
}

export function AnimateOnScroll({
  children,
  className = "",
  threshold = 0.1,
  rootMargin = "0px"
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
            // Once animated, no need to observe anymore
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    const currentElement = ref.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [threshold, rootMargin])

  return (
    <div ref={ref} className={`animate-on-scroll ${className}`}>
      {children}
    </div>
  )
}