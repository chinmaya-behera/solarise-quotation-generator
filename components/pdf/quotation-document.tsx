"use client"

import { Document, Font, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer"
import {
  COMPANY,
  type Quotation,
  amountInWords,
  formatDate,
  formatINR,
  milestoneAmount,
  toNumber,
  totalWatts,
} from "@/lib/quotation"

/* ------------------------------- typography ------------------------------- */

Font.register({
  family: "Inter",
  fonts: [
    { src: "/fonts/Inter_400Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Inter_500Medium.ttf", fontWeight: 500 },
    { src: "/fonts/Inter_600SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/Inter_700Bold.ttf", fontWeight: 700 },
  ],
})
// Disable hyphenation so body copy never breaks mid-word.
Font.registerHyphenationCallback((word) => [word])

const C = {
  ink: "#101A14",
  body: "#2B372F",
  muted: "#5F6F65",
  green: "#14663A",
  greenDeep: "#0B3B22",
  greenSoft: "#EDF3EE",
  amber: "#B77A0B",
  line: "#D6DED8",
  hair: "#E7EDE8",
  soft: "#F5F8F5",
  white: "#FFFFFF",
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 9,
    color: C.body,
    lineHeight: 1.5,
    paddingTop: 74,
    paddingBottom: 54,
    paddingHorizontal: 44,
    backgroundColor: C.white,
  },
  coverPage: {
    fontFamily: "Inter",
    fontSize: 9,
    color: C.body,
    lineHeight: 1.5,
    backgroundColor: C.white,
  },
  runHeader: {
    position: "absolute",
    top: 30,
    left: 44,
    right: 44,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 0.75,
    borderBottomColor: C.line,
  },
  runHeaderLeft: { fontSize: 8, fontWeight: 700, color: C.ink, letterSpacing: 1.1 },
  runHeaderRight: { fontSize: 7.5, color: C.muted, letterSpacing: 0.6 },
  runFooter: {
    position: "absolute",
    bottom: 26,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 7,
    borderTopWidth: 0.75,
    borderTopColor: C.line,
    fontSize: 7,
    color: C.muted,
  },
  eyebrow: { fontSize: 7.5, fontWeight: 600, letterSpacing: 1.6, color: C.green },
  h1: { fontSize: 17, fontWeight: 700, color: C.ink, letterSpacing: -0.3 },
  h2: { fontSize: 10.5, fontWeight: 700, color: C.ink, letterSpacing: 0.2 },
  h3: { fontSize: 9, fontWeight: 600, color: C.ink },
  lead: { fontSize: 9, color: C.muted, marginTop: 8, maxWidth: 430 },
  rule: { height: 2.4, width: 44, backgroundColor: C.green, marginTop: 10, marginBottom: 16 },
  note: { fontSize: 7.5, color: C.muted, marginTop: 10, lineHeight: 1.45 },

  card: { borderWidth: 0.75, borderColor: C.line, borderRadius: 3, padding: 12 },
  cardSoft: { backgroundColor: C.soft, borderWidth: 0.75, borderColor: C.hair, borderRadius: 3, padding: 12 },

  tHead: { flexDirection: "row", backgroundColor: C.greenDeep, paddingVertical: 6, paddingHorizontal: 8 },
  tHeadCell: { fontSize: 7.5, fontWeight: 700, color: C.white, letterSpacing: 0.7 },
  tRow: { flexDirection: "row", paddingVertical: 5.5, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: C.hair },
  tCell: { fontSize: 8.5, color: C.body },
})

/* -------------------------------- primitives ------------------------------- */

function Header({ q }: { q: Quotation }) {
  return (
    <View style={s.runHeader} fixed>
      <Text style={s.runHeaderLeft}>{COMPANY.brand.toUpperCase()}</Text>
      <Text style={s.runHeaderRight}>
        {COMPANY.legalName} · {COMPANY.tagline}
      </Text>
    </View>
  )
}

function Footer({ q }: { q: Quotation }) {
  return (
    <View style={s.runFooter} fixed>
      <Text>
        {q.client.shortName || q.client.name} · {q.meta.documentTitle}
      </Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  )
}

