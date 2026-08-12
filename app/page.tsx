"use client"

import { FileText, Loader2, RotateCcw, Sun } from "lucide-react"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { QuotationForm } from "@/components/quotation-form"
import { COMPANY, type Quotation, defaultQuotation } from "@/lib/quotation"

const PdfPreview = dynamic(() => import("@/components/pdf-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> Loading PDF engine…
    </div>
  ),
})

const STORAGE_KEY = "adp-quotation-draft-v1"

export default function Page() {
  const [q, setQ] = useState<Quotation>(defaultQuotation)
  const [tab, setTab] = useState<"form" | "preview">("form")
  const [restored, setRestored] = useState(false)

  // Restore the last in-progress draft so a refresh never loses typed details.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setQ({ ...defaultQuotation(), ...(JSON.parse(raw) as Quotation) })
    } catch {
      /* ignore malformed drafts */
    }
    setRestored(true)
  }, [])

  useEffect(() => {
    if (!restored) return
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(q))
      } catch {
        /* storage unavailable */
      }
    }, 400)
    return () => clearTimeout(t)
  }, [q, restored])

  function resetAll() {
    setQ(defaultQuotation())
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-4 px-4 py-3 lg:px-6">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sun className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold leading-tight text-foreground">{COMPANY.shortName}</h1>
            <p className="truncate text-xs text-muted-foreground">Solar quotation &amp; proposal generator</p>
          </div>

          <nav aria-label="View" className="flex items-center gap-1 rounded-md border border-border bg-card p-1 lg:hidden">
            {(["form", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-current={tab === t}
                className="rounded px-3 py-1.5 text-xs font-medium text-muted-foreground aria-[current=true]:bg-primary aria-[current=true]:text-primary-foreground"
              >
                {t === "form" ? "Details" : "PDF"}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-6">
        <section aria-label="Quotation details" className={tab === "form" ? "min-w-0" : "hidden min-w-0 lg:block"}>
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <FileText className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Every field below is editable and flows straight into the PDF. The company identity stays fixed as{" "}
              <span className="font-medium text-foreground">{COMPANY.shortName}</span>. Your draft is saved locally as you
              type.
            </p>
          </div>
          <QuotationForm q={q} setQ={setQ} />
        </section>

        <section aria-label="PDF preview" className={tab === "preview" ? "min-w-0" : "hidden min-w-0 lg:block"}>
          <div className="lg:sticky lg:top-[76px] lg:h-[calc(100svh-100px)]">
            <div className="h-[75svh] lg:h-full">
              <PdfPreview q={q} />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        {COMPANY.shortName} · {COMPANY.tagline}
      </footer>
    </div>
  )
}
