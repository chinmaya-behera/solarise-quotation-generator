// Data model + defaults for the Solarise Odisha quotation generator.
// Company identity is fixed; everything else is editable in the app.

export const COMPANY = {
  legalName: "ADP Green Energies Private Limited",
  shortName: "ADP Green Energies",
  brand: "Solarise Odisha",
  tagline: "ISO 9001:2015 Certified Solar EPC",
  address: "Kumbhar Pada, Bhawanipatna, Kalahandi, Odisha - 766001",
  phone: "+91 70087 07510",
  email: "solariseodisha@gmail.com",
  website: "www.solariseodisha.com",
  gstin: "21ABDCA1909M1ZW",
  motto: "Empowering Institutions with Reliable Solar Energy.",
} as const

export type Row2 = { id: string; a: string; b: string }
export type BoqRow = { id: string; component: string; specification: string; qty: string }
export type Milestone = { id: string; label: string; percent: number; condition: string }
export type Feature = { id: string; title: string; description: string }
export type WarrantyRow = { id: string; item: string; duration: string; coverage: string }
export type Phase = { id: string; title: string; description: string }
export type TierItem = { id: string; item: string; brand: string }
export type Tier = { id: string; name: string; price: string; note: string; items: TierItem[] }
export type Metric = { id: string; value: string; label: string; note: string }

export const SECTION_KEYS = [
  "cover",
  "letter",
  "profile",
  "technical",
  "scope",
  "boq",
  "features",
  "commercial",
  "warranty",
  "benefits",
  "tiers",
  "terms",
  "acceptance",
  "thanks",
] as const

export type SectionKey = (typeof SECTION_KEYS)[number]

export const SECTION_LABELS: Record<SectionKey, string> = {
  cover: "Cover page",
  letter: "Covering letter",
  profile: "Company profile",
  technical: "Technical configuration",
  scope: "Scope of work",
  boq: "Bill of quantities",
  features: "System key features",
  commercial: "Commercial quotation",
  warranty: "Warranty coverage",
  benefits: "Benefits & savings",
  tiers: "Package tiers comparison",
  terms: "Terms & conditions",
  acceptance: "Acceptance & signatures",
  thanks: "Thank you / contact",
}

export type Quotation = {
  meta: {
    quotationNo: string
    date: string
    validityDays: string
    documentTitle: string
    documentSubtitle: string
    preparedByName: string
    preparedByDesignation: string
  }
  client: {
    name: string
    shortName: string
    type: string
    address: string
    contactPerson: string
    phone: string
    email: string
  }
  letter: {
    salutation: string
    paragraphs: string[]
    quote: string
  }
  profile: {
    intro: string
    mission: string
    values: string
    services: string[]
  }
  system: {
    acCapacity: string
    dcCapacity: string
    systemType: string
    gridSupply: string
    moduleSpec: string
    moduleWattage: string
    moduleQty: string
    inverter: string
    mounting: string
    monitoring: string
    designLife: string
    annualGeneration: string
    standardsNote: string
  }
  scope: { intro: string; phases: Phase[]; keyServices: string[] }
  boq: { note: string; rows: BoqRow[] }
  features: Feature[]
  commercial: {
    ratePerWatt: string
    totalCost: string
    gstNote: string
    inclusions: Row2[]
    deliveryPeriod: string
    milestones: Milestone[]
    footnote: string
  }
  warranty: WarrantyRow[]
  benefits: { metrics: Metric[]; disclaimer: string }
  tiers: Tier[]
  terms: string[]
  acceptance: { intro: string; clientSignatoryLabel: string }
  sections: Record<SectionKey, boolean>
}

let seq = 0
export const uid = (p = "r") => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

/* ------------------------------ formatting ------------------------------ */

export function toNumber(value: string | number): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const n = Number(String(value).replace(/[^0-9.\-]/g, ""))
  return Number.isFinite(n) ? n : 0
}

/** 500000 -> "5,00,000" (Indian digit grouping) */
export function groupIndian(value: number): string {
  const n = Math.round(Math.abs(value))
  const s = String(n)
  if (s.length <= 3) return (value < 0 ? "-" : "") + s
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",")
  return (value < 0 ? "-" : "") + rest + "," + last3
}

