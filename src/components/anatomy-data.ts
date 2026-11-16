// ============================================================
//  HumanBodyExplorer — anatomical data
// ============================================================

export interface AnatomySystem {
  id: string;
  name: string;
  color: string;          // hex
  emissive: string;       // hex (glow)
  icon: string;
  structures: AnatomyStructure[];
}

export interface AnatomyStructure {
  id: string;
  name: string;
  latinName: string;
  system: string;
  description: string;
  facts: string[];
  stats: { label: string; value: string }[];
  // Three.js geometry descriptor
  shape: 'sphere' | 'capsule' | 'box' | 'cylinder' | 'torus';
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
}

// ---- Systems -----------------------------------------------
export const ANATOMY_SYSTEMS: AnatomySystem[] = [
  {
    id: 'skeletal',
    name: 'Skeletal',
    color: '#e2d9c8',
    emissive: '#8a7d6a',
    icon: '🦴',
    structures: [],
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    color: '#ef4444',
    emissive: '#7f1d1d',
    icon: '❤️',
    structures: [],
  },
  {
    id: 'respiratory',
    name: 'Respiratory',
    color: '#38bdf8',
    emissive: '#0c4a6e',
    icon: '🫁',
    structures: [],
  },
  {
    id: 'digestive',
    name: 'Digestive',
    color: '#f59e0b',
    emissive: '#78350f',
    icon: '🫃',
    structures: [],
  },
  {
    id: 'nervous',
    name: 'Nervous',
    color: '#a78bfa',
    emissive: '#3b0764',
    icon: '🧠',
    structures: [],
  },
  {
    id: 'muscular',
    name: 'Muscular',
    color: '#f97316',
    emissive: '#7c2d12',
    icon: '💪',
    structures: [],
  },
  {
    id: 'lymphatic',
    name: 'Lymphatic',
    color: '#86efac',
    emissive: '#14532d',
    icon: '🫀',
    structures: [],
  },
  {
    id: 'endocrine',
    name: 'Endocrine',
    color: '#f0abfc',
    emissive: '#581c87',
    icon: '⚗️',
    structures: [],
  },
];

export const SYSTEM_MAP: Record<string, AnatomySystem> = Object.fromEntries(
  ANATOMY_SYSTEMS.map((s) => [s.id, s])
);

