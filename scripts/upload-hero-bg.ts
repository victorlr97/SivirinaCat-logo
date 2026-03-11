import { put } from "@vercel/blob"

const imageUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/foto_bg-hMdpGqsxB93sXTfBhUIX64WeqhzdRX.webp"

const response = await fetch(imageUrl)
const buffer = await response.arrayBuffer()
const blob = await put("hero/foto_bg.webp", buffer, {
  access: "public",
  contentType: "image/webp",
})

console.log("Uploaded:", blob.url)
