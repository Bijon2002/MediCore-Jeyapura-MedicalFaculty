// ============================================================
//  HumanBodyExplorer — open-anatomy-3d-react integration
//  Real 147-structure model: orbit, zoom, click, male/female toggle
// ============================================================
import { useState, useCallback } from 'react';
import { AnatomyViewer } from 'open-anatomy-3d-react';
import type { AnatomyStructure } from 'open-anatomy-3d';
import 'open-anatomy-3d-react/styles.css';
import './HumanBodyExplorer.css';

// ---- Clinical data keyed by catalog key -------------------------
interface ClinicalInfo {
  latin: string;
  description: string;
  stats: { label: string; value: string }[];
  facts: string[];
}

const CLINICAL_DATA: Record<string, ClinicalInfo> = {
  heart: {
    latin: 'Cor',
    description: 'A muscular pump consisting of four chambers that circulates ~5 L of blood per minute at rest, rising to 25 L during intense exercise. Coordinated by the cardiac conduction system.',
    stats: [{ label: 'Beats/day', value: '100 k' }, { label: 'Output', value: '5 L/min' }, { label: 'Weight', value: '300 g' }, { label: 'Chambers', value: '4' }],
    facts: ['Beats approximately 100,000 times per day without rest', 'The left ventricular wall is 3× thicker than the right to generate systemic pressure', 'Cardiac muscle cannot fatigue under normal physiological conditions', 'Coronary arteries supply the myocardium and are perfused during diastole'],
  },
  brain: {
    latin: 'Encephalon',
    description: 'The central control organ of the nervous system housing ~86 billion neurons. Responsible for consciousness, cognition, emotion, sensory processing, and motor control.',
    stats: [{ label: 'Neurons', value: '86 B' }, { label: 'Weight', value: '1.4 kg' }, { label: 'Energy use', value: '20%' }, { label: 'Regions', value: '4 lobes' }],
    facts: ['Consumes 20% of total body energy despite being only 2% of body weight', 'Contains approximately 86 billion neurons and 85 billion non-neuronal cells', 'Generates roughly 23 watts — enough to power a small LED', 'The cerebral cortex has ~2,500 cm² of surface area when unfolded'],
  },
  brainstem: {
    latin: 'Truncus cerebri',
    description: 'Connects the cerebrum to the spinal cord and cerebellum. Controls vital autonomic functions including respiration, heart rate, and blood pressure. Includes midbrain, pons, and medulla oblongata.',
    stats: [{ label: 'Parts', value: '3' }, { label: 'CN pairs', value: '10/12' }, { label: 'Role', value: 'Vital ctrl' }, { label: 'Length', value: '~7 cm' }],
    facts: ['Houses the cardiovascular and respiratory control centres', 'Origin of cranial nerves III–XII', 'The reticular activating system in the brainstem regulates consciousness', 'Damage can be rapidly fatal due to control of breathing and heart rate'],
  },
  cerebellum: {
    latin: 'Cerebellum',
    description: 'Occupies the posterior cranial fossa and coordinates voluntary movement, balance, and fine motor control. Contains over half of all neurons in the brain.',
    stats: [{ label: 'Neurons', value: '>50%' }, { label: 'Lobes', value: '3' }, { label: 'Weight', value: '~150 g' }, { label: 'Folia', value: '1000+' }],
    facts: ['Contains more neurons than the entire rest of the brain combined', 'Responsible for motor learning, coordination, and balance', 'Damage causes ataxia — loss of coordinated movement', 'Has about 10 times more surface area than the cerebral cortex if unfolded'],
  },
  lung_l: {
    latin: 'Pulmo sinister',
    description: 'The left lung has two lobes (superior and inferior) and accommodates the cardiac notch. Its ~300 million alveoli provide an enormous gas-exchange surface.',
    stats: [{ label: 'Lobes', value: '2' }, { label: 'Alveoli', value: '300 M' }, { label: 'Gas area', value: '70 m²' }, { label: 'Volume', value: '~2.5 L' }],
    facts: ['The cardiac notch accommodates the heart, making the left lung smaller', 'Pleural membranes reduce friction during breathing', 'Air reaches alveoli after 23 branching generations of airways', 'Surfactant produced by type II pneumocytes prevents alveolar collapse'],
  },
  lung_r: {
    latin: 'Pulmo dexter',
    description: 'The larger right lung with three lobes (superior, middle, inferior) separated by horizontal and oblique fissures. Receives ~55% of pulmonary blood flow.',
    stats: [{ label: 'Lobes', value: '3' }, { label: 'Alveoli', value: '350 M' }, { label: 'Gas area', value: '70 m²' }, { label: 'Volume', value: '~3 L' }],
    facts: ['Slightly larger than the left due to liver pushing the right hemidiaphragm higher', 'The right main bronchus is wider, shorter and more vertical — aspirated objects more commonly lodge here', 'Receives the majority of total pulmonary blood flow at rest', 'Bronchopulmonary segments are independent vascular/airway units allowing selective resection'],
  },
  liver: {
    latin: 'Hepar',
    description: 'Largest internal organ performing over 500 metabolic functions: detoxification, glycogen storage, bile synthesis, plasma protein production, and lipid metabolism.',
    stats: [{ label: 'Weight', value: '1.5 kg' }, { label: 'Lobes', value: '4' }, { label: 'Bile/day', value: '1 L' }, { label: 'Functions', value: '500+' }],
    facts: ['The only internal organ capable of complete regeneration', 'Receives dual blood supply: portal vein (75%) and hepatic artery (25%)', 'Produces albumin, clotting factors, and most plasma proteins', 'Metabolises drugs via cytochrome P450 enzyme system (first-pass metabolism)'],
  },
  stomach: {
    latin: 'Gaster / Ventriculus',
    description: 'J-shaped muscular sac secreting HCl (pH 1–2) and pepsinogen for protein digestion. Can expand from ~75 mL empty to over 1 litre after a meal.',
    stats: [{ label: 'Capacity', value: '1–4 L' }, { label: 'pH', value: '1–2' }, { label: 'HCl/day', value: '2 L' }, { label: 'Regions', value: '5' }],
    facts: ['Gastric mucosa replaces itself every 3–5 days to resist self-digestion', 'Chief cells secrete pepsinogen; parietal cells secrete HCl and intrinsic factor', 'Intrinsic factor is essential for vitamin B12 absorption in the ileum', 'The pyloric sphincter regulates emptying into the duodenum (2–5 hours)'],
  },
  kidney_l: {
    latin: 'Ren sinister',
    description: 'Filters blood to maintain fluid balance, electrolyte homeostasis, and acid-base status. Produces erythropoietin and activates vitamin D.',
    stats: [{ label: 'Filter/day', value: '180 L' }, { label: 'Nephrons', value: '1 M' }, { label: 'Urine/day', value: '1.5 L' }, { label: 'Weight', value: '150 g' }],
    facts: ['Filters 180 litres of plasma daily, excreting only 1.5 litres as urine', 'Renin-angiotensin-aldosterone system regulates blood pressure via the kidneys', 'Each nephron comprises glomerulus, Bowman\'s capsule, and tubular system', 'Erythropoietin from the kidney stimulates red blood cell production in bone marrow'],
  },
  kidney_r: {
    latin: 'Ren dexter',
    description: 'The right kidney sits 2–3 cm lower than the left due to the liver. Performs identical filtration, hormonal, and acid-base regulatory functions.',
    stats: [{ label: 'Filter/day', value: '180 L' }, { label: 'Nephrons', value: '1 M' }, { label: 'Blood flow', value: '25% CO' }, { label: 'Weight', value: '150 g' }],
    facts: ['Positioned slightly lower due to the right lobe of the liver', 'The renal artery branches directly from the abdominal aorta at L1–L2', 'GFR (glomerular filtration rate) of ~125 mL/min is the gold standard for kidney function', 'ACE inhibitors and ARBs reduce intraglomerular pressure and slow CKD progression'],
  },
  pancreas: {
    latin: 'Pancreas',
    description: 'Dual-function gland: exocrine portion secretes digestive enzymes into the duodenum; endocrine islets of Langerhans secrete insulin and glucagon into blood.',
    stats: [{ label: 'Weight', value: '100 g' }, { label: 'Juice/day', value: '1.5 L' }, { label: 'Islets', value: '~1 M' }, { label: 'Hormones', value: '5+' }],
    facts: ['Islets of Langerhans: α-cells (glucagon), β-cells (insulin), δ-cells (somatostatin)', 'Produces 1.5 L of alkaline pancreatic juice daily to neutralise gastric acid in the duodenum', 'Insulin deficiency leads to type 1 diabetes mellitus', 'Acute pancreatitis can be caused by gallstones, alcohol, or hypertriglyceridaemia'],
  },
  spleen: {
    latin: 'Lien',
    description: 'Largest lymphoid organ, filtering blood to remove aged erythrocytes and platelets, and mounting immune responses. Highly vascular and fragile to trauma.',
    stats: [{ label: 'Weight', value: '150 g' }, { label: 'Blood flow', value: '5% CO' }, { label: 'Position', value: 'LUQ' }, { label: 'Size rule', value: '1-3-5-7-9-11' }],
    facts: ['Removes senescent red blood cells (~120-day lifespan) via red pulp', 'White pulp contains lymphoid tissue for immune surveillance and antibody production', 'Site of extramedullary haematopoiesis in infants and in diseases like myelofibrosis', 'Splenomegaly palpable when spleen is >2× normal size (>400 g)'],
  },
  gallbladder: {
    latin: 'Vesica biliaris',
    description: 'Concentrates and stores bile produced by the liver, releasing it into the duodenum via the common bile duct in response to cholecystokinin (CCK).',
    stats: [{ label: 'Capacity', value: '30–50 mL' }, { label: 'Concentrates', value: '5–10×' }, { label: 'Trigger', value: 'CCK' }, { label: 'Position', value: 'RUQ' }],
    facts: ['Concentrates bile 5–10× by absorbing water and electrolytes', 'Cholecystokinin from the duodenum triggers gallbladder contraction', 'Gallstones (cholelithiasis) are predominantly cholesterol in Western countries', 'The cystic duct drains into the common hepatic duct to form the common bile duct'],
  },
  small_intestine: {
    latin: 'Intestinum tenue',
    description: 'A 6–7 m coiled tube (duodenum, jejunum, ileum) where most digestion and nutrient absorption occur. Surface area is amplified ~600-fold by villi and microvilli.',
    stats: [{ label: 'Length', value: '6–7 m' }, { label: 'Area', value: '250 m²' }, { label: 'Segments', value: '3' }, { label: 'Transit', value: '2–6 h' }],
    facts: ['Villi and microvilli (brush border) expand absorptive surface to ~250 m²', 'Duodenum receives bile and pancreatic juice via the ampulla of Vater', 'Lactase, sucrase, and maltase on the brush border digest disaccharides', 'Ileum specifically absorbs vitamin B12 and bile salts for enterohepatic circulation'],
  },
  large_intestine: {
    latin: 'Intestinum crassum',
    description: 'A 1.5 m tube (cecum → colon → rectum) absorbing water and electrolytes from indigestible matter. Houses the gut microbiome of ~38 trillion bacteria.',
    stats: [{ label: 'Length', value: '1.5 m' }, { label: 'Bacteria', value: '38 T' }, { label: 'Water abs', value: '1.3 L/d' }, { label: 'Transit', value: '10–59 h' }],
    facts: ['The microbiome synthesises vitamin K and short-chain fatty acids (SCFAs)', 'Haustral contractions mix contents; mass movements propel faeces toward the rectum', 'The ileocecal valve prevents backflow of colonic contents into the ileum', 'Colorectal cancer is the third most common cancer worldwide — 90% arise from adenomatous polyps'],
  },
  aorta: {
    latin: 'Aorta',
    description: 'Largest artery in the body arising from the left ventricle. Distributes oxygenated blood to all systemic organs. Has four named sections: ascending, arch, descending thoracic, and abdominal.',
    stats: [{ label: 'Diameter', value: '~3 cm' }, { label: 'Flow', value: '5 L/min' }, { label: 'Pressure', value: '120 mmHg' }, { label: 'Length', value: '~40 cm' }],
    facts: ['The aortic wall must withstand 120 mmHg of pressure with every heartbeat', 'Abdominal aorta bifurcates at L4 into the common iliac arteries', 'An abdominal aortic aneurysm (AAA) is defined as diameter >3 cm', 'The aorta contains baroreceptors in the aortic arch that modulate blood pressure reflex'],
  },
  skull: {
    latin: 'Cranium',
    description: 'The 22-bone osseous structure enclosing and protecting the brain (8 cranial bones) and forming the face (14 facial bones). Bones are joined by fibrous sutures.',
    stats: [{ label: 'Total bones', value: '22' }, { label: 'Cranial', value: '8' }, { label: 'Capacity', value: '1,400 mL' }, { label: 'Movable', value: '1 (jaw)' }],
    facts: ['The anterior fontanelle closes at 18–24 months; posterior at 2–3 months', 'The foramen magnum transmits the spinal cord, vertebral arteries, and spinal accessory nerves', 'The temporal bone houses the organs of hearing (cochlea) and balance (vestibular system)', 'Meningeal arteries run in grooves on the inner surface of the temporal and parietal bones'],
  },
  spinal_cord: {
    latin: 'Medulla spinalis',
    description: 'Extends from the foramen magnum to L1–L2. Conducts motor and sensory signals between brain and body, and mediates spinal reflex arcs.',
    stats: [{ label: 'Length', value: '45 cm' }, { label: 'Segments', value: '31' }, { label: 'Diameter', value: '~1.5 cm' }, { label: 'CSF vol', value: '25 mL' }],
    facts: ['31 pairs of spinal nerves exit between adjacent vertebrae', 'Injury above C4 may cause respiratory paralysis requiring ventilatory support', 'The cauda equina below L2 contains only nerve roots, not cord — less severe injury', 'Dermatome maps guide localisation of spinal cord injury level'],
  },
  skin: {
    latin: 'Cutis',
    description: 'The body\'s largest organ, constituting ~15% of body weight. Provides barrier protection, thermoregulation, sensation, and vitamin D synthesis.',
    stats: [{ label: 'Area', value: '1.5–2 m²' }, { label: 'Weight', value: '~5 kg' }, { label: 'Layers', value: '3' }, { label: 'Turnover', value: '2–4 wks' }],
    facts: ['The epidermis is completely replaced every 2–4 weeks', 'Melanocytes in the stratum basale produce melanin for UV protection', 'Eccrine sweat glands (2–4 million) provide thermoregulation', 'Keratinocytes are the predominant cell type in the epidermis (~95%)'],
  },
  thymus: {
    latin: 'Thymus',
    description: 'Primary lymphoid organ where T-lymphocytes mature and undergo selection for self-tolerance. Involutes after puberty and is replaced by fat tissue.',
    stats: [{ label: 'Peak weight', value: '30–40 g' }, { label: 'T-cells', value: '95%+ die' }, { label: 'Peak', value: 'Puberty' }, { label: 'Involution', value: 'Post-puberty' }],
    facts: ['Site of positive and negative selection — only 1–5% of T-cells survive to maturity', 'Produces thymosin, thymopoietin, and thymulin to promote T-cell maturation', 'Thymomas are associated with myasthenia gravis (anti-AChR antibodies)', 'DiGeorge syndrome (22q11 deletion) causes thymic aplasia and T-cell immunodeficiency'],
  },
  adrenal_l: {
    latin: 'Glandula suprarenalis sinistra',
    description: 'Triangular suprarenal gland with distinct cortex (aldosterone, cortisol, androgens) and medulla (adrenaline, noradrenaline). Regulates stress response and homeostasis.',
    stats: [{ label: 'Weight', value: '4–6 g' }, { label: 'Cortex zones', value: '3' }, { label: 'Position', value: 'T12 level' }, { label: 'Hormones', value: '30+' }],
    facts: ['Cortex: zona glomerulosa (aldosterone), zona fasciculata (cortisol), zona reticularis (androgens)', 'Medulla secretes adrenaline (80%) and noradrenaline (20%) in fight-or-flight', 'Addison\'s disease results from primary adrenal insufficiency', 'Cushing\'s syndrome from chronic excess cortisol — central obesity, striae, hypertension'],
  },
  adrenal_r: {
    latin: 'Glandula suprarenalis dextra',
    description: 'The right adrenal gland has a pyramidal shape and abuts the inferior vena cava. Functions identically to the left in producing cortisol, aldosterone, and catecholamines.',
    stats: [{ label: 'Weight', value: '4–6 g' }, { label: 'Blood supply', value: 'Triple' }, { label: 'Position', value: 'T12 level' }, { label: 'Vein', value: 'Direct to IVC' }],
    facts: ['The right adrenal vein drains directly into the inferior vena cava (short, surgically challenging)', 'Phaeochromocytoma — catecholamine-secreting tumour causing hypertensive crises', 'Primary hyperaldosteronism (Conn\'s syndrome) is a curable cause of hypertension', 'Stress activates the hypothalamic-pituitary-adrenal (HPA) axis to release cortisol'],
  },
  pituitary: {
    latin: 'Glandula pituitaria / Hypophysis',
    description: 'The "master gland" situated in the sella turcica, controlling thyroid, adrenal, reproductive, and growth functions via anterior and posterior lobes.',
    stats: [{ label: 'Weight', value: '0.5 g' }, { label: 'Hormones', value: '9+' }, { label: 'Lobes', value: '2' }, { label: 'Position', value: 'Sella turcica' }],
    facts: ['Anterior lobe (adenohypophysis): GH, TSH, ACTH, FSH, LH, prolactin', 'Posterior lobe (neurohypophysis): ADH (vasopressin) and oxytocin — released from hypothalamic neurons', 'Prolactinoma is the most common pituitary adenoma', 'Bitemporal hemianopia from optic chiasm compression is classic for pituitary macroadenoma'],
  },
  esophagus: {
    latin: 'Oesophagus',
    description: 'Muscular tube (~25 cm) conveying food from pharynx to stomach through the diaphragm. Has three anatomical and physiological narrowings.',
    stats: [{ label: 'Length', value: '25 cm' }, { label: 'Narrowings', value: '3' }, { label: 'Wall layers', value: '4' }, { label: 'Transit', value: '8–10 s' }],
    facts: ['Upper third: striated muscle; lower third: smooth muscle; middle: mixed', 'The lower oesophageal sphincter (LOS) prevents gastro-oesophageal reflux', 'Barrett\'s oesophagus (columnar metaplasia) predisposes to adenocarcinoma', 'The oesophagus has no serosal layer — facilitating direct tumour spread'],
  },
  trachea: {
    latin: 'Trachea',
    description: 'Fibrocartilaginous tube ~12 cm long, reinforced by 16–20 C-shaped hyaline cartilage rings. Conducts air between larynx and primary bronchi.',
    stats: [{ label: 'Length', value: '12 cm' }, { label: 'Diameter', value: '1.5–2 cm' }, { label: 'Rings', value: '16–20' }, { label: 'Bifurcation', value: 'T4/T5' }],
    facts: ['Bifurcates at the carina (T4/5 level, angle of Louis) into left and right main bronchi', 'Ciliated pseudostratified columnar epithelium and goblet cells form the mucociliary escalator', 'Tracheotomy performed between rings 2–4 in airway emergencies', 'Tracheal deviation is a clinical sign of tension pneumothorax or mediastinal masses'],
  },
};

