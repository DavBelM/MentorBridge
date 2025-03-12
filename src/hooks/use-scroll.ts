"use client"

export const useScroll = () => {
  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      })
    }
  }

  return { scrollToSection }
}