function Sheet({
  q,
  eyebrow,
  title,
  lead,
  children,
}: {
  q: Quotation
  eyebrow: string
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <Page size="A4" style={s.page}>
      <Header q={q} />
      <View>
        <Text style={s.eyebrow}>{eyebrow.toUpperCase()}</Text>
        <Text style={[s.h1, { marginTop: 5 }]}>{title}</Text>
        {lead ? <Text style={s.lead}>{lead}</Text> : null}
        <View style={s.rule} />
      </View>
      {children}
      <Footer q={q} />
    </Page>
  )
}

function Table({
  head,
  widths,
  rows,
  align,
}: {
  head: string[]
  widths: number[]
  rows: string[][]
  align?: ("left" | "right" | "center")[]
}) {
  return (
    <View style={{ borderWidth: 0.75, borderColor: C.line, borderRadius: 3, overflow: "hidden" }}>
      <View style={s.tHead} fixed>
        {head.map((h, i) => (
          <Text
            key={i}
            style={[s.tHeadCell, { width: `${widths[i]}%`, textAlign: align?.[i] ?? "left" }]}
          >
            {h.toUpperCase()}
          </Text>
        ))}
      </View>
      {rows.map((r, ri) => (
        <View
          key={ri}
          style={[s.tRow, ri % 2 === 1 ? { backgroundColor: C.soft } : {}]}
          wrap={false}
        >
          {r.map((cell, ci) => (
            <Text
              key={ci}
              style={[
                s.tCell,
                {
                  width: `${widths[ci]}%`,
                  textAlign: align?.[ci] ?? "left",
                  fontWeight: ci === 0 ? 500 : 400,
                  color: ci === 0 ? C.ink : C.body,
                  paddingRight: 6,
                },
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: C.hair }}>
      <Text style={{ width: "38%", fontSize: 8.5, color: C.muted }}>{label}</Text>
      <Text style={{ width: "62%", fontSize: 8.5, fontWeight: 500, color: C.ink }}>{value}</Text>
    </View>
  )
}

function Bullet({ children }: { children: string }) {
  return (
    <View style={{ flexDirection: "row", marginBottom: 5, paddingRight: 6 }}>
      <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: C.green, marginTop: 5, marginRight: 6 }} />
      <Text style={{ fontSize: 8.5, flex: 1, lineHeight: 1.45 }}>{children}</Text>
    </View>
  )
}

/* ---------------------------------- pages ---------------------------------- */

function CoverPage({ q }: { q: Quotation }) {
  const validity = q.meta.validityDays ? `${q.meta.validityDays} Days` : "—"
  return (
    <Page size="A4" style={s.coverPage}>
      <View style={{ backgroundColor: C.greenDeep, paddingHorizontal: 44, paddingTop: 40, paddingBottom: 34 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: 700, color: C.white, letterSpacing: 2 }}>
              {COMPANY.brand.toUpperCase()}
            </Text>
            <Text style={{ fontSize: 7.5, color: "#A8C7B4", letterSpacing: 1.2, marginTop: 4 }}>
              {COMPANY.legalName.toUpperCase()}
            </Text>
          </View>
          <View style={{ borderWidth: 0.75, borderColor: "#3D6B51", paddingVertical: 4, paddingHorizontal: 8 }}>
            <Text style={{ fontSize: 6.5, color: C.white, letterSpacing: 1 }}>{COMPANY.tagline.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 44, paddingTop: 46, flexGrow: 1 }}>
        <Text style={{ fontSize: 8, fontWeight: 600, letterSpacing: 2.2, color: C.amber }}>
          COMMERCIAL PROPOSAL & QUOTATION
        </Text>
        <Text style={{ fontSize: 26, fontWeight: 700, color: C.ink, marginTop: 14, lineHeight: 1.22, letterSpacing: -0.6 }}>
          {q.meta.documentTitle}
        </Text>
        {q.meta.documentSubtitle ? (
          <Text style={{ fontSize: 10, color: C.muted, marginTop: 10, maxWidth: 400 }}>{q.meta.documentSubtitle}</Text>
        ) : null}
        <View style={{ height: 3, width: 62, backgroundColor: C.green, marginTop: 22 }} />

        <View style={{ flexDirection: "row", marginTop: 34, gap: 14 }}>
          <View style={[s.cardSoft, { flex: 1 }]}>
            <Text style={{ fontSize: 7, fontWeight: 600, letterSpacing: 1.4, color: C.green }}>PREPARED FOR</Text>
            <Text style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginTop: 7 }}>{q.client.name}</Text>
            {q.client.type ? <Text style={{ fontSize: 8, color: C.muted, marginTop: 3 }}>{q.client.type}</Text> : null}
            {q.client.address ? <Text style={{ fontSize: 8, color: C.body, marginTop: 6 }}>{q.client.address}</Text> : null}
            {q.client.contactPerson ? (
              <Text style={{ fontSize: 8, color: C.muted, marginTop: 6 }}>Attn: {q.client.contactPerson}</Text>
            ) : null}
          </View>
          <View style={[s.cardSoft, { flex: 1 }]}>
            <Text style={{ fontSize: 7, fontWeight: 600, letterSpacing: 1.4, color: C.green }}>PREPARED BY</Text>
            <Text style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginTop: 7 }}>{q.meta.preparedByName}</Text>
            <Text style={{ fontSize: 8, color: C.muted, marginTop: 3 }}>
              {q.meta.preparedByDesignation}, {COMPANY.shortName}
            </Text>
            <Text style={{ fontSize: 8, color: C.body, marginTop: 6 }}>{COMPANY.phone}</Text>
            <Text style={{ fontSize: 8, color: C.body }}>{COMPANY.email}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", marginTop: 14, borderWidth: 0.75, borderColor: C.line, borderRadius: 3 }}>
          {[
            { l: "QUOTATION NO.", v: q.meta.quotationNo || "—" },
            { l: "DATE", v: formatDate(q.meta.date) || "—" },
            { l: "VALIDITY", v: validity },
            { l: "PLANT CAPACITY", v: `${q.system.acCapacity} kW` },
          ].map((x, i) => (
            <View
              key={x.l}
              style={{
                flex: 1,
                paddingVertical: 11,
                paddingHorizontal: 11,
                borderLeftWidth: i === 0 ? 0 : 0.75,
                borderLeftColor: C.hair,
              }}
            >
              <Text style={{ fontSize: 6.5, letterSpacing: 1, color: C.muted }}>{x.l}</Text>
              <Text style={{ fontSize: 9.5, fontWeight: 600, color: C.ink, marginTop: 4 }}>{x.v}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 40, borderLeftWidth: 2.5, borderLeftColor: C.amber, paddingLeft: 12 }}>
          <Text style={{ fontSize: 10, color: C.ink, fontWeight: 500, maxWidth: 400, lineHeight: 1.5 }}>
            “{COMPANY.motto}”
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 44,
          paddingVertical: 16,
          borderTopWidth: 0.75,
          borderTopColor: C.line,
        }}
      >
        <Text style={{ fontSize: 7.5, color: C.muted }}>{COMPANY.address}</Text>
        <Text style={{ fontSize: 7.5, color: C.muted }}>
          {COMPANY.website} · GSTIN {COMPANY.gstin}
        </Text>
      </View>
    </Page>
  )
}

