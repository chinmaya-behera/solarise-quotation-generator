"use client"

import { pdf } from "@react-pdf/renderer"
import { useEffect, useRef, useState } from "react"
import { QuotationDocument } from "@/components/pdf/quotation-document"
import { defaultQuotation } from "@/lib/quotation"

export default function Inspect() {
  const host = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState("working")

  useEffect(() => {
    let cancelled = false
    async function run() {
      const pdfjs = await import("pdfjs-dist")
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString()

      const blob = await pdf(<QuotationDocument q={defaultQuotation()} />).toBlob()
      const data = new Uint8Array(await blob.arrayBuffer())
      const doc = await pdfjs.getDocument({ data }).promise
      if (cancelled) return

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement("canvas")
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = "760px"
        canvas.style.display = "block"
        canvas.style.margin = "0 auto 24px"
        canvas.style.boxShadow = "0 0 0 1px #ccc"
        canvas.id = `page-${i}`
        host.current?.appendChild(canvas)
        const ctx = canvas.getContext("2d")
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise
      }
      setStatus(`done ${doc.numPages}`)
    }
    run().catch((e) => setStatus(`error ${String(e)}`))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div style={{ background: "#eee", padding: 24 }}>
      <p id="status" style={{ fontFamily: "monospace", textAlign: "center" }}>
        {status}
      </p>
      <div ref={host} />
    </div>
  )
}
