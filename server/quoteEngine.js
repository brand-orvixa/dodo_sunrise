// Rule-based construction cost estimator. All figures USD, areas in sq ft.

export const PROJECT_TYPES = {
  house: { label: 'New home construction', rate: 150, weeks: 30, build: 'new', trades: ['General contractor', 'Structural engineer', 'Architect', 'Licensed electrician', 'Plumber', 'HVAC contractor'] },
  extension: { label: 'Home extension / addition', rate: 210, weeks: 16, build: 'new', trades: ['Design-build contractor', 'Structural engineer', 'Roofer', 'Electrician', 'Plumber'] },
  renovation: { label: 'Full home renovation', rate: 95, weeks: 14, build: 'fitout', trades: ['Renovation contractor', 'Interior designer', 'Electrician', 'Plumber', 'Flooring specialist'] },
  kitchen_bath: { label: 'Kitchen & bathroom remodel', rate: 260, weeks: 9, build: 'fitout', trades: ['Remodeling contractor', 'Cabinet maker', 'Tiler', 'Plumber', 'Electrician'] },
  interior: { label: 'Interior fit-out', rate: 75, weeks: 9, build: 'fitout', trades: ['Fit-out contractor', 'Interior designer', 'Joinery workshop', 'Electrician', 'Painter'] },
  commercial: { label: 'Commercial building', rate: 190, weeks: 34, build: 'new', trades: ['Commercial general contractor', 'Architect', 'Structural & MEP engineers', 'Fire safety consultant', 'Quantity surveyor'] },
  warehouse: { label: 'Warehouse / industrial shed', rate: 95, weeks: 24, build: 'new', trades: ['Industrial contractor', 'Steel fabricator', 'Civil engineer', 'Electrical contractor'] },
};

// type: 'fixed' (USD) | 'sqft' (USD per sq ft of total area) | 'footprint' (USD per sq ft of ground floor)
export const FEATURES = {
  demolition: { label: 'Demolition & site clearing', type: 'footprint', value: 9 },
  basement: { label: 'Basement', type: 'footprint', value: 45 },
  garage: { label: 'Attached garage', type: 'fixed', value: 38000 },
  hvac: { label: 'Central HVAC upgrade', type: 'sqft', value: 9 },
  solar: { label: 'Rooftop solar system', type: 'fixed', value: 19000 },
  smarthome: { label: 'Smart home & security', type: 'sqft', value: 4.5 },
  elevator: { label: 'Elevator / lift', type: 'fixed', value: 48000 },
  pool: { label: 'Swimming pool', type: 'fixed', value: 68000 },
  landscaping: { label: 'Landscaping & hardscape', type: 'fixed', value: 26000 },
  sprinkler: { label: 'Fire sprinkler system', type: 'sqft', value: 5 },
  driveway: { label: 'Driveway & paving', type: 'fixed', value: 12000 },
  evcharger: { label: 'EV charging point', type: 'fixed', value: 2600 },
};

const QUALITY = {
  standard: { label: 'Standard finish', mult: 1, weeks: 1 },
  premium: { label: 'Premium finish', mult: 1.38, weeks: 1.12 },
  luxury: { label: 'Luxury / custom finish', mult: 1.85, weeks: 1.3 },
};
const SITE = {
  flat: { label: 'Flat, easy access', mult: 1 },
  sloped: { label: 'Sloped or tight site', mult: 1.08 },
  difficult: { label: 'Difficult (rock, water, urban)', mult: 1.18 },
};
const TIMELINE = { flexible: { label: 'Flexible', mult: 0.97 }, standard: { label: 'Standard', mult: 1 }, fast: { label: 'Fast-track', mult: 1.15 } };
const REGIONS = {
  us: { label: 'United States / Canada', mult: 1 },
  uk: { label: 'United Kingdom', mult: 1.08 },
  eu: { label: 'Western Europe', mult: 1.04 },
  au: { label: 'Australia / NZ', mult: 1.06 },
  me: { label: 'Middle East', mult: 0.8 },
  asia: { label: 'South / Southeast Asia', mult: 0.38 },
};
const PROVIDERS = {
  budget: { label: 'Budget contractor', mult: 0.84 },
  mid: { label: 'Mid-range builder', mult: 1 },
  premium: { label: 'Premium builder', mult: 1.32 },
};