function LetterPage({ q }: { q: Quotation }) {
  return (
    <Sheet q={q} eyebrow="Covering letter" title="Executive Address">
      <Text style={{ fontSize: 8.5, color: C.muted }}>To,</Text>
      <Text style={{ fontSize: 9.5, fontWeight: 600, color: C.ink, marginTop: 3 }}>
        {q.client.contactPerson || "The Management"}
      </Text>
      <Text style={{ fontSize: 8.5, color: C.body }}>
        {q.client.name}
        {q.client.address ? `, ${q.client.address}` : ""}
      </Text>

      <Text style={{ fontSize: 9, fontWeight: 500, color: C.ink, marginTop: 18 }}>{q.letter.salutation}</Text>

      {q.letter.paragraphs.filter(Boolean).map((p, i) => (
        <Text key={i} style={{ fontSize: 9, marginTop: 10, lineHeight: 1.6, textAlign: "justify" }}>
          {p}
        </Text>
      ))}

      {q.letter.quote ? (
        <View style={{ marginTop: 20, backgroundColor: C.greenSoft, padding: 14, borderRadius: 3 }}>
          <Text style={{ fontSize: 9.5, color: C.greenDeep, fontWeight: 500, lineHeight: 1.55 }}>
            “{q.letter.quote}”
          </Text>
        </View>
      ) : null}

      <View style={{ marginTop: 34 }}>
        <Text style={{ fontSize: 8.5, color: C.muted }}>Warm regards,</Text>
        <Text style={{ fontSize: 10.5, fontWeight: 700, color: C.ink, marginTop: 18 }}>{q.meta.preparedByName}</Text>
        <Text style={{ fontSize: 8.5, color: C.muted }}>
          {q.meta.preparedByDesignation} · {COMPANY.legalName}
        </Text>
      </View>
    </Sheet>
  )
}

