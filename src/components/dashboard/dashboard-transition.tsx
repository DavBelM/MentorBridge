"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DashboardTransitionProps {
  children: React.ReactNode
  className?: string
}

export function DashboardTransition({ children, className }: DashboardTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  )
} 