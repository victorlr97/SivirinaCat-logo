"use client"

import Image from "next/image"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/utils"
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"
import { WHATSAPP_NUMBER, SITE_URL } from "@/lib/constants"
import { trackPurchaseInquiryStarted, trackOutboundLinkOpened } from "@/lib/amplitude"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart()

  const handleCheckout = () => {
    const lines = items.map((item, index) => {
      const sizeLabel = item.size ? ` (Tamanho: ${item.size})` : ""
      return `${index + 1}. ${item.name}${sizeLabel} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`
    })

    const message = [
      "Olá! Gostaria de comprar os seguintes itens:",
      "",
      ...lines,
      "",
      `Total: ${formatCurrency(total)}`,
      "",
      `${SITE_URL}/catalogo`,
    ].join("\n")

    trackPurchaseInquiryStarted({
      productId: items.map((i) => i.productId).join(","),
      productName: items.map((i) => i.name).join(", "),
      productType: "carrinho",
      priceBrl: total,
      currency: "BRL",
      outboundChannel: "whatsapp",
      messageTemplate: "cart_checkout",
    })
    trackOutboundLinkOpened({
      destinationDomain: "wa.me",
      destinationPath: `/${WHATSAPP_NUMBER}`,
      linkLabel: "Finalizar no WhatsApp",
      outboundChannel: "whatsapp",
      pageContext: "cart",
    })

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    )
    clearCart()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Carrinho</SheetTitle>
          <SheetDescription className="sr-only">Itens selecionados para compra</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size ?? "none"}`} className="flex gap-3">
                <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{item.name}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Remover item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {item.size && <p className="text-xs text-muted-foreground">Tamanho: {item.size}</p>}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center rounded border border-border">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <SheetFooter className="border-t">
            <div className="flex items-center justify-between text-base font-medium">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <Button
              type="button"
              size="lg"
              className="w-full bg-green-700 text-white hover:bg-green-800"
              onClick={handleCheckout}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Finalizar no WhatsApp
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
