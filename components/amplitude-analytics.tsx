"use client"

import { useEffect } from "react"
import * as amplitude from "@amplitude/unified"

const API_KEY = "e448dc39d617fe1dfe144577175376c9"

export function AmplitudeAnalytics() {
  useEffect(() => {
    amplitude.initAll(API_KEY, {
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    })

    const hasVisitedBefore = localStorage.getItem("sivirina_has_visited") === "true"
    const identifyObj = new amplitude.Identify()
    identifyObj.set("Returning Visitor", hasVisitedBefore)
    amplitude.identify(identifyObj)
    localStorage.setItem("sivirina_has_visited", "true")
  }, [])

  return null
}
