"use client"

import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const checkDevice = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check on initial mount
    checkDevice()

    window.addEventListener("resize", checkDevice)

    // Cleanup listener on component unmount
    return () => {
        window.removeEventListener("resize", checkDevice)
    }
  }, [])

  return !!isMobile
}
// Trigger commit