// System display metadata
const SYSTEM_META: Record<string, { label: string; color: string; icon: string }> = {
  joints:   { label: 'Joints',         color: '#ff9a3c', icon: '🦴' },
  muscles:  { label: 'Muscular',       color: '#b5463d', icon: '💪' },
  nerves:   { label: 'Nervous',        color: '#a78bfa', icon: '🧠' },
  organs:   { label: 'Organs',         color: '#38bdf8', icon: '🫁' },
  skeleton: { label: 'Skeletal',       color: '#efe6d2', icon: '🦷' },
  skin:     { label: 'Integumentary',  color: '#e9b596', icon: '🫀' },
  vessels:  { label: 'Vascular',       color: '#c0392b', icon: '🩸' },
};

// Which organ systems to show by default (hide muscles for performance on first load)
const DEFAULT_LAYERS = {
  joints:   false,
  muscles:  false,
  nerves:   true,
  organs:   true,
  skeleton: true,
  skin:     false,
  vessels:  true,
};

type LayerKey = keyof typeof DEFAULT_LAYERS;

// ================================================================
//  Info panel
// ================================================================
function InfoPanel({
  structure,
  selected,
  onDeselect,
}: {
  structure: AnatomyStructure | null;
  selected: string | null;
  onDeselect: () => void;
}) {
  const clinical = selected ? CLINICAL_DATA[selected] ?? null : null;
  const sysMeta = structure ? SYSTEM_META[structure.system] ?? null : null;

  if (!structure) {
    return (
      <div className="hbe-info">
        <div className="hbe-info-empty">
          <div className="hbe-info-empty-icon">🩻</div>
          <p>Click any structure on the 3D body to explore its anatomy and clinical details.</p>
          <p style={{ fontSize: '0.68rem', color: '#1e3a4a', marginTop: 8 }}>
            147 individually named structures including organs, blood vessels, bones, muscles & nerves.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hbe-info">
      <div className="hbe-info-card">
        {sysMeta && (
          <div
            className="hbe-info-system-tag"
            style={{ background: sysMeta.color + '22', color: sysMeta.color, border: `1px solid ${sysMeta.color}44` }}
          >
            <span style={{ background: sysMeta.color, width: 8, height: 8, borderRadius: '50%', display: 'inline-block' }} />
            {sysMeta.icon} {sysMeta.label} System
          </div>
        )}

        <h2 className="hbe-info-name">{structure.label}</h2>
        <p className="hbe-info-latin">
          {clinical?.latin ?? structure.category}
        </p>

        {clinical ? (
          <>
            <div className="hbe-info-divider" />
            <p className="hbe-info-section-label">Overview</p>
            <p className="hbe-info-desc">{clinical.description}</p>

            <div className="hbe-info-stats">
              {clinical.stats.map((s) => (
                <div key={s.label} className="hbe-stat">
                  <span className="hbe-stat-value" style={{ color: sysMeta?.color ?? '#38bdf8' }}>
                    {s.value}
                  </span>
                  <div className="hbe-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="hbe-info-divider" />
            <p className="hbe-info-section-label">Key Clinical Facts</p>
            <ul className="hbe-info-facts">
              {clinical.facts.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </>
        ) : (
          <>
            <div className="hbe-info-divider" />
            <p className="hbe-info-desc" style={{ color: '#475569', fontSize: '0.76rem' }}>
              Category: <strong style={{ color: '#94a3b8' }}>{structure.category}</strong>
            </p>
            <p className="hbe-info-desc" style={{ color: '#475569', fontSize: '0.76rem' }}>
              System: <strong style={{ color: '#94a3b8' }}>{structure.system}</strong>
            </p>
          </>
        )}

        <button className="hbe-info-deselect" onClick={onDeselect}>
          ✕ Deselect
        </button>
      </div>
    </div>
  );
}

// ================================================================
//  HumanBodyExplorer
// ================================================================
export function HumanBodyExplorer() {
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<AnatomyStructure | null>(null);

  const handleStructureClick = useCallback((key: string, structure: AnatomyStructure) => {
    setSelectedKey((prev) => (prev === key ? null : key));
    setSelectedStructure((prev) => (prev?.key === key ? null : structure));
  }, []);

  const toggleLayer = (key: LayerKey) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const layerSystems = Object.keys(DEFAULT_LAYERS) as LayerKey[];

  return (
    <div className="hbe-page">
      {/* Top bar */}
      <div className="hbe-topbar">
        <div className="hbe-topbar-title">
          <h1>Interactive 3D Human Body Atlas</h1>
          <p>147 named structures · Click to explore · Drag to rotate · Scroll to zoom</p>
        </div>

        <div className="hbe-topbar-controls">
          <button
            className={`hbe-ctrl-btn ${sex === 'male' ? 'active' : ''}`}
            onClick={() => setSex('male')}
          >
            Male model
          </button>
          <button
            className={`hbe-ctrl-btn ${sex === 'female' ? 'active' : ''}`}
            onClick={() => setSex('female')}
          >
            Female model
          </button>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="hbe-main">
        {/* Left: layer toggles */}
        <div className="hbe-sidebar">
          <div className="hbe-sidebar-label">Body Systems</div>
          {layerSystems.map((sys) => {
            const meta = SYSTEM_META[sys];
            if (!meta) return null;
            return (
              <button
                key={sys}
                className={`hbe-sys-btn ${layers[sys] ? 'active' : ''}`}
                style={layers[sys] ? { borderColor: meta.color + '66', color: meta.color } : {}}
                onClick={() => toggleLayer(sys)}
              >
                <span
                  className="hbe-sys-dot"
                  style={{ background: layers[sys] ? meta.color : '#1e293b' }}
                />
                {meta.icon} {meta.label}
              </button>
            );
          })}

          <div className="hbe-sidebar-sep" />

          {selectedKey && (
            <button
              className="hbe-sys-btn"
              onClick={() => { setSelectedKey(null); setSelectedStructure(null); }}
              style={{ color: '#ef4444', fontSize: '0.7rem' }}
            >
              ✕ Clear selection
            </button>
          )}
        </div>

        {/* Centre: real 3D viewer */}
        <div className="hbe-viewer-wrap">
          <AnatomyViewer
            sex={sex}
            layers={layers}
            highlightedKeys={selectedKey ? [selectedKey] : []}
            onStructureClick={handleStructureClick}
            showSexToggle={false}
            showLayerToggles={false}
            showRotateControl={true}
            showZoomControls={true}
            hoverColor="#38bdf8"
            highlightColor="#f59e0b"
            className="hbe-viewer-inner"
            style={{ width: '100%', height: '100%', background: '#060d18' }}
          />
        </div>

        {/* Right: info panel */}
        <InfoPanel
          structure={selectedStructure}
          selected={selectedKey}
          onDeselect={() => { setSelectedKey(null); setSelectedStructure(null); }}
        />
      </div>

      {/* Attribution required by CC BY 4.0 */}
      <div className="hbe-attribution">
        Anatomy: BodyParts3D © The Database Center for Life Science (CC BY 4.0); female organs: Human Reference Atlas, HuBMAP (CC BY 4.0);
        female body: MakeHuman (CC0). Adapted by open-anatomy-3d (MIT). Educational use only — not a clinical diagnostic tool.
      </div>
    </div>
  );
}
