import type React from "react"
import type { Metadata } from "next"
import { Montserrat_Alternates, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { SmoothScroll } from "@/components/smooth-scroll"
import "./globals.css"

const montserratAlternates = Montserrat_Alternates({ 
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-sans"
})

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display"
})

export const metadata: Metadata = {
  title: "SIVIRINA",
  description: "Roupas casuais sofisticadas para mulheres que transitam entre trabalho e eventos sociais",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${montserratAlternates.variable} ${montserrat.variable} font-sans antialiased`}>
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