export function formatINR(value: string | number, withSuffix = true): string {
  const n = toNumber(value)
  return `₹${groupIndian(n)}${withSuffix ? "/-" : ""}`
}

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
]
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

function twoDigits(n: number): string {
  if (n < 20) return ONES[n]
  const t = Math.floor(n / 10)
  const o = n % 10
  return TENS[t] + (o ? ` ${ONES[o]}` : "")
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100)
  const r = n % 100
  return [h ? `${ONES[h]} Hundred` : "", r ? twoDigits(r) : ""].filter(Boolean).join(" ")
}

/** Indian words: 825000 -> "Rupees Eight Lakh Twenty Five Thousand Only" */
export function amountInWords(value: string | number): string {
  const n = Math.round(toNumber(value))
  if (n <= 0) return "Rupees Zero Only"
  const crore = Math.floor(n / 10000000)
  const lakh = Math.floor((n % 10000000) / 100000)
  const thousand = Math.floor((n % 100000) / 1000)
  const rest = n % 1000
  const parts = [
    crore ? `${threeDigits(crore)} Crore` : "",
    lakh ? `${twoDigits(lakh)} Lakh` : "",
    thousand ? `${twoDigits(thousand)} Thousand` : "",
    rest ? threeDigits(rest) : "",
  ].filter(Boolean)
  return `Rupees ${parts.join(" ")} Only`
}

export const totalWatts = (q: Quotation) => Math.round(toNumber(q.system.acCapacity) * 1000)

export function milestoneAmount(q: Quotation, m: Milestone): number {
  return Math.round((toNumber(q.commercial.totalCost) * m.percent) / 100)
}

export function suggestedModuleQty(acCapacityKw: string, wattage: string): number {
  const kw = toNumber(acCapacityKw)
  const w = toNumber(wattage)
  if (!kw || !w) return 0
  return Math.round((kw * 1.05 * 1000) / w)
}

export function suggestedDcCapacity(moduleQty: string, wattage: string): string {
  const kwp = (toNumber(moduleQty) * toNumber(wattage)) / 1000
  return kwp ? `${kwp.toFixed(3).replace(/\.?0+$/, "")} kWp` : ""
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
}

/* -------------------------------- defaults -------------------------------- */

