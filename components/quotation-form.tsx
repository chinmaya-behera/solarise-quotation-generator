"use client"

import { Plus, Trash2, Wand2, X } from "lucide-react"
import type { ChangeEvent, Dispatch, SetStateAction } from "react"
import { Field, GhostButton, IconButton, SectionCard, TextArea, TextInput } from "@/components/form-kit"
import {
  amountInWords,
  formatINR,
  milestoneAmount,
  type Quotation,
  SECTION_KEYS,
  SECTION_LABELS,
  suggestedDcCapacity,
  suggestedModuleQty,
  toNumber,
  uid,
} from "@/lib/quotation"

type Setter = Dispatch<SetStateAction<Quotation>>

export function QuotationForm({ q, setQ }: { q: Quotation; setQ: Setter }) {
  const patch = <K extends keyof Quotation>(key: K, value: Partial<Quotation[K]>) =>
    setQ((p) => ({ ...p, [key]: { ...(p[key] as object), ...value } }) as Quotation)

  const setList = <K extends keyof Quotation>(key: K, value: Quotation[K]) =>
    setQ((p) => ({ ...p, [key]: value }) as Quotation)

  /* rate <-> total sync */
  const watts = Math.round(toNumber(q.system.acCapacity) * 1000)
  const onRate = (v: string) =>
    patch("commercial", { ratePerWatt: v, totalCost: String(Math.round(toNumber(v) * watts)) })
  const onTotal = (v: string) =>
    patch("commercial", {
      totalCost: v.replace(/[^0-9]/g, ""),
      ratePerWatt: watts ? (toNumber(v) / watts).toFixed(2) : q.commercial.ratePerWatt,
    })

  const autoFillSystem = () => {
    const qty = suggestedModuleQty(q.system.acCapacity, q.system.moduleWattage)
    const dc = suggestedDcCapacity(String(qty), q.system.moduleWattage)
    const kw = toNumber(q.system.acCapacity)
    patch("system", {
      moduleQty: String(qty),
      dcCapacity: dc,
      inverter: q.system.inverter.replace(/\d+(\.\d+)?\s*kW/i, `${kw} kW`),
      annualGeneration: `${Math.round(kw * 1400).toLocaleString("en-IN")} – ${Math.round(kw * 1600).toLocaleString("en-IN")} kWh`,
    })
    patch("meta", {
      documentTitle: q.meta.documentTitle.replace(/^\s*\d+(\.\d+)?\s*kW[p]?/i, `${kw} kW`),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ------------------------------ document ------------------------------ */}
      <SectionCard title="Document & client" description="Appears on the cover, header and signature pages.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Document title" className="sm:col-span-2">
            <TextInput
              value={q.meta.documentTitle}
              onChange={(e) => patch("meta", { documentTitle: e.target.value })}
              placeholder="20 kW Grid Connected Rooftop Solar Power Plant"
            />
          </Field>
          <Field label="Subtitle" className="sm:col-span-2">
            <TextInput
              value={q.meta.documentSubtitle}
              onChange={(e) => patch("meta", { documentSubtitle: e.target.value })}
            />
          </Field>
          <Field label="Quotation no.">
            <TextInput value={q.meta.quotationNo} onChange={(e) => patch("meta", { quotationNo: e.target.value })} />
          </Field>
          <Field label="Date">
            <TextInput type="date" value={q.meta.date} onChange={(e) => patch("meta", { date: e.target.value })} />
          </Field>
          <Field label="Validity (days)">
            <TextInput
              inputMode="numeric"
              value={q.meta.validityDays}
              onChange={(e) => patch("meta", { validityDays: e.target.value.replace(/[^0-9]/g, "") })}
            />
          </Field>
          <Field label="Prepared by">
            <TextInput value={q.meta.preparedByName} onChange={(e) => patch("meta", { preparedByName: e.target.value })} />
          </Field>
          <Field label="Designation">
            <TextInput
              value={q.meta.preparedByDesignation}
              onChange={(e) => patch("meta", { preparedByDesignation: e.target.value })}
            />
          </Field>
          <Field label="Client / organisation name">
            <TextInput value={q.client.name} onChange={(e) => patch("client", { name: e.target.value })} />
          </Field>
          <Field label="Short name (footer)">
            <TextInput value={q.client.shortName} onChange={(e) => patch("client", { shortName: e.target.value })} />
          </Field>
          <Field label="Client type">
            <TextInput
              value={q.client.type}
              onChange={(e) => patch("client", { type: e.target.value })}
              placeholder="Educational Institution"
            />
          </Field>
          <Field label="Site address" className="sm:col-span-2">
            <TextInput value={q.client.address} onChange={(e) => patch("client", { address: e.target.value })} />
          </Field>
          <Field label="Contact person">
            <TextInput
              value={q.client.contactPerson}
              onChange={(e) => patch("client", { contactPerson: e.target.value })}
            />
          </Field>
          <Field label="Client signatory label">
            <TextInput
              value={q.acceptance.clientSignatoryLabel}
              onChange={(e) => patch("acceptance", { clientSignatoryLabel: e.target.value })}
            />
          </Field>
          <Field label="Electric Bill Amount (₹)">
            <TextInput
              type="number"
              value={q.client.electricBillAmount?.toString() || ''}
              onChange={(e) => patch("client", { electricBillAmount: Number(e.target.value) })}
              placeholder="e.g. 5000"
            />
          </Field>
          <Field label="Rooftop Area (sq.ft)">
            <TextInput
              type="number"
              value={q.client.rooftopArea?.toString() || ''}
              onChange={(e) => patch("client", { rooftopArea: Number(e.target.value) })}
              placeholder="e.g. 500"
            />
          </Field>
          <Field label="Payment Method (Cash / Loan)">
            <TextInput
              value={q.client.paymentMethod || ''}
              onChange={(e) => patch("client", { paymentMethod: e.target.value })}
              placeholder="e.g. Loan"
            />
          </Field>
          <div className="pt-2 pb-4">
            <GhostButton
              type="button"
              className="w-full"
              onClick={() => {
                let suggestedCapacity = q.system.acCapacity;
                if (q.client.rooftopArea && q.client.rooftopArea > 0) {
                  suggestedCapacity = Math.max(suggestedCapacity, q.client.rooftopArea / 100);
                } else if (q.client.electricBillAmount && q.client.electricBillAmount > 0) {
                  suggestedCapacity = Math.max(suggestedCapacity, q.client.electricBillAmount / 1000);
                }
                patch("system", { acCapacity: suggestedCapacity });
              }}
            >
              Auto Suggest Capacity
            </GhostButton>
          </div>

        </div>
      </SectionCard>

      {/* ------------------------------ technical ------------------------------ */}
      <SectionCard
        title="Technical configuration"
        description="Drives the specification table and capacity figures."
        action={
          <GhostButton onClick={autoFillSystem}>
            <Wand2 className="size-3.5" /> Auto-calculate
          </GhostButton>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Plant capacity (kW AC)">
            <TextInput
              inputMode="decimal"
              value={q.system.acCapacity}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9.]/g, "")
                const newWatts = Math.round(toNumber(v) * 1000)
                setQ((p) => ({
                  ...p,
                  system: { ...p.system, acCapacity: v },
                  commercial: {
                    ...p.commercial,
                    totalCost: String(Math.round(toNumber(p.commercial.ratePerWatt) * newWatts)),
                  },
                }))
              }}
            />
          </Field>
          <Field label="Installed DC capacity">
            <TextInput value={q.system.dcCapacity} onChange={(e) => patch("system", { dcCapacity: e.target.value })} />
          </Field>
          <Field label="Module make & type">
            <TextInput value={q.system.moduleSpec} onChange={(e) => patch("system", { moduleSpec: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Module Wp">
              <TextInput
                inputMode="numeric"
                value={q.system.moduleWattage}
                onChange={(e) => patch("system", { moduleWattage: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </Field>
            <Field label="Module qty">
              <TextInput
                inputMode="numeric"
                value={q.system.moduleQty}
                onChange={(e) => patch("system", { moduleQty: e.target.value.replace(/[^0-9]/g, "") })}
              />
            </Field>
          </div>
          <Field label="Inverter">
            <TextInput value={q.system.inverter} onChange={(e) => patch("system", { inverter: e.target.value })} />
          </Field>
          <Field label="Mounting structure">
            <TextInput value={q.system.mounting} onChange={(e) => patch("system", { mounting: e.target.value })} />
          </Field>
          <Field label="System type">
            <TextInput value={q.system.systemType} onChange={(e) => patch("system", { systemType: e.target.value })} />
          </Field>
          <Field label="Grid supply">
            <TextInput value={q.system.gridSupply} onChange={(e) => patch("system", { gridSupply: e.target.value })} />
          </Field>
          <Field label="Monitoring">
            <TextInput value={q.system.monitoring} onChange={(e) => patch("system", { monitoring: e.target.value })} />
          </Field>
          <Field label="Design life">
            <TextInput value={q.system.designLife} onChange={(e) => patch("system", { designLife: e.target.value })} />
          </Field>
          <Field label="Expected annual generation" className="sm:col-span-2">
            <TextInput
              value={q.system.annualGeneration}
              onChange={(e) => patch("system", { annualGeneration: e.target.value })}
            />
          </Field>
          <Field label="Standards note" className="sm:col-span-2">
            <TextArea
              value={q.system.standardsNote}
              onChange={(e) => patch("system", { standardsNote: e.target.value })}
            />
          </Field>
        </div>
      </SectionCard>

      {/* ----------------------------- commercial ----------------------------- */}
      <SectionCard title="Commercial quotation" description="Rate and total stay in sync with the plant capacity.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Rate (₹ per Watt)">
            <TextInput inputMode="decimal" value={q.commercial.ratePerWatt} onChange={(e) => onRate(e.target.value)} />
          </Field>
          <Field label="Total project value (₹)" hint={amountInWords(q.commercial.totalCost)}>
            <TextInput inputMode="numeric" value={q.commercial.totalCost} onChange={(e) => onTotal(e.target.value)} />
          </Field>
          <Field label="Tax note">
            <TextInput value={q.commercial.gstNote} onChange={(e) => patch("commercial", { gstNote: e.target.value })} />
          </Field>
          <Field label="Delivery period">
            <TextInput
              value={q.commercial.deliveryPeriod}
              onChange={(e) => patch("commercial", { deliveryPeriod: e.target.value })}
            />
          </Field>
          <Field label="Footnote" className="sm:col-span-2">
            <TextArea
              value={q.commercial.footnote}
              onChange={(e) => patch("commercial", { footnote: e.target.value })}
            />
          </Field>
        </div>

        <p className="mt-5 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Inclusions
        </p>
        <div className="flex flex-col gap-2">
          {q.commercial.inclusions.map((inc) => (
            <div key={inc.id} className="flex items-center gap-2">
              <TextInput
                value={inc.a}
                onChange={(e) =>
                  patch("commercial", {
                    inclusions: q.commercial.inclusions.map((x) => (x.id === inc.id ? { ...x, a: e.target.value } : x)),
                  })
                }
              />
              <TextInput
                className="max-w-40"
                value={inc.b}
                onChange={(e) =>
                  patch("commercial", {
                    inclusions: q.commercial.inclusions.map((x) => (x.id === inc.id ? { ...x, b: e.target.value } : x)),
                  })
                }
              />
              <IconButton
                aria-label="Remove inclusion"
                onClick={() =>
                  patch("commercial", { inclusions: q.commercial.inclusions.filter((x) => x.id !== inc.id) })
                }
              >
                <X className="size-3.5" />
              </IconButton>
            </div>
          ))}
        </div>
        <GhostButton
          className="mt-2"
          onClick={() =>
            patch("commercial", {
              inclusions: [...q.commercial.inclusions, { id: uid("i"), a: "", b: "Included" }],
            })
          }
        >
          <Plus className="size-3.5" /> Add inclusion
        </GhostButton>

        <p className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Payment milestones
        </p>
        <div className="flex flex-col gap-3">
          {q.commercial.milestones.map((m) => (
            <div key={m.id} className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <TextInput
                  className="max-w-44"
                  value={m.label}
                  onChange={(e) =>
                    patch("commercial", {
                      milestones: q.commercial.milestones.map((x) =>
                        x.id === m.id ? { ...x, label: e.target.value } : x,
                      ),
                    })
                  }
                />
                <TextInput
                  className="max-w-20"
                  inputMode="numeric"
                  value={String(m.percent)}
                  onChange={(e) =>
                    patch("commercial", {
                      milestones: q.commercial.milestones.map((x) =>
                        x.id === m.id ? { ...x, percent: toNumber(e.target.value) } : x,
                      ),
                    })
                  }
                />
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {formatINR(milestoneAmount(q, m))}
                </span>
                <IconButton
                  className="ml-auto"
                  aria-label="Remove milestone"
                  onClick={() =>
                    patch("commercial", { milestones: q.commercial.milestones.filter((x) => x.id !== m.id) })
                  }
                >
                  <Trash2 className="size-3.5" />
                </IconButton>
              </div>
              <TextArea
                className="mt-2 min-h-14"
                value={m.condition}
                onChange={(e) =>
                  patch("commercial", {
                    milestones: q.commercial.milestones.map((x) =>
                      x.id === m.id ? { ...x, condition: e.target.value } : x,
                    ),
                  })
                }
              />
            </div>
          ))}
        </div>
        <GhostButton
          className="mt-2"
          onClick={() =>
            patch("commercial", {
              milestones: [...q.commercial.milestones, { id: uid("m"), label: "Milestone", percent: 0, condition: "" }],
            })
          }
        >
          <Plus className="size-3.5" /> Add milestone
        </GhostButton>
        <p className="mt-3 text-xs text-muted-foreground">
          Milestones total{" "}
          <span className="font-medium text-foreground">
            {q.commercial.milestones.reduce((a, m) => a + m.percent, 0)}%
          </span>{" "}
          of {formatINR(q.commercial.totalCost)}.
        </p>
      </SectionCard>

      {/* -------------------------------- BOQ -------------------------------- */}
      <SectionCard title="Bill of quantities" description="Add, edit, remove or reorder any line item.">
        <div className="flex flex-col gap-2">
          {q.boq.rows.map((r, i) => (
            <div key={r.id} className="flex items-start gap-2">
              <span className="w-5 pt-2 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
              <TextInput
                className="flex-[1.1]"
                value={r.component}
                placeholder="Component"
                onChange={(e) =>
                  patch("boq", {
                    rows: q.boq.rows.map((x) => (x.id === r.id ? { ...x, component: e.target.value } : x)),
                  })
                }
              />
              <TextInput
                className="flex-[1.6]"
                value={r.specification}
                placeholder="Specification"
                onChange={(e) =>
                  patch("boq", {
                    rows: q.boq.rows.map((x) => (x.id === r.id ? { ...x, specification: e.target.value } : x)),
                  })
                }
              />
              <TextInput
                className="max-w-28"
                value={r.qty}
                placeholder="Qty"
                onChange={(e) =>
                  patch("boq", { rows: q.boq.rows.map((x) => (x.id === r.id ? { ...x, qty: e.target.value } : x)) })
                }
              />
              <IconButton
                className="mt-1"
                aria-label="Remove line item"
                onClick={() => patch("boq", { rows: q.boq.rows.filter((x) => x.id !== r.id) })}
              >
                <X className="size-3.5" />
              </IconButton>
            </div>
          ))}
        </div>
        <GhostButton
          className="mt-3"
          onClick={() =>
            patch("boq", { rows: [...q.boq.rows, { id: uid("b"), component: "", specification: "", qty: "" }] })
          }
        >
          <Plus className="size-3.5" /> Add line item
        </GhostButton>
        <Field label="BOQ note" className="mt-4">
          <TextArea value={q.boq.note} onChange={(e) => patch("boq", { note: e.target.value })} />
        </Field>
      </SectionCard>

      {/* --------------------------- scope & features --------------------------- */}
      <SectionCard title="Scope of work" description="Execution phases and the list of covered services.">
        <Field label="Intro">
          <TextArea value={q.scope.intro} onChange={(e) => patch("scope", { intro: e.target.value })} />
        </Field>
        <div className="mt-4 flex flex-col gap-3">
          {q.scope.phases.map((p, i) => (
            <div key={p.id} className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
                <TextInput
                  value={p.title}
                  onChange={(e) =>
                    patch("scope", {
                      phases: q.scope.phases.map((x) => (x.id === p.id ? { ...x, title: e.target.value } : x)),
                    })
                  }
                />
                <IconButton
                  aria-label="Remove phase"
                  onClick={() => patch("scope", { phases: q.scope.phases.filter((x) => x.id !== p.id) })}
                >
                  <X className="size-3.5" />
                </IconButton>
              </div>
              <TextArea
                className="mt-2 min-h-14"
                value={p.description}
                onChange={(e) =>
                  patch("scope", {
                    phases: q.scope.phases.map((x) => (x.id === p.id ? { ...x, description: e.target.value } : x)),
                  })
                }
              />
            </div>
          ))}
        </div>
        <GhostButton
          className="mt-2"
          onClick={() =>
            patch("scope", { phases: [...q.scope.phases, { id: uid("ph"), title: "", description: "" }] })
          }
        >
          <Plus className="size-3.5" /> Add phase
        </GhostButton>

        <StringList
          label="Key services covered"
          items={q.scope.keyServices}
          onChange={(keyServices) => patch("scope", { keyServices })}
          placeholder="Service name"
        />
      </SectionCard>

      <SectionCard title="System key features" description="Six cards read best on the features page.">
        <div className="flex flex-col gap-3">
          {q.features.map((f) => (
            <div key={f.id} className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <TextInput
                  value={f.title}
                  placeholder="Feature title"
                  onChange={(e) => setList("features", q.features.map((x) => (x.id === f.id ? { ...x, title: e.target.value } : x)))}
                />
                <IconButton
                  aria-label="Remove feature"
                  onClick={() => setList("features", q.features.filter((x) => x.id !== f.id))}
                >
                  <X className="size-3.5" />
                </IconButton>
              </div>
              <TextArea
                className="mt-2 min-h-14"
                value={f.description}
                onChange={(e) =>
                  setList("features", q.features.map((x) => (x.id === f.id ? { ...x, description: e.target.value } : x)))
                }
              />
            </div>
          ))}
        </div>
        <GhostButton
          className="mt-2"
          onClick={() => setList("features", [...q.features, { id: uid("f"), title: "", description: "" }])}
        >
          <Plus className="size-3.5" /> Add feature
        </GhostButton>
      </SectionCard>

      {/* -------------------------- warranty & benefits -------------------------- */}
      <SectionCard title="Warranty & benefits" description="Warranty table rows and headline metric tiles.">
        <div className="flex flex-col gap-2">
          {q.warranty.map((w) => (
            <div key={w.id} className="flex items-start gap-2">
              <TextInput
                className="flex-1"
                value={w.item}
                placeholder="Subsystem"
                onChange={(e) => setList("warranty", q.warranty.map((x) => (x.id === w.id ? { ...x, item: e.target.value } : x)))}
              />
              <TextInput
                className="max-w-40"
                value={w.duration}
                placeholder="Duration"
                onChange={(e) =>
                  setList("warranty", q.warranty.map((x) => (x.id === w.id ? { ...x, duration: e.target.value } : x)))
                }
              />
              <TextArea
                className="min-h-10 flex-[1.6]"
                value={w.coverage}
                placeholder="Coverage"
                onChange={(e) =>
                  setList("warranty", q.warranty.map((x) => (x.id === w.id ? { ...x, coverage: e.target.value } : x)))
                }
              />
              <IconButton
                className="mt-1"
                aria-label="Remove warranty row"
                onClick={() => setList("warranty", q.warranty.filter((x) => x.id !== w.id))}
              >
                <X className="size-3.5" />
              </IconButton>
            </div>
          ))}
        </div>
        <GhostButton
          className="mt-2"
          onClick={() =>
            setList("warranty", [...q.warranty, { id: uid("w"), item: "", duration: "", coverage: "" }])
          }
        >
          <Plus className="size-3.5" /> Add warranty row
        </GhostButton>

        <p className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Benefit metrics
        </p>
        <div className="flex flex-col gap-2">
          {q.benefits.metrics.map((m) => (
            <div key={m.id} className="flex items-center gap-2">
              <TextInput
                className="max-w-32"
                value={m.value}
                placeholder="Value"
                onChange={(e) =>
                  patch("benefits", {
                    metrics: q.benefits.metrics.map((x) => (x.id === m.id ? { ...x, value: e.target.value } : x)),
                  })
                }
              />
              <TextInput
                className="max-w-44"
                value={m.label}
                placeholder="Label"
                onChange={(e) =>
                  patch("benefits", {
                    metrics: q.benefits.metrics.map((x) => (x.id === m.id ? { ...x, label: e.target.value } : x)),
                  })
                }
              />
              <TextInput
                value={m.note}
                placeholder="Note"
                onChange={(e) =>
                  patch("benefits", {
                    metrics: q.benefits.metrics.map((x) => (x.id === m.id ? { ...x, note: e.target.value } : x)),
                  })
                }
              />
              <IconButton
                aria-label="Remove metric"
                onClick={() => patch("benefits", { metrics: q.benefits.metrics.filter((x) => x.id !== m.id) })}
              >
                <X className="size-3.5" />
              </IconButton>
            </div>
          ))}
        </div>
        <GhostButton
          className="mt-2"
          onClick={() =>
            patch("benefits", {
              metrics: [...q.benefits.metrics, { id: uid("mt"), value: "", label: "", note: "" }],
            })
          }
        >
          <Plus className="size-3.5" /> Add metric
        </GhostButton>
        <Field label="Disclaimer" className="mt-4">
          <TextArea value={q.benefits.disclaimer} onChange={(e) => patch("benefits", { disclaimer: e.target.value })} />
        </Field>
      </SectionCard>

      {/* ------------------------------ narrative ------------------------------ */}
      <SectionCard title="Covering letter" description="Shown on the executive address page.">
        <Field label="Salutation">
          <TextInput value={q.letter.salutation} onChange={(e) => patch("letter", { salutation: e.target.value })} />
        </Field>
        <StringList
          label="Paragraphs"
          items={q.letter.paragraphs}
          onChange={(paragraphs) => patch("letter", { paragraphs })}
          multiline
          placeholder="Paragraph text"
        />
        <Field label="Pull quote" className="mt-4">
          <TextArea value={q.letter.quote} onChange={(e) => patch("letter", { quote: e.target.value })} />
        </Field>
      </SectionCard>

      <SectionCard title="Company profile & terms" description="Company name and identity are fixed and not editable.">
        <Field label="Profile intro">
          <TextArea value={q.profile.intro} onChange={(e) => patch("profile", { intro: e.target.value })} />
        </Field>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Mission">
            <TextArea value={q.profile.mission} onChange={(e) => patch("profile", { mission: e.target.value })} />
          </Field>
          <Field label="Core values">
            <TextArea value={q.profile.values} onChange={(e) => patch("profile", { values: e.target.value })} />
          </Field>
        </div>
        <StringList
          label="Services offered"
          items={q.profile.services}
          onChange={(services) => patch("profile", { services })}
          placeholder="Service"
        />
        <StringList
          label="Terms & conditions"
          items={q.terms}
          onChange={(terms) => setList("terms", terms)}
          multiline
          placeholder="Term"
        />
        <Field label="Acceptance intro" className="mt-4">
          <TextArea value={q.acceptance.intro} onChange={(e) => patch("acceptance", { intro: e.target.value })} />
        </Field>
      </SectionCard>

      {/* -------------------------------- tiers -------------------------------- */}
      <SectionCard
        title="Package tiers"
        description="Optional comparison page — enable it under “Pages included”."
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {q.tiers.map((t) => (
            <div key={t.id} className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <TextInput
                  value={t.name}
                  onChange={(e) => setList("tiers", q.tiers.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)))}
                />
                <IconButton
                  aria-label="Remove tier"
                  onClick={() => setList("tiers", q.tiers.filter((x) => x.id !== t.id))}
                >
                  <X className="size-3.5" />
                </IconButton>
              </div>
              <Field label="Price" className="mt-2">
                <TextInput
                  value={t.price}
                  onChange={(e) => setList("tiers", q.tiers.map((x) => (x.id === t.id ? { ...x, price: e.target.value } : x)))}
                />
              </Field>
              <Field label="Note" className="mt-2">
                <TextInput
                  value={t.note}
                  onChange={(e) => setList("tiers", q.tiers.map((x) => (x.id === t.id ? { ...x, note: e.target.value } : x)))}
                />
              </Field>
              <div className="mt-3 flex flex-col gap-2">
                {t.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-2">
                    <TextInput
                      className="text-xs"
                      value={it.item}
                      onChange={(e) =>
                        setList(
                          "tiers",
                          q.tiers.map((x) =>
                            x.id === t.id
                              ? {
                                  ...x,
                                  items: x.items.map((y) => (y.id === it.id ? { ...y, item: e.target.value } : y)),
                                }
                              : x,
                          ),
                        )
                      }
                    />
                    <TextInput
                      className="text-xs"
                      value={it.brand}
                      onChange={(e) =>
                        setList(
                          "tiers",
                          q.tiers.map((x) =>
                            x.id === t.id
                              ? {
                                  ...x,
                                  items: x.items.map((y) => (y.id === it.id ? { ...y, brand: e.target.value } : y)),
                                }
                              : x,
                          ),
                        )
                      }
                    />
                    <IconButton
                      aria-label="Remove tier item"
                      onClick={() =>
                        setList(
                          "tiers",
                          q.tiers.map((x) =>
                            x.id === t.id ? { ...x, items: x.items.filter((y) => y.id !== it.id) } : x,
                          ),
                        )
                      }
                    >
                      <X className="size-3.5" />
                    </IconButton>
                  </div>
                ))}
              </div>
              <GhostButton
                className="mt-2"
                onClick={() =>
                  setList(
                    "tiers",
                    q.tiers.map((x) =>
                      x.id === t.id ? { ...x, items: [...x.items, { id: uid("ti"), item: "", brand: "" }] } : x,
                    ),
                  )
                }
              >
                <Plus className="size-3.5" /> Add item
              </GhostButton>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ------------------------------- sections ------------------------------- */}
      <SectionCard title="Pages included" description="Untick any page to leave it out of the generated PDF.">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SECTION_KEYS.map((key) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm has-checked:border-primary/40 has-checked:bg-secondary"
            >
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={q.sections[key]}
                onChange={(e) =>
                  setQ((p) => ({ ...p, sections: { ...p.sections, [key]: e.target.checked } }))
                }
              />
              <span className="text-foreground">{SECTION_LABELS[key]}</span>
            </label>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function StringList({
  label,
  items,
  onChange,
  multiline,
  placeholder,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  multiline?: boolean
  placeholder?: string
}) {
  const Comp = multiline ? TextArea : TextInput
  return (
    <div className="mt-5">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-2">
        {items.map((value, i) => (
          <div key={i} className="flex items-start gap-2">
            <Comp
              value={value}
              placeholder={placeholder}
              className={multiline ? "min-h-16" : undefined}
              onChange={(e: ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
                onChange(items.map((x, xi) => (xi === i ? e.target.value : x)))
              }
            />
            <IconButton
              className="mt-1"
              aria-label={`Remove ${label} item`}
              onClick={() => onChange(items.filter((_, xi) => xi !== i))}
            >
              <X className="size-3.5" />
            </IconButton>
          </div>
        ))}
      </div>
      <GhostButton className="mt-2" onClick={() => onChange([...items, ""])}>
        <Plus className="size-3.5" /> Add
      </GhostButton>
    </div>
  )
}
