"use client"

import Link from "next/link"
import { useScroll } from "@/hooks/use-scroll"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"

export function Footer() {
  const { scrollToSection } = useScroll()
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Using Intersection Observer to trigger animations when footer comes into view
  const [footerRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToSection('about')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5,
      }
    }
  }

  const linkHoverVariants = {
    hover: { 
      scale: 1.05, 
      color: "var(--primary)",
      transition: { duration: 0.2 } 
    }
  }

  return (
    <motion.footer 
      ref={footerRef}
      className="border-t border-border"
      initial="hidden"
      animate={inView || isLoaded ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="py-8 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand Section */}
            <motion.div 
              className="text-center md:text-left"
              variants={itemVariants}
            >
              <motion.h3 
                className="text-lg font-bold text-foreground mb-2"
                whileHover={{ scale: 1.02 }}
              >
                MentorBridge
              </motion.h3>
              <motion.p 
                className="text-muted-foreground text-sm max-w-sm"
                variants={itemVariants}
              >
                Connecting Guidance, Growth, and Well-Being for African youth and professionals.
              </motion.p>
            </motion.div>

            
                        
            {/* Social Media Icons */}
            
          </div>
        </div>

        {/* Copyright */}
        <motion.div 
          className="border-t border-border"
          variants={itemVariants}
        >
          <div className="py-4">
            <motion.p 
              className="text-center text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              &copy; {new Date().getFullYear()} MentorBridge. All rights reserved.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}