// ---- Structures --------------------------------------------
export const ANATOMY_STRUCTURES: AnatomyStructure[] = [
  // ── BRAIN ─────────────────────────────────────────────────
  {
    id: 'brain',
    name: 'Brain',
    latinName: 'Encephalon',
    system: 'nervous',
    description:
      'The brain is the central organ of the nervous system, controlling thought, memory, emotion, vision, hearing, and all basic body functions. It consists of approximately 86 billion neurons.',
    facts: [
      'Contains ~86 billion neurons and ~85 billion non-neuronal cells',
      'Consumes ~20% of the body\'s total energy despite being only 2% of body weight',
      'Generates roughly 23 watts of power — enough to light a small light bulb',
      'The cerebral cortex has a surface area of ~2,500 cm² when unfolded',
    ],
    stats: [
      { label: 'Weight', value: '1.4 kg' },
      { label: 'Neurons', value: '86B' },
      { label: 'Regions', value: '4 lobes' },
      { label: 'Energy use', value: '20%' },
    ],
    shape: 'sphere',
    position: [0, 2.6, 0],
    scale: [0.55, 0.5, 0.52],
  },

  // ── HEART ─────────────────────────────────────────────────
  {
    id: 'heart',
    name: 'Heart',
    latinName: 'Cor',
    system: 'cardiovascular',
    description:
      'The heart is a muscular organ roughly the size of a fist, pumping oxygenated blood through the arterial system and deoxygenated blood back to the lungs. It beats 60–100 times per minute at rest.',
    facts: [
      'Beats approximately 100,000 times per day',
      'Pumps ~5 litres of blood per minute at rest, up to 25 L during exercise',
      'The left ventricle wall is 3× thicker than the right to generate systemic pressure',
      'Cardiac muscle (myocardium) is unique — it cannot fatigue under normal conditions',
    ],
    stats: [
      { label: 'Beat/day', value: '100 k' },
      { label: 'Output', value: '5 L/min' },
      { label: 'Weight', value: '300 g' },
      { label: 'Chambers', value: '4' },
    ],
    shape: 'sphere',
    position: [-0.15, 1.4, 0.15],
    scale: [0.28, 0.3, 0.26],
  },

  // ── LUNGS ─────────────────────────────────────────────────
  {
    id: 'lung-left',
    name: 'Left Lung',
    latinName: 'Pulmo sinister',
    system: 'respiratory',
    description:
      'The left lung is slightly smaller than the right to accommodate the heart. It has two lobes — superior and inferior — and contains the cardiac notch. Each lung is covered by the pleura.',
    facts: [
      'Surface area of alveoli is approximately 70 m² — the size of a tennis court',
      'Contains ~300–500 million alveoli for gas exchange',
      'The left lung has 2 lobes; the right has 3',
      'Air travels at ~4 m/s through the trachea during normal breathing',
    ],
    stats: [
      { label: 'Lobes', value: '2' },
      { label: 'Alveoli', value: '300 M+' },
      { label: 'Gas area', value: '70 m²' },
      { label: 'Volume', value: '~2.5 L' },
    ],
    shape: 'capsule',
    position: [-0.4, 1.3, 0.05],
    scale: [0.22, 0.45, 0.18],
  },
  {
    id: 'lung-right',
    name: 'Right Lung',
    latinName: 'Pulmo dexter',
    system: 'respiratory',
    description:
      'The right lung is slightly larger with three lobes — superior, middle, and inferior. It is wider than the left lung as the liver pushes the diaphragm higher on the right side.',
    facts: [
      'Right lung is ~10% larger in volume than the left lung',
      'Has 3 lobes separated by horizontal and oblique fissures',
      'Receives ~55% of total pulmonary blood flow',
      'Bronchi subdivide into 23 generations before reaching alveoli',
    ],
    stats: [
      { label: 'Lobes', value: '3' },
      { label: 'Alveoli', value: '350 M+' },
      { label: 'Gas area', value: '70 m²' },
      { label: 'Volume', value: '~3 L' },
    ],
    shape: 'capsule',
    position: [0.4, 1.3, 0.05],
    scale: [0.22, 0.47, 0.18],
  },

  // ── LIVER ─────────────────────────────────────────────────
  {
    id: 'liver',
    name: 'Liver',
    latinName: 'Hepar',
    system: 'digestive',
    description:
      'The liver is the largest internal organ, performing over 500 metabolic functions including detoxification, protein synthesis, bile production, and glycogen storage. It receives a dual blood supply from the portal vein and hepatic artery.',
    facts: [
      'Performs over 500 known metabolic functions',
      'Only internal organ capable of complete regeneration',
      'Produces ~1 litre of bile per day for fat digestion',
      'Receives 25% of total cardiac output each minute',
    ],
    stats: [
      { label: 'Weight', value: '1.5 kg' },
      { label: 'Lobes', value: '4' },
      { label: 'Bile/day', value: '1 L' },
      { label: 'Functions', value: '500+' },
    ],
    shape: 'sphere',
    position: [0.3, 0.6, 0.1],
    scale: [0.42, 0.28, 0.3],
  },

  // ── STOMACH ───────────────────────────────────────────────
  {
    id: 'stomach',
    name: 'Stomach',
    latinName: 'Gaster',
    system: 'digestive',
    description:
      'The stomach is a muscular sac in the upper left abdomen that stores and processes food. It secretes hydrochloric acid (pH 1–2) and digestive enzymes, and can expand from ~75 mL when empty to ~1 L after a meal.',
    facts: [
      'Produces ~2 litres of gastric acid (HCl) per day',
      'Stomach lining is completely replaced every 3–5 days',
      'Churns food into chyme via peristaltic movements',
      'Gastric emptying time: 2–5 hours depending on meal composition',
    ],
    stats: [
      { label: 'Capacity', value: '1–4 L' },
      { label: 'pH', value: '1–2' },
      { label: 'HCl/day', value: '2 L' },
      { label: 'Empty time', value: '2–5 h' },
    ],
    shape: 'sphere',
    position: [-0.15, 0.55, 0.1],
    scale: [0.22, 0.2, 0.18],
  },

  // ── KIDNEYS ───────────────────────────────────────────────
  {
    id: 'kidney-left',
    name: 'Left Kidney',
    latinName: 'Ren sinister',
    system: 'lymphatic',
    description:
      'The kidneys filter blood to produce urine, regulating fluid balance, electrolytes, and blood pressure. Each kidney contains about 1 million nephrons — the functional filtering units.',
    facts: [
      'Filters ~180 litres of blood per day, producing ~1.5 L of urine',
      'Contains ~1 million nephrons per kidney',
      'Regulates blood pressure via the renin-angiotensin system',
      'Left kidney is typically slightly larger and sits a little higher',
    ],
    stats: [
      { label: 'Filter/day', value: '180 L' },
      { label: 'Nephrons', value: '1 M' },
      { label: 'Weight', value: '150 g' },
      { label: 'Urine/day', value: '1.5 L' },
    ],
    shape: 'capsule',
    position: [-0.45, 0.2, -0.08],
    scale: [0.14, 0.22, 0.12],
  },
  {
    id: 'kidney-right',
    name: 'Right Kidney',
    latinName: 'Ren dexter',
    system: 'lymphatic',
    description:
      'The right kidney sits slightly lower than the left due to the liver above it. It performs the same filtration functions and is connected to the inferior vena cava and right renal artery.',
    facts: [
      'Sits 2–3 cm lower than the left kidney due to the liver',
      'Renal arteries branch directly from the aorta',
      'Each nephron loops through the cortex and medulla',
      'Kidneys receive ~25% of cardiac output per minute',
    ],
    stats: [
      { label: 'Filter/day', value: '180 L' },
      { label: 'Nephrons', value: '1 M' },
      { label: 'Weight', value: '150 g' },
      { label: 'Blood flow', value: '25%' },
    ],
    shape: 'capsule',
    position: [0.45, 0.2, -0.08],
    scale: [0.14, 0.22, 0.12],
  },

  // ── SPINE ─────────────────────────────────────────────────
  {
    id: 'spine',
    name: 'Vertebral Column',
    latinName: 'Columna vertebralis',
    system: 'skeletal',
    description:
      'The vertebral column (spine) consists of 33 vertebrae forming the central axis of the skeleton. It protects the spinal cord, supports the skull, and provides attachment points for muscles and ribs.',
    facts: [
      '33 vertebrae: 7 cervical, 12 thoracic, 5 lumbar, 5 sacral, 4 coccygeal',
      'Intervertebral discs act as shock absorbers between vertebrae',
      'The spine has 4 natural curves for load distribution',
      'The spinal cord passes through the vertebral foramen of each vertebra',
    ],
    stats: [
      { label: 'Vertebrae', value: '33' },
      { label: 'Discs', value: '23' },
      { label: 'Curves', value: '4' },
      { label: 'Length', value: '70 cm' },
    ],
    shape: 'capsule',
    position: [0, 0.9, -0.25],
    scale: [0.1, 1.0, 0.1],
  },

  // ── SKULL ─────────────────────────────────────────────────
  {
    id: 'skull',
    name: 'Skull',
    latinName: 'Cranium',
    system: 'skeletal',
    description:
      'The skull consists of 22 bones forming the cranium (which encloses the brain) and the facial skeleton. The 8 cranial bones are fused by fibrous joints called sutures in adults.',
    facts: [
      'Made of 22 bones: 8 cranial and 14 facial',
      'Cranial bones fuse at sutures by age 2 and are fully fused by adulthood',
      'The mandible is the only movable bone of the skull',
      'Cranial capacity averages ~1,400 mL in adults',
    ],
    stats: [
      { label: 'Bones', value: '22' },
      { label: 'Cranial', value: '8' },
      { label: 'Capacity', value: '1,400 mL' },
      { label: 'Movable', value: '1 (jaw)' },
    ],
    shape: 'sphere',
    position: [0, 2.6, 0],
    scale: [0.56, 0.52, 0.53],
  },

  // ── AORTA ─────────────────────────────────────────────────
  {
    id: 'aorta',
    name: 'Aorta',
    latinName: 'Aorta',
    system: 'cardiovascular',
    description:
      'The aorta is the largest artery in the body, arising from the left ventricle. It distributes oxygenated blood to all systemic tissues. It has four sections: ascending, arch, descending thoracic, and abdominal.',
    facts: [
      'Diameter of ~2.5–3.5 cm in the thorax and ~1.7–2 cm in the abdomen',
      'Blood velocity in aorta: ~1 m/s during systole',
      'The aortic wall must withstand pressures of 120 mmHg each heartbeat',
      'Abdominal aorta bifurcates at L4 into the common iliac arteries',
    ],
    stats: [
      { label: 'Diameter', value: '~3 cm' },
      { label: 'Flow', value: '5 L/min' },
      { label: 'Pressure', value: '120 mmHg' },
      { label: 'Length', value: '~40 cm' },
    ],
    shape: 'capsule',
    position: [-0.05, 1.1, 0.1],
    scale: [0.08, 0.6, 0.08],
  },

  // ── PANCREAS ──────────────────────────────────────────────
  {
    id: 'pancreas',
    name: 'Pancreas',
    latinName: 'Pancreas',
    system: 'endocrine',
    description:
      'The pancreas has dual roles: exocrine (secreting digestive enzymes into the duodenum) and endocrine (secreting insulin and glucagon into the blood via islets of Langerhans).',
    facts: [
      'Islets of Langerhans: ~1 million clusters of endocrine cells',
      'Produces ~1.5 L of pancreatic juice per day',
      'Insulin regulates blood glucose uptake into cells',
      'Glucagon raises blood glucose by stimulating glycogenolysis in the liver',
    ],
    stats: [
      { label: 'Weight', value: '100 g' },
      { label: 'Juice/day', value: '1.5 L' },
      { label: 'Islets', value: '~1 M' },
      { label: 'Hormones', value: '5+' },
    ],
    shape: 'capsule',
    position: [0.1, 0.4, 0.05],
    scale: [0.25, 0.09, 0.08],
    rotation: [0, 0, 0.3],
  },

  // ── THYROID ───────────────────────────────────────────────
  {
    id: 'thyroid',
    name: 'Thyroid Gland',
    latinName: 'Glandula thyroidea',
    system: 'endocrine',
    description:
      'The thyroid gland wraps around the trachea and produces thyroxine (T4) and triiodothyronine (T3), which regulate metabolic rate, growth, and development. It also produces calcitonin for calcium regulation.',
    facts: [
      'Largest endocrine gland in the body',
      'Thyroid hormones regulate basal metabolic rate',
      'Requires iodine to synthesise T3 and T4',
      'TSH from the pituitary gland controls thyroid hormone secretion',
    ],
    stats: [
      { label: 'Weight', value: '20–30 g' },
      { label: 'Hormones', value: 'T3, T4, CT' },
      { label: 'Follicles', value: 'millions' },
      { label: 'Lobe', value: '2 + isthmus' },
    ],
    shape: 'torus',
    position: [0, 2.0, 0.22],
    scale: [0.14, 0.14, 0.07],
  },

  // ── SMALL INTESTINE ───────────────────────────────────────
  {
    id: 'small-intestine',
    name: 'Small Intestine',
    latinName: 'Intestinum tenue',
    system: 'digestive',
    description:
      'The small intestine is a 6–7 metre long coiled tube where most digestion and nutrient absorption occur. It has three segments: duodenum, jejunum, and ileum.',
    facts: [
      '6–7 m long with surface area of ~250–400 m² due to villi and microvilli',
      'Villi increase absorptive surface area ~600-fold',
      'Transit time: 2–6 hours for complete passage',
      'Absorbs ~95% of nutrients from digested food',
    ],
    stats: [
      { label: 'Length', value: '6–7 m' },
      { label: 'Area', value: '250 m²' },
      { label: 'Segments', value: '3' },
      { label: 'Transit', value: '2–6 h' },
    ],
    shape: 'torus',
    position: [0, 0.1, 0.1],
    scale: [0.3, 0.3, 0.1],
  },

  // ── LARGE INTESTINE ───────────────────────────────────────
  {
    id: 'large-intestine',
    name: 'Large Intestine',
    latinName: 'Intestinum crassum',
    system: 'digestive',
    description:
      'The large intestine (colon) is ~1.5 m long and absorbs water and electrolytes from indigestible food matter. It houses trillions of gut bacteria (microbiome) essential for health.',
    facts: [
      'Contains ~38 trillion bacteria — matching the number of human cells',
      'Absorbs ~1.3 L of water per day from chyme',
      'Transit time: 10–59 hours (average ~36 hours)',
      'Divided into cecum, ascending, transverse, descending, sigmoid colon, and rectum',
    ],
    stats: [
      { label: 'Length', value: '1.5 m' },
      { label: 'Bacteria', value: '38 T' },
      { label: 'Water abs', value: '1.3 L/d' },
      { label: 'Transit', value: '10–59 h' },
    ],
    shape: 'torus',
    position: [0, -0.3, 0.1],
    scale: [0.38, 0.38, 0.1],
  },
];