const SHARES = {
  new: [
    ['Site preparation & excavation', 0.06], ['Foundation & concrete', 0.11], ['Structure & framing', 0.17], ['Roofing', 0.07],
    ['Exterior walls, windows & doors', 0.11], ['Plumbing', 0.08], ['Electrical', 0.08], ['HVAC & ventilation', 0.06],
    ['Insulation & drywall', 0.07], ['Flooring', 0.06], ['Kitchen & bathrooms', 0.08], ['Painting & finishing', 0.05],
  ],
  fitout: [
    ['Strip-out & protection', 0.06], ['Partitions & carpentry', 0.12], ['Plumbing', 0.11], ['Electrical & lighting', 0.13],
    ['HVAC adjustments', 0.06], ['Drywall & ceilings', 0.1], ['Flooring', 0.12], ['Joinery & cabinetry', 0.14],
    ['Tiling & waterproofing', 0.08], ['Painting & finishing', 0.08],
  ],
};

const round = (n, to = 100) => Math.round(n / to) * to;
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export function validateInput(body = {}) {
  const errors = [];
  const projectType = PROJECT_TYPES[body.projectType] ? body.projectType : null;
  if (!projectType) errors.push('Choose a project type.');
  return {
    errors,
    input: {
      projectType,
      area: clamp(parseInt(body.area, 10) || 1500, 50, 500000),
      floors: clamp(parseInt(body.floors, 10) || 1, 1, 40),
      quality: QUALITY[body.quality] ? body.quality : 'standard',
      site: SITE[body.site] ? body.site : 'flat',
      features: Array.isArray(body.features) ? [...new Set(body.features.filter((f) => FEATURES[f]))] : [],
      design: body.design !== false,
      timeline: TIMELINE[body.timeline] ? body.timeline : 'standard',
      region: REGIONS[body.region] ? body.region : 'us',
      projectName: String(body.projectName || '').slice(0, 120).trim(),
    },
  };
}

