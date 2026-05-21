"use client"

import { useEffect } from "react"
import * as amplitude from "@amplitude/analytics-browser"

const API_KEY = "e448dc39d617fe1dfe144577175376c9"

export function AmplitudeAnalytics() {
  useEffect(() => {
    amplitude.init(API_KEY, {
      autocapture: true,
    })
  }, [])

  return null
}
