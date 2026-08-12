"use client"

import { usePDF } from "@react-pdf/renderer"
import { Download, ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { QuotationDocument } from "@/components/pdf/quotation-document"
import { GhostButton } from "@/components/form-kit"
import { type Quotation, formatINR } from "@/lib/quotation"

function fileName(q: Quotation) {
  const client = (q.client.shortName || q.client.name || "Client").replace(/[^\w]+/g, "_")
  const cap = q.system.acCapacity ? `${q.system.acCapacity}kW_` : ""
  return `${client}_${cap}Solar_Quotation.pdf`
}

/** Debounced snapshot so typing does not re-render the PDF on every keystroke. */
function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function PdfPreview({ q }: { q: Quotation }) {
  const stable = useDebounced(q, 500)
  const doc = useMemo(() => <QuotationDocument q={stable} />, [stable])
  const [instance, update] = usePDF({ document: doc })
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    update(doc)
  }, [doc, update])

  const pending = q !== stable
  const name = fileName(q)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Live PDF preview</p>
          <p className="truncate text-sm font-medium text-foreground">
            {q.client.name || "Untitled client"} · {formatINR(q.commercial.totalCost)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {instance.url ? (
            <GhostButton onClick={() => window.open(instance.url as string, "_blank", "noopener")}>
              <ExternalLink className="size-3.5" /> Open
            </GhostButton>
          ) : null}
          <a
            href={instance.url ?? undefined}
            download={name}
            aria-disabled={!instance.url}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            {instance.loading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            Download PDF
          </a>
        </div>
      </header>

      <div className="relative flex-1 bg-secondary">
        {instance.url ? (
          <iframe
            key={instance.url}
            src={`${instance.url}#view=FitH&toolbar=1`}
            title="Quotation PDF preview"
            className="size-full"
          />
        ) : (
          <div className="flex size-full items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Rendering document…
          </div>
        )}

        {(pending || instance.loading) && instance.url ? (
          <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1 text-[11px] font-medium text-primary-foreground shadow-sm">
            <RefreshCw className="size-3 animate-spin" /> Updating
          </div>
        ) : null}

        {instance.error ? (
          <div className="absolute inset-x-4 bottom-4 rounded-md border border-destructive/30 bg-card p-3 text-xs text-destructive">
            Could not render the PDF: {String(instance.error)}
          </div>
        ) : null}
      </div>

      <footer className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
        Vector text at full print quality · A4 · {name}
      </footer>
    </div>
  )
}
