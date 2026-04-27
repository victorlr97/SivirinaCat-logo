"use client"

import { useEffect } from "react"
import { analyticsPromise } from "@/lib/firebase/client"

export function FirebaseAnalytics() {
  useEffect(() => {
    analyticsPromise.catch(console.error)
  }, [])

  return null
}