function ProfilePage({ q }: { q: Quotation }) {
  return (
    <Sheet q={q} eyebrow="Company profile" title={COMPANY.legalName} lead={q.profile.intro}>
      <View style={{ flexDirection: "row", gap: 14 }}>
        <View style={[s.card, { flex: 1 }]}>
          <Text style={s.h3}>Our Mission</Text>
          <Text style={{ fontSize: 8.5, marginTop: 6, color: C.body }}>{q.profile.mission}</Text>
        </View>
        <View style={[s.card, { flex: 1 }]}>
          <Text style={s.h3}>Core Values</Text>
          <Text style={{ fontSize: 8.5, marginTop: 6, color: C.body }}>{q.profile.values}</Text>
        </View>
      </View>

      <Text style={[s.h2, { marginTop: 22, marginBottom: 10 }]}>Services Offered</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {q.profile.services.filter(Boolean).map((svc, i) => (
          <View key={i} style={{ width: "50%", paddingRight: 10 }}>
            <Bullet>{svc}</Bullet>
          </View>
        ))}
      </View>

      <View style={[s.cardSoft, { marginTop: 20, flexDirection: "row", justifyContent: "space-between" }]}>
        {[
          { l: "Brand", v: COMPANY.brand },
          { l: "Certification", v: "ISO 9001:2015" },
          { l: "GSTIN", v: COMPANY.gstin },
          { l: "Asset Design Life", v: q.system.designLife },
        ].map((x) => (
          <View key={x.l} style={{ paddingRight: 8 }}>
            <Text style={{ fontSize: 6.5, letterSpacing: 1, color: C.muted }}>{x.l.toUpperCase()}</Text>
            <Text style={{ fontSize: 9, fontWeight: 600, color: C.ink, marginTop: 3 }}>{x.v}</Text>
          </View>
        ))}
      </View>
    </Sheet>
  )
}

function TechnicalPage({ q }: { q: Quotation }) {
  const rows: [string, string][] = [
    ["Plant Capacity", `${q.system.acCapacity} kW AC`],
    ["Installed DC Capacity", q.system.dcCapacity],
    ["System Type", q.system.systemType],
    ["Grid Supply", q.system.gridSupply],
    ["Solar Modules", `${q.system.moduleSpec} · ${q.system.moduleWattage} Wp`],
    ["Total Solar Modules", `${q.system.moduleQty} Nos`],
    ["Solar Inverter", q.system.inverter],
    ["Mounting Structure", q.system.mounting],
    ["Monitoring", q.system.monitoring],
    ["Design Life", q.system.designLife],
    ["Expected Annual Generation", q.system.annualGeneration],
  ]
  return (
    <Sheet
      q={q}
      eyebrow="Technical configuration"
      title="System Design & Specifications"
      lead="Engineered for maximum energy yield, long-term reliability and full compliance with utility grid-connection standards."
    >
      <Table
        head={["Parameter", "Specification"]}
        widths={[36, 64]}
        rows={rows.map(([a, b]) => [a, b])}
      />
      <Text style={s.note}>{q.system.standardsNote}</Text>
    </Sheet>
  )
}

function ScopePage({ q }: { q: Quotation }) {
  return (
    <Sheet q={q} eyebrow="Scope of work" title="Turnkey EPC Responsibilities" lead={q.scope.intro}>
      {q.scope.phases.map((p, i) => (
        <View
          key={p.id}
          style={{ flexDirection: "row", marginBottom: 12, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: C.hair }}
          wrap={false}
        >
          <Text style={{ width: 26, fontSize: 13, fontWeight: 700, color: C.green }}>
            {String(i + 1).padStart(2, "0")}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={s.h3}>{p.title}</Text>
            <Text style={{ fontSize: 8.5, color: C.body, marginTop: 3 }}>{p.description}</Text>
          </View>
        </View>
      ))}

      <Text style={[s.h2, { marginTop: 10, marginBottom: 10 }]}>Key Services Covered</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {q.scope.keyServices.filter(Boolean).map((k, i) => (
          <View key={i} style={{ width: "33.33%", paddingRight: 8 }}>
            <Bullet>{k}</Bullet>
          </View>
        ))}
      </View>
    </Sheet>
  )
}

