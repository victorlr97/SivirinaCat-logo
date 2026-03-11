import { put } from "@vercel/blob"
import { readFileSync } from "fs"

async function uploadImage() {
  const response = await fetch(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_8391-gb80wJK4Xjkq7jiIF7ZTNrpUkJtMRA.webp"
  )
  const buffer = await response.arrayBuffer()

  const blob = await put("brand-story/IMG_8391.webp", Buffer.from(buffer), {
    access: "public",
    contentType: "image/webp",
  })

  console.log("Upload concluído:", blob.url)
}

uploadImage().catch(console.error)