export function buildQuote(input) {
  const type = PROJECT_TYPES[input.projectType];
  const quality = QUALITY[input.quality];
  const site = SITE[input.site];
  const region = REGIONS[input.region];
  const timeline = TIMELINE[input.timeline];
  const footprint = input.area / input.floors;
  const floorMult = 1 + Math.max(0, input.floors - 2) * 0.03;
  const loc = region.mult * timeline.mult;

  // Hard costs: trades
  const base = input.area * type.rate * quality.mult * site.mult * floorMult * loc;
  const breakdown = SHARES[type.build].map(([label, share]) => ({ label, group: 'Construction', cost: round(base * share) }));

  for (const key of input.features) {
    const f = FEATURES[key];
    const raw = f.type === 'fixed' ? f.value * (quality.mult * 0.5 + 0.5) : f.value * (f.type === 'sqft' ? input.area : footprint);
    breakdown.push({ label: f.label, group: 'Add-ons', cost: round(raw * loc) });
  }
  const hard = breakdown.reduce((s, b) => s + b.cost, 0);

  // Soft costs
  if (input.design) breakdown.push({ label: 'Architecture & engineering design', group: 'Soft costs', cost: round(hard * (type.build === 'new' ? 0.08 : 0.06)) });
  breakdown.push({ label: 'Permits, inspections & approvals', group: 'Soft costs', cost: round(hard * 0.025 + 800) });
  breakdown.push({ label: 'Contractor overhead & profit', group: 'Soft costs', cost: round(hard * 0.15) });
  breakdown.push({ label: 'Contingency reserve (10%)', group: 'Soft costs', cost: round(hard * 0.1) });

  const total = breakdown.reduce((s, b) => s + b.cost, 0);
  const tiers = {};
  for (const [k, p] of Object.entries(PROVIDERS)) {
    const mid = total * p.mult;
    tiers[k] = { label: p.label, perSqft: Math.round(mid / input.area), low: round(mid * 0.9, 500), high: round(mid * 1.12, 500) };
  }

  const scale = Math.max(0.6, Math.pow(input.area / 2000, 0.33));
  const weeks = type.weeks * scale * quality.weeks * (1 + (input.floors - 1) * 0.04) * (input.timeline === 'fast' ? 0.8 : 1) * Math.sqrt(site.mult);
  const timelineWeeks = { min: Math.max(2, Math.round(weeks * 0.85)), max: Math.max(3, Math.round(weeks * 1.2)) };
  const phaseShare = type.build === 'new'
    ? [['Design & permits', 0.18], ['Site prep & foundation', 0.15], ['Structure & roof', 0.25], ['MEP rough-in', 0.14], ['Interior finishes', 0.22], ['Inspection & handover', 0.06]]
    : [['Design & approvals', 0.15], ['Strip-out', 0.1], ['MEP rough-in', 0.2], ['Carpentry & drywall', 0.2], ['Finishes & fixtures', 0.28], ['Snagging & handover', 0.07]];
  const phases = phaseShare.map(([name, s]) => ({ name, weeks: Math.max(0.5, Math.round(timelineWeeks.max * s * 2) / 2) }));

  const paymentSchedule = (type.build === 'new'
    ? [['Deposit / mobilisation', 10], ['Foundation complete', 15], ['Structure & roof complete', 25], ['MEP rough-in complete', 20], ['Finishes complete', 25], ['Retention (after defects period)', 5]]
    : [['Deposit', 15], ['Strip-out & rough-in complete', 30], ['Drywall & carpentry complete', 25], ['Practical completion', 25], ['Retention', 5]]
  ).map(([stage, pct]) => ({ stage, pct, amount: round(tiers.mid.low * pct / 100) }));

  const materials = type.build === 'new' ? [
    { label: 'Concrete', qty: `${Math.round(footprint * 0.045 + input.area * 0.012)} cu yd` },
    { label: 'Reinforcing steel', qty: `${(input.area * 0.0022).toFixed(1)} tons` },
    { label: 'Roofing material', qty: `${Math.round(footprint * 1.15 / 100)} squares` },
    { label: 'Drywall', qty: `${Math.round(input.area * 3.4 / 32)} sheets (4×8)` },
    { label: 'Flooring', qty: `${Math.round(input.area * 1.08)} sq ft` },
  ] : [
    { label: 'Drywall', qty: `${Math.round(input.area * 2.2 / 32)} sheets (4×8)` },
    { label: 'Flooring', qty: `${Math.round(input.area * 1.1)} sq ft` },
    { label: 'Paint', qty: `${Math.round(input.area * 2.8 / 350)} gallons` },
    { label: 'Tiles (wet areas)', qty: `${Math.round(input.area * 0.12)} sq ft` },
  ];

  const complexity = clamp(Math.round(Math.log10(total / 8000) * 3 + input.features.length * 0.3 + (input.site !== 'flat' ? 1 : 0)), 1, 10);

  const tips = [
    'Get at least three itemized bids on the same drawings and specification so you can compare them fairly.',
    'Tie every payment to a completed, inspected milestone. Never pay more than 15% upfront.',
    `Keep the ${round(total * 0.1 / 1.25).toLocaleString('en-US')} USD contingency untouched for genuine surprises, not upgrades.`,
    input.quality !== 'standard' ? 'Buy high-end fixtures yourself or use allowances, since contractors often add a 15–25% markup.' : 'Lock in material prices early. Steel, lumber and copper prices change a lot.',
    input.timeline === 'fast' ? 'Fast-tracking adds about 15%. Starting a few weeks later can save a significant amount.' : 'Off-season starts (late autumn/winter) can attract better contractor pricing.',
  ];
  const redFlags = [
    'Bids far below the budget range usually mean missing scope or expensive change orders later.',
    'No valid licence, liability insurance or workers\' compensation certificate.',
    'Large cash deposits demanded upfront, or pressure to skip permits.',
    'Vague allowances ("fixtures TBD") instead of specified products and quantities.',
  ];
  const questions = [
    'Can I visit two recent projects of similar size and speak to those clients?',
    'Which trades do you self-perform, and which are subcontracted?',
    'How are change orders priced and approved?',
    'What warranty do you give on workmanship and structure, and for how long?',
    'Who is the site supervisor, and how often will I get progress reports?',
  ];

  return {
    summary: {
      projectType: type.label, area: input.area, floors: input.floors, quality: quality.label, site: site.label,
      timeline: timeline.label, region: region.label, features: input.features.map((f) => FEATURES[f].label), design: input.design,
    },
    total, complexity, tiers, breakdown, timelineWeeks, phases, paymentSchedule, materials,
    trades: type.trades, tips, redFlags, questions,
  };
}

export function previewOf(quote) {
  return {
    summary: quote.summary,
    complexity: quote.complexity,
    timelineWeeks: quote.timelineWeeks,
    breakdownCount: quote.breakdown.length,
    breakdownLabels: quote.breakdown.slice(0, 3).map((b) => b.label),
  };
}

export const OPTIONS = {
  projectTypes: Object.entries(PROJECT_TYPES).map(([k, v]) => ({ value: k, label: v.label })),
  features: Object.entries(FEATURES).map(([k, v]) => ({ value: k, label: v.label })),
  qualities: Object.entries(QUALITY).map(([k, v]) => ({ value: k, label: v.label })),
  sites: Object.entries(SITE).map(([k, v]) => ({ value: k, label: v.label })),
  timelines: Object.entries(TIMELINE).map(([k, v]) => ({ value: k, label: v.label })),
  regions: Object.entries(REGIONS).map(([k, v]) => ({ value: k, label: v.label })),
};