function BoqPage({ q }: { q: Quotation }) {
  return (
    <Sheet
      q={q}
      eyebrow="Bill of quantities"
      title="Itemised Material Breakdown"
      lead={`Complete bill of quantities for the ${q.system.acCapacity} kW grid-connected rooftop solar power plant.`}
    >
      <Table
        head={["Sl.", "Component", "Specification", "Qty"]}
        widths={[6, 30, 46, 18]}
        align={["left", "left", "left", "right"]}
        rows={q.boq.rows.map((r, i) => [String(i + 1).padStart(2, "0"), r.component, r.specification, r.qty])}
      />
      <Text style={s.note}>{q.boq.note}</Text>
    </Sheet>
  )
}

function FeaturesPage({ q }: { q: Quotation }) {
  return (
    <Sheet
      q={q}
      eyebrow="System key features"
      title="Performance & Advantages"
      lead="Every component is selected to maximise generation, minimise maintenance and ensure safe, reliable operation."
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {q.features.map((f, i) => (
          <View key={f.id} style={{ width: "50%", paddingRight: i % 2 === 0 ? 12 : 0, marginBottom: 12 }}>
            <View style={[s.card, { height: 88 }]} wrap={false}>
              <View style={{ height: 2, width: 20, backgroundColor: C.amber, marginBottom: 8 }} />
              <Text style={s.h3}>{f.title}</Text>
              <Text style={{ fontSize: 8, color: C.body, marginTop: 5, lineHeight: 1.45 }}>{f.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </Sheet>
  )
}

function CommercialPage({ q }: { q: Quotation }) {
  const watts = totalWatts(q)
  const rate = toNumber(q.commercial.ratePerWatt)
  return (
    <Sheet q={q} eyebrow="Commercial quotation" title="Financial Investment Breakdown">
      <View style={{ flexDirection: "row", gap: 14 }}>
        <View style={{ flex: 1.15 }}>
          <KeyValue label="Plant Capacity" value={`${q.system.acCapacity} kW ${q.system.systemType}`} />
          <KeyValue label="Installed DC Capacity" value={q.system.dcCapacity} />
          <KeyValue label="Total Installed Watts" value={`${watts.toLocaleString("en-IN")} Wp`} />
          <KeyValue label="Rate" value={rate ? `₹${rate.toFixed(2)} per Watt` : "—"} />
          {q.commercial.inclusions.map((inc) => (
            <KeyValue key={inc.id} label={inc.a} value={inc.b} />
          ))}
          <KeyValue label="Delivery Period" value={q.commercial.deliveryPeriod} />
          <KeyValue label="Quotation Validity" value={`${q.meta.validityDays} days from date of issue`} />
        </View>

        <View
          style={{
            flex: 0.85,
            backgroundColor: C.greenDeep,
            borderRadius: 3,
            padding: 16,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 7, letterSpacing: 1.4, color: "#A8C7B4" }}>TOTAL TURNKEY PROJECT VALUE</Text>
          <Text style={{ fontSize: 22, fontWeight: 700, color: C.white, marginTop: 10, letterSpacing: -0.5 }}>
            {formatINR(q.commercial.totalCost)}
          </Text>
          <Text style={{ fontSize: 8, color: "#C6DCCE", marginTop: 6, lineHeight: 1.45 }}>
            {amountInWords(q.commercial.totalCost)}
          </Text>
          <View style={{ height: 0.75, backgroundColor: "#3D6B51", marginVertical: 12 }} />
          <Text style={{ fontSize: 8, color: C.white, fontWeight: 500 }}>{q.commercial.gstNote}</Text>
        </View>
      </View>

      <Text style={[s.h2, { marginTop: 22, marginBottom: 10 }]}>Commercial Milestone Payments</Text>
      <Table
        head={["Milestone", "Share", "Amount", "Trigger condition"]}
        widths={[18, 10, 18, 54]}
        align={["left", "right", "right", "left"]}
        rows={q.commercial.milestones.map((m, i) => [
          `${String(i + 1).padStart(2, "0")} · ${m.label}`,
          `${m.percent}%`,
          formatINR(milestoneAmount(q, m)),
          m.condition,
        ])}
      />
      <Text style={s.note}>{q.commercial.footnote}</Text>
    </Sheet>
  )
}

function WarrantyPage({ q }: { q: Quotation }) {
  return (
    <Sheet
      q={q}
      eyebrow="Warranty framework"
      title="Long-Term Asset Protection"
      lead="Components are backed by comprehensive performance and workmanship warranties from Tier-1 manufacturers."
    >
      <Table
        head={["Subsystem asset", "Duration", "Coverage & service terms"]}
        widths={[24, 20, 56]}
        rows={q.warranty.map((w) => [w.item, w.duration, w.coverage])}
      />
    </Sheet>
  )
}

function BenefitsPage({ q }: { q: Quotation }) {
  return (
    <Sheet
      q={q}
      eyebrow="Benefits & returns"
      title="Savings, Yield & Environmental Impact"
      lead="Indicative performance and financial outcomes for the proposed plant configuration."
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {q.benefits.metrics.map((m, i) => (
          <View key={m.id} style={{ width: "33.33%", paddingRight: (i + 1) % 3 === 0 ? 0 : 12, marginBottom: 12 }}>
            <View style={[s.cardSoft, { height: 76 }]} wrap={false}>
              <Text style={{ fontSize: 16, fontWeight: 700, color: C.greenDeep, letterSpacing: -0.4 }}>{m.value}</Text>
              <Text style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: 0.8, color: C.ink, marginTop: 5 }}>
                {m.label.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 7.5, color: C.muted, marginTop: 3 }}>{m.note}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={s.note}>{q.benefits.disclaimer}</Text>
    </Sheet>
  )
}

function TiersPage({ q }: { q: Quotation }) {
  return (
    <Sheet
      q={q}
      eyebrow="Package options"
      title="Standard Package Tiers"
      lead="Alternative component packages available on request. Final pricing depends on capacity, site conditions and structure requirements."
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        {q.tiers.map((t, ti) => (
          <View
            key={t.id}
            style={{
              flex: 1,
              borderWidth: 0.75,
              borderColor: ti === 0 ? C.green : C.line,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <View style={{ backgroundColor: ti === 0 ? C.greenDeep : C.soft, padding: 10 }}>
              <Text style={{ fontSize: 7, letterSpacing: 1.2, color: ti === 0 ? "#A8C7B4" : C.muted }}>
                {t.name.toUpperCase()} TIER
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: ti === 0 ? C.white : C.ink, marginTop: 5 }}>
                ₹{t.price}
              </Text>
              <Text style={{ fontSize: 7, color: ti === 0 ? "#C6DCCE" : C.muted, marginTop: 3 }}>{t.note}</Text>
            </View>
            <View style={{ padding: 8 }}>
              {t.items.map((it) => (
                <View key={it.id} style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 7, color: C.muted, letterSpacing: 0.5 }}>{it.item.toUpperCase()}</Text>
                  <Text style={{ fontSize: 8, color: C.ink, fontWeight: 500 }}>{it.brand}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
      <Text style={s.note}>
        Terms & conditions apply. Prices are inclusive of the components listed above. Installation timelines are subject
        to site verification.
      </Text>
    </Sheet>
  )
}

function TermsPage({ q }: { q: Quotation }) {
  return (
    <Sheet q={q} eyebrow="Terms & conditions" title="Legal and Regulatory Framework">
      {q.terms.filter(Boolean).map((t, i) => (
        <View key={i} style={{ flexDirection: "row", marginBottom: 10 }} wrap={false}>
          <Text style={{ width: 22, fontSize: 8, fontWeight: 700, color: C.green }}>{String(i + 1).padStart(2, "0")}</Text>
          <Text style={{ flex: 1, fontSize: 8.5, lineHeight: 1.5 }}>{t}</Text>
        </View>
      ))}
    </Sheet>
  )
}

function SignatureBlock({ heading, name, sub }: { heading: string; name: string; sub: string }) {
  return (
    <View style={[s.card, { flex: 1, minHeight: 168 }]}>
      <Text style={{ fontSize: 7, letterSpacing: 1.2, color: C.green }}>{heading.toUpperCase()}</Text>
      <Text style={{ fontSize: 10.5, fontWeight: 700, color: C.ink, marginTop: 8 }}>{name}</Text>
      <Text style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{sub}</Text>
      <View style={{ marginTop: 26 }}>
        {["Signature", "Name", "Designation", "Date", "Company Seal"].map((f) => (
          <View key={f} style={{ marginBottom: 13 }}>
            <View style={{ height: 0.75, backgroundColor: C.line }} />
            <Text style={{ fontSize: 6.5, color: C.muted, marginTop: 3, letterSpacing: 0.6 }}>{f.toUpperCase()}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function AcceptancePage({ q }: { q: Quotation }) {
  return (
    <Sheet q={q} eyebrow="Project acceptance" title="Contractual Authorisation" lead={q.acceptance.intro}>
      <View style={{ flexDirection: "row", gap: 14 }}>
        <SignatureBlock
          heading="For the client"
          name={q.acceptance.clientSignatoryLabel}
          sub={`For ${q.client.name} Management`}
        />
        <SignatureBlock
          heading="For the contractor"
          name={q.meta.preparedByName}
          sub={`${q.meta.preparedByDesignation} · ${COMPANY.legalName}`}
        />
      </View>
      <View style={[s.cardSoft, { marginTop: 16 }]}>
        <Text style={{ fontSize: 8, color: C.body }}>
          Reference: Quotation {q.meta.quotationNo || "—"} dated {formatDate(q.meta.date) || "—"} · Total project value{" "}
          {formatINR(q.commercial.totalCost)} ({q.commercial.gstNote}).
        </Text>
      </View>
    </Sheet>
  )
}

function ThanksPage({ q }: { q: Quotation }) {
  const rows: [string, string][] = [
    ["Brand Desk", COMPANY.brand],
    ["Office Address", COMPANY.address],
    ["Hotline", COMPANY.phone],
    ["Email", COMPANY.email],
    ["Website", COMPANY.website],
    ["GSTIN", COMPANY.gstin],
  ]
  return (
    <Sheet q={q} eyebrow="Thank you" title="Your Partner in Clean Energy">
      <Text style={{ fontSize: 9, lineHeight: 1.6, maxWidth: 440 }}>
        We thank the management of {q.client.name} for considering {COMPANY.shortName} as your clean-energy
        infrastructure partner. We are committed to delivering a reliable, high-performing and professionally engineered
        solar power asset.
      </Text>

      <View style={{ marginTop: 24, borderWidth: 0.75, borderColor: C.line, borderRadius: 3 }}>
        {rows.map(([a, b], i) => (
          <View
            key={a}
            style={{
              flexDirection: "row",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderTopWidth: i === 0 ? 0 : 0.5,
              borderTopColor: C.hair,
            }}
          >
            <Text style={{ width: "30%", fontSize: 7.5, letterSpacing: 0.8, color: C.muted }}>{a.toUpperCase()}</Text>
            <Text style={{ width: "70%", fontSize: 9, fontWeight: 500, color: C.ink }}>{b}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 26, borderLeftWidth: 2.5, borderLeftColor: C.amber, paddingLeft: 12 }}>
        <Text style={{ fontSize: 10.5, fontWeight: 500, color: C.ink }}>“{COMPANY.motto}”</Text>
      </View>
    </Sheet>
  )
}

/* --------------------------------- document -------------------------------- */

export function QuotationDocument({ q }: { q: Quotation }) {
  const on = q.sections
  return (
    <Document
      title={`${q.meta.documentTitle} — ${q.client.name}`}
      author={COMPANY.legalName}
      subject="Solar Power Plant Commercial Quotation"
      creator={COMPANY.brand}
      producer={COMPANY.brand}
    >
      {on.cover && <CoverPage q={q} />}
      {on.letter && <LetterPage q={q} />}
      {on.profile && <ProfilePage q={q} />}
      {on.technical && <TechnicalPage q={q} />}
      {on.scope && <ScopePage q={q} />}
      {on.boq && <BoqPage q={q} />}
      {on.features && <FeaturesPage q={q} />}
      {on.commercial && <CommercialPage q={q} />}
      {on.warranty && <WarrantyPage q={q} />}
      {on.benefits && <BenefitsPage q={q} />}
      {on.tiers && <TiersPage q={q} />}
      {on.terms && <TermsPage q={q} />}
      {on.acceptance && <AcceptancePage q={q} />}
      {on.thanks && <ThanksPage q={q} />}
    </Document>
  )
}
