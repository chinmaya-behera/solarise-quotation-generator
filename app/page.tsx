"use client"

import { ArrowRight, FileText, Loader2, RotateCcw, Sparkles } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
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

  function applySmartBrief(form: HTMLFormElement) {
    const data = new FormData(form)
    const bill = Number(data.get("bill") || 0)
    const area = Number(data.get("area") || 0)
    const moduleWattage = String(data.get("moduleWattage") || "550")
    const payment = String(data.get("payment") || "70% advance, 20% on delivery, 10% after commissioning")
    const estimatedKw = area > 0 ? Math.max(1, Math.min(250, Math.round((area / 100) * 10) / 10)) : Math.max(3, Math.min(50, Math.round((bill / 900) * 10) / 10))
    const modules = Math.max(4, Math.ceil((estimatedKw * 1000) / Number(moduleWattage)))
    setQ((p) => ({
      ...p,
      system: {
        ...p.system,
        acCapacity: String(estimatedKw),
        dcCapacity: `${((modules * Number(moduleWattage)) / 1000).toFixed(2)} kWp`,
        moduleWattage,
        moduleQty: String(modules),
        annualGeneration: `${Math.round(estimatedKw * 1400).toLocaleString("en-IN")} – ${Math.round(estimatedKw * 1600).toLocaleString("en-IN")} kWh`,
      },
      commercial: { ...p.commercial, deliveryPeriod: `${payment} · ${p.commercial.deliveryPeriod}`, totalCost: String(Math.round(estimatedKw * 1000 * Number(p.commercial.ratePerWatt || 48))) },
      meta: { ...p.meta, documentTitle: `${estimatedKw} kW Grid Connected Rooftop Solar Power Plant` },
      letter: { ...p.letter, paragraphs: [`Estimated from a current electricity bill of ₹${bill.toLocaleString("en-IN")} per month and an available rooftop area of ${area.toLocaleString("en-IN")} sq. ft.`, ...p.letter.paragraphs.slice(1)] },
    }))
    setTab("preview")
  }

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
          <div className="flex h-11 w-[132px] shrink-0 items-center overflow-hidden rounded-md bg-white px-2 shadow-sm ring-1 ring-primary/10">
            <Image src="/adp-logo.jpeg" alt="ADP Green Energies Private Limited" width={220} height={110} className="h-auto w-full object-contain" priority />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Smart quote studio</span>
            </div>
            <h1 className="truncate text-sm font-semibold leading-tight text-foreground">{COMPANY.shortName}</h1>
            <p className="truncate text-xs text-muted-foreground">Turn a few site facts into a client-ready solar proposal</p>
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
          <form
            onSubmit={(event) => {
              event.preventDefault()
              applySmartBrief(event.currentTarget)
            }}
            className="mb-4 overflow-hidden rounded-xl border border-primary/20 bg-[linear-gradient(135deg,oklch(0.97_0.025_145),white_55%,oklch(0.97_0.04_75))] shadow-sm"
          >
            <div className="flex items-start gap-3 border-b border-primary/10 px-4 py-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"><Sparkles className="size-4" aria-hidden /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Generate from a site brief</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Enter the four facts you already know. We&apos;ll estimate the system size, panel count, annual generation and commercial total for you.</p>
              </div>
            </div>
            <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="grid gap-1.5"><span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Monthly bill (₹)</span><input name="bill" type="number" min="0" placeholder="25000" className="h-10 rounded-md border border-border bg-white px-3 text-sm outline-none ring-primary/30 transition focus:ring-2" /></label>
              <label className="grid gap-1.5"><span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Rooftop area (sq. ft.)</span><input name="area" type="number" min="0" placeholder="2400" className="h-10 rounded-md border border-border bg-white px-3 text-sm outline-none ring-primary/30 transition focus:ring-2" /></label>
              <label className="grid gap-1.5"><span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Panel wattage</span><select name="moduleWattage" defaultValue="550" className="h-10 rounded-md border border-border bg-white px-3 text-sm outline-none ring-primary/30 transition focus:ring-2"><option value="550">550 Wp</option><option value="540">540 Wp</option><option value="575">575 Wp</option><option value="600">600 Wp</option></select></label>
              <label className="grid gap-1.5"><span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Payment mode</span><select name="payment" defaultValue="70% advance, 20% on delivery, 10% after commissioning" className="h-10 rounded-md border border-border bg-white px-3 text-sm outline-none ring-primary/30 transition focus:ring-2"><option>70% advance, 20% on delivery, 10% after commissioning</option><option>50% advance, 30% on delivery, 20% after commissioning</option><option>100% on commissioning</option></select></label>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-primary/10 px-4 py-3"><span className="text-xs text-muted-foreground">You can refine every generated field below before downloading.</span><button type="submit" className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"><Sparkles className="size-3.5" aria-hidden /> Generate quote <ArrowRight className="size-3.5" aria-hidden /></button></div>
          </form>
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