export function defaultQuotation(): Quotation {
  return {
    meta: {
      quotationNo: `SO/QT/${new Date().getFullYear()}/001`,
      date: todayISO(),
      validityDays: "30",
      documentTitle: "20 kW Grid Connected Rooftop Solar Power Plant",
      documentSubtitle: "Turnkey Supply, Installation, Testing & Commissioning (SITC)",
      preparedByName: "Debabrata Patnaik",
      preparedByDesignation: "Director",
    },
    client: {
      name: "Prakruti College",
      shortName: "Prakruti College",
      type: "Educational Institution",
      address: "Bhawanipatna, Kalahandi, Odisha",
      contactPerson: "The Management / Principal",
      phone: "",
      email: "",
    },
    letter: {
      salutation: "Dear Sir / Madam,",
      paragraphs: [
        "We are sincerely grateful for the opportunity to submit our engineering proposal for the implementation of a grid-connected rooftop solar power plant at your premises. We commend your management's forward-thinking vision to integrate sustainable clean energy infrastructure within your esteemed organisation.",
        "Transitioning to solar power is not merely an operational cost-saving measure; it is a long-term asset investment. Underutilised rooftops are converted into multi-decade generating assets, securing predictable operational budgets and insulating you from rising grid tariffs.",
        "At ADP Green Energies we assure you of disciplined engineering execution, Tier-1 components, strict safety compliance and responsive local after-sales support throughout the 25+ year life of the plant.",
      ],
      quote:
        "An investment in solar infrastructure delivers a compounding financial yield through direct utility savings while actively contributing to a cleaner future.",
    },
    profile: {
      intro:
        "ADP Green Energies Private Limited, operating under the brand Solarise Odisha, is an ISO 9001:2015 certified Solar EPC company delivering turnkey rooftop solar solutions across Odisha — covering engineering, procurement, installation, commissioning, net-metering coordination and long-term maintenance.",
      mission:
        "Deliver high-quality, efficient and reliable solar power solutions through engineering excellence, empowering institutions and businesses with clean, sustainable energy.",
      values:
        "Quality · Safety · Innovation · Integrity · Technical Transparency · Customer Satisfaction across the full 25-year asset lifecycle.",
      services: [
        "Commercial & Institutional Solar",
        "Industrial & Residential Solar",
        "Engineering & Technical Design",
        "Procurement & Material Supply",
        "Installation & Civil Integration",
        "Testing & Grid Commissioning",
        "Net Metering Liaisoning",
        "Annual Maintenance Support",
      ],
    },
    system: {
      acCapacity: "20",
      dcCapacity: "20.445 kWp",
      systemType: "Grid Connected Rooftop Solar PV System",
      gridSupply: "415 V, 3 Phase, 50 Hz",
      moduleSpec: "WAAREE N-Type TOPCon Mono Half-Cut",
      moduleWattage: "705",
      moduleQty: "29",
      inverter: "DEYE 20 kW Three Phase On-Grid Inverter",
      mounting: "Hot Dip Galvanized Iron (HDG) / MS Structure",
      monitoring: "Wi-Fi / Mobile App Remote Monitoring",
      designLife: "25+ Years",
      annualGeneration: "28,000 – 32,000 kWh",
      standardsNote:
        "All equipment shall comply with applicable BIS, IEC, MNRE and TPWODL technical standards and grid connectivity requirements.",
    },
    scope: {
      intro:
        "ADP Green Energies manages every phase of the project — from initial site assessment through final commissioning and net-metering approval — ensuring zero gaps in accountability.",
      phases: [
        {
          id: uid("ph"),
          title: "Site Survey & Engineering Design",
          description:
            "Rooftop assessment, structural load evaluation, shadow analysis, electrical load study and custom system layout design.",
        },
        {
          id: uid("ph"),
          title: "Material Procurement & Supply",
          description:
            "Procurement of Tier-1 certified PV modules, grid-tie inverter, mounting structure, protection devices and all balance-of-system components.",
        },
        {
          id: uid("ph"),
          title: "Installation & Integration",
          description:
            "Mechanical and electrical installation including module mounting, structural anchoring, DC/AC cabling, earthing and surge protection.",
        },
        {
          id: uid("ph"),
          title: "Testing, Commissioning & Net Metering",
          description:
            "System testing, performance validation, DISCOM liaisoning for bi-directional net meter installation and operator training.",
        },
      ],
      keyServices: [
        "Site Survey & Load Analysis",
        "Structural Design",
        "Supply of Solar Equipment",
        "Mechanical Installation",
        "Electrical Wiring & Cabling",
        "Chemical Earthing Setup",
        "Lightning Protection",
        "System Testing",
        "Grid Commissioning",
        "Net Metering Filing",
        "Complete Documentation",
        "Customer Staff Training",
      ],
    },
    boq: {
      note:
        "All components comply with relevant BIS / IEC standards and DISCOM technical requirements. Quantities are finalised after detailed engineering and site layout.",
      rows: [
        { id: uid("b"), component: "Solar PV Modules", specification: "WAAREE 705 Wp Mono TOPCon", qty: "29 Nos" },
        { id: uid("b"), component: "Grid Tie Inverter", specification: "DEYE 20 kW, 3 Phase On-Grid", qty: "1 No" },
        { id: uid("b"), component: "Mounting Structure", specification: "HDG Module Mounting Structure", qty: "1 Set" },
        { id: uid("b"), component: "MC4 Connectors", specification: "Solar Grade IP68", qty: "~40 Pairs" },
        { id: uid("b"), component: "DC Distribution Box (DCDB)", specification: "With Fuse & SPD Protection", qty: "1 No" },
        { id: uid("b"), component: "AC Distribution Box (ACDB)", specification: "With MCB / MCCB & SPD Protection", qty: "1 No" },
        { id: uid("b"), component: "Net Meter", specification: "DISCOM Approved Bi-directional Meter", qty: "1 No" },
        { id: uid("b"), component: "Earthing Kit", specification: "Chemical / Copper Bonded Earthing", qty: "2 – 3 Sets" },
        { id: uid("b"), component: "Lightning Arrestor", specification: "ESE / IS Standard Type", qty: "1 No" },
        { id: uid("b"), component: "DC & AC Cables", specification: "Solar Grade UV / XLPE Armoured Cable", qty: "As Required" },
        { id: uid("b"), component: "Cable Trays / Conduits", specification: "HDG / Heavy Duty PVC", qty: "As Required" },
        { id: uid("b"), component: "Monitoring Dongle", specification: "Wi-Fi Module, Inverter Compatible", qty: "1 No" },
        { id: uid("b"), component: "Installation & Commissioning", specification: "Complete Turnkey EPC Work", qty: "1 Job" },
        { id: uid("b"), component: "Testing & Documentation", specification: "Complete Project Records", qty: "1 Job" },
      ],
    },
    features: [
      {
        id: uid("f"),
        title: "High-Efficiency TOPCon Technology",
        description:
          "N-Type TOPCon modules deliver higher conversion efficiency and superior yield during extreme summer heat.",
      },
      {
        id: uid("f"),
        title: "High Generation Output",
        description:
          "Substantially reduces monthly utility outlay by substituting high-tariff grid power with on-site solar generation.",
      },
      {
        id: uid("f"),
        title: "Smart Remote Monitoring",
        description:
          "Wi-Fi enabled real-time performance tracking through a mobile application for analytics and fast fault detection.",
      },
      {
        id: uid("f"),
        title: "Premium Protection Devices",
        description:
          "Integrated SPDs, MCBs, DCDB and ACDB enclosures ensure complete electrical isolation and surge protection.",
      },
      {
        id: uid("f"),
        title: "Weather-Resistant Structure",
        description:
          "Hot-dip galvanized mounting structure engineered for high wind loads and long-term corrosion resistance.",
      },
      {
        id: uid("f"),
        title: "25+ Years Asset Life",
        description:
          "Designed for decades of reliable operation with minimal upkeep, backed by Tier-1 manufacturer guarantees.",
      },
    ],
    commercial: {
      ratePerWatt: "41.25",
      totalCost: "825000",
      gstNote: "GST & all applicable taxes included",
      inclusions: [
        { id: uid("i"), a: "Transportation & Insurance", b: "Included" },
        { id: uid("i"), a: "Installation & Commissioning", b: "Included" },
        { id: uid("i"), a: "Net Metering Assistance", b: "Included" },
        { id: uid("i"), a: "Civil Mounting, Wiring & Testing", b: "Included" },
      ],
      deliveryPeriod: "3 – 4 weeks from advance payment and technical clearance",
      milestones: [
        {
          id: uid("m"),
          label: "Advance",
          percent: 10,
          condition: "On issuance of Purchase Order / Letter of Intent to initiate procurement.",
        },
        {
          id: uid("m"),
          label: "Against Dispatch",
          percent: 80,
          condition: "Before dispatch of project materials from factory / warehouse to site.",
        },
        {
          id: uid("m"),
          label: "Final",
          percent: 10,
          condition: "After installation, before net-metering submission to the utility.",
        },
      ],
      footnote:
        "Rate is inclusive of GST, packaging, transit insurance and turnkey execution. Net-metering approval remains subject to DISCOM regulations and timely document submission by the client.",
    },
    warranty: [
      {
        id: uid("w"),
        item: "Solar PV Modules",
        duration: "12 – 15 Years / 25 Years",
        coverage: "Product workmanship warranty with linear power output performance warranty as per manufacturer.",
      },
      {
        id: uid("w"),
        item: "Grid Tie Inverter",
        duration: "5 Years Standard",
        coverage: "Manufacturer repair or replacement warranty covering firmware and hardware faults.",
      },
      {
        id: uid("w"),
        item: "Mounting Structure",
        duration: "10 Years",
        coverage: "Structural integrity against degradation, joint cracks and localised warping.",
      },
      {
        id: uid("w"),
        item: "EPC Workmanship",
        duration: "1 Year Comprehensive",
        coverage: "Covers workmanship, wiring corrections and post-installation alignment adjustments.",
      },
    ],
    benefits: {
      metrics: [
        { id: uid("mt"), value: "~30,000", label: "Units / Year", note: "Indicative annual generation" },
        { id: uid("mt"), value: "Up to 90%", label: "Bill Reduction", note: "Subject to consumption pattern" },
        { id: uid("mt"), value: "3 – 5 Yrs", label: "Payback Period", note: "Subject to tariff and generation" },
        { id: uid("mt"), value: "~25 Tonnes", label: "CO₂ Offset / Year", note: "Indicative environmental benefit" },
        { id: uid("mt"), value: "25+ Years", label: "System Life", note: "Long-term energy security" },
        { id: uid("mt"), value: "< ₹1.80", label: "LCOE per kWh", note: "Levelised cost across 25 years" },
      ],
      disclaimer:
        "Actual generation, savings, carbon offset and payback depend on solar irradiation, electricity tariff, consumption pattern, system performance, site conditions and applicable regulations. These figures are indicative and not guaranteed.",
    },
    tiers: [
      {
        id: uid("t"),
        name: "Premium",
        price: "2,10,000",
        note: "Tier-1 modules with premium BOS",
        items: [
          { id: uid("ti"), item: "Solar PV Module", brand: "Waaree / Adani / Tata" },
          { id: uid("ti"), item: "Inverter", brand: "Waaree / Deye / Polycab" },
          { id: uid("ti"), item: "Structure (6 legged)", brand: "JSW / SAIL" },
          { id: uid("ti"), item: "ACDB / DCDB", brand: "Waaree / Havells / Schneider" },
          { id: uid("ti"), item: "Earthing", brand: "Copper" },
          { id: uid("ti"), item: "AC Wire", brand: "V-Guard (Copper)" },
          { id: uid("ti"), item: "DC Wire", brand: "Waacab (Copper)" },
        ],
      },
      {
        id: uid("t"),
        name: "Value Plus",
        price: "2,00,000",
        note: "Balanced performance and cost",
        items: [
          { id: uid("ti"), item: "Solar PV Module", brand: "Eastman / Luminous / UTL" },
          { id: uid("ti"), item: "Inverter", brand: "Waaree / Deye / Polycab" },
          { id: uid("ti"), item: "Structure (6 legged)", brand: "JSW / SAIL" },
          { id: uid("ti"), item: "ACDB / DCDB", brand: "Waaree / Havells / Schneider" },
          { id: uid("ti"), item: "Earthing", brand: "Copper" },
          { id: uid("ti"), item: "AC Wire", brand: "V-Guard (Copper)" },
          { id: uid("ti"), item: "DC Wire", brand: "Waacab (Copper)" },
        ],
      },
      {
        id: uid("t"),
        name: "Eco",
        price: "1,90,000",
        note: "Entry-level certified package",
        items: [
          { id: uid("ti"), item: "Solar PV Module", brand: "Exide / Icon / Websol" },
          { id: uid("ti"), item: "Inverter", brand: "Waaree / Deye / Polycab" },
          { id: uid("ti"), item: "Structure (6 legged)", brand: "JSW / SAIL" },
          { id: uid("ti"), item: "ACDB / DCDB", brand: "Waaree / Havells / Schneider" },
          { id: uid("ti"), item: "Earthing", brand: "Copper" },
          { id: uid("ti"), item: "AC Wire", brand: "V-Guard (Copper)" },
          { id: uid("ti"), item: "DC Wire", brand: "Waacab (Copper)" },
        ],
      },
    ],
    terms: [
      "Delivery Timeline: Installation and testing are completed within the stated delivery period from receipt of advance payment and technical roof clearance.",
      "Proposal Validity: This commercial proposal and its pricing structure remain valid for the validity period stated on the cover.",
      "Exclusions: Scope excludes structural reinforcement of existing roofs, repair of legacy electrical systems and civil masonry modifications unless explicitly listed.",
      "Force Majeure: Timelines are subject to standard force majeure protections covering natural events, statutory actions or severe supply-chain disruptions.",
      "Taxes & Levies: Pricing includes statutory taxes at current schedules. Any regulatory revision enacted before commissioning shall apply.",
      "Net Metering: Sanction and meter installation timelines are governed by the utility and are outside the direct control of ADP Green Energies.",
    ],
    acceptance: {
      intro:
        "By signing below, both parties formally accept the technical design, commercial offer and execution terms detailed within this proposal document.",
      clientSignatoryLabel: "Authorised Signatory",
    },
    sections: {
      cover: true,
      letter: true,
      profile: true,
      technical: true,
      scope: true,
      boq: true,
      features: true,
      commercial: true,
      warranty: true,
      benefits: true,
      tiers: false,
      terms: true,
      acceptance: true,
      thanks: true,
    },
  }
}
