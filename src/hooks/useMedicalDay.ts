/**
 * useMedicalDay — returns today's WHO / international health awareness day
 * Sourced from curated WHO & international calendar benchmarks.
 * Uses medical icon categories instead of emojis.
 */
import { useMemo } from 'react';

export type MedicalDayIcon =
  | 'stetho'
  | 'heart'
  | 'lungs'
  | 'brain'
  | 'ribbon'
  | 'droplet'
  | 'shield'
  | 'bone'
  | 'eye'
  | 'cross'
  | 'dna';

export interface MedicalDay {
  date: string;        // "MM-DD"
  name: string;
  theme?: string;      // Current year theme, if known
  description: string;
  color: string;       // Accent colour for the UI
  iconType: MedicalDayIcon;
  link?: string;       // Official WHO / org URL
  org?: string;        // e.g. "WHO", "IDF", "UN"
}

/** Comprehensive list of international health awareness days (MM-DD) */
const HEALTH_DAYS: MedicalDay[] = [
  { date: '01-05', name: 'World Braille Day', description: 'Raises awareness of the importance of Braille as a means of communication for blind and partially sighted people.', color: '#6366f1', iconType: 'eye', link: 'https://www.un.org/en/observances/braille-day', org: 'UN' },
  { date: '01-10', name: 'World Anti-Human Trafficking Day', description: 'Raises awareness of the health impacts of human trafficking and the right to health.', color: '#dc2626', iconType: 'shield', org: 'UN' },
  { date: '01-26', name: 'World Leprosy Day', description: 'A day to increase awareness about leprosy (Hansen\'s disease) and fight discrimination against those affected.', color: '#d97706', iconType: 'cross', link: 'https://www.who.int/news-room/events/detail/2024/01/28/default-calendar/world-leprosy-day', org: 'WHO' },
  { date: '02-04', name: 'World Cancer Day', description: 'The single initiative under which the entire world unites together in the fight against the global cancer epidemic.', color: '#7c3aed', iconType: 'ribbon', link: 'https://www.worldcancerday.org', org: 'UICC' },
  { date: '02-11', name: 'World Day of the Sick', description: 'A special time to pray for those who are ill and to remind health-care workers of the need to care with compassion.', color: '#0ea5e9', iconType: 'stetho', org: 'WHO' },
  { date: '02-15', name: 'International Childhood Cancer Day', description: 'A global collaborative campaign to raise awareness about childhood cancer and to express support for children with cancer.', color: '#f59e0b', iconType: 'ribbon', link: 'https://www.icccpo.org', org: 'ICCCPO' },
  { date: '02-28', name: 'Rare Disease Day', description: 'Raises awareness among the general public and decision-makers about rare diseases and their impact on patients\' lives.', color: '#ec4899', iconType: 'dna', link: 'https://www.rarediseaseday.org', org: 'EURORDIS' },
  { date: '03-01', name: 'Zero Discrimination Day', description: 'Promotes diversity and helps people learn how everyone can take action to prevent discrimination.', color: '#10b981', iconType: 'shield', link: 'https://www.unaids.org/en/zero-discrimination-day', org: 'UNAIDS' },
  { date: '03-04', name: 'World Obesity Day', description: 'Provides information and practical solutions to end the global obesity crisis.', color: '#f97316', iconType: 'heart', link: 'https://www.worldobesityday.org', org: 'WOF' },
  { date: '03-08', name: "International Women's Day (Women's Health Focus)", description: 'Addresses global disparities in women\'s healthcare access, maternal health, and gender-based violence.', color: '#ec4899', iconType: 'cross', org: 'UN' },
  { date: '03-20', name: 'World Oral Health Day', description: 'Unites dental professionals and the general public around a common message promoting good oral health.', color: '#38bdf8', iconType: 'shield', link: 'https://www.worldoralhealthday.org', org: 'FDI' },
  { date: '03-21', name: 'World Down Syndrome Day', description: 'A globally recognized day for raising awareness about Down syndrome and advocating for the rights of people with the condition.', color: '#a3e635', iconType: 'dna', link: 'https://www.worlddownsyndromeday.org', org: 'WDSD' },
  { date: '03-24', name: 'World Tuberculosis Day', description: 'Raises public awareness about the devastating health, social and economic consequences of tuberculosis (TB).', color: '#dc2626', iconType: 'lungs', link: 'https://www.who.int/campaigns/world-tb-day', org: 'WHO' },
  { date: '04-02', name: 'World Autism Awareness Day', description: 'Highlights the need to help improve the quality of life of those with autism so they can lead full and meaningful lives.', color: '#6366f1', iconType: 'brain', link: 'https://www.un.org/en/observances/autism-day', org: 'UN' },
  { date: '04-07', name: 'World Health Day', theme: 'My health, my right', description: 'WHO\'s founding anniversary — a chance to focus world attention on a specific health topic of concern.', color: '#0d9488', iconType: 'stetho', link: 'https://www.who.int/campaigns/world-health-day', org: 'WHO' },
  { date: '04-11', name: 'World Parkinson\'s Day', description: 'An international effort to raise awareness about Parkinson\'s disease and to get people talking.', color: '#a855f7', iconType: 'brain', link: 'https://www.worldparkinsonsday.com', org: 'WPD' },
  { date: '04-17', name: 'World Haemophilia Day', description: 'Raises awareness of haemophilia and other bleeding disorders, and advocates for access to care.', color: '#ef4444', iconType: 'droplet', link: 'https://www.wfh.org', org: 'WFH' },
  { date: '04-25', name: 'World Malaria Day', description: 'Recognizes the global effort to provide effective control of malaria worldwide.', color: '#f59e0b', iconType: 'shield', link: 'https://www.who.int/campaigns/world-malaria-day', org: 'WHO' },
  { date: '05-01', name: 'World Asthma Day', description: 'Raises global awareness about asthma and improves asthma care worldwide.', color: '#38bdf8', iconType: 'lungs', link: 'https://ginasthma.org', org: 'GINA' },
  { date: '05-05', name: 'World Hand Hygiene Day', description: 'WHO\'s flagship initiative to prevent the spread of infections through proper hand hygiene.', color: '#10b981', iconType: 'shield', link: 'https://www.who.int/campaigns/world-hand-hygiene-day', org: 'WHO' },
  { date: '05-07', name: 'World Ovarian Cancer Day', description: 'Unites patients, advocates, and medical communities to advance care and research for ovarian cancer.', color: '#a3e635', iconType: 'ribbon', org: 'WOCD' },
  { date: '05-08', name: 'World Thalassaemia Day', description: 'Raises awareness about thalassemia and encourages patients and their families.', color: '#f43f5e', iconType: 'droplet', org: 'TIF' },
  { date: '05-10', name: 'World Lupus Day', description: 'Calls for improved patient services, better epidemiological data, further research, and education for lupus patients.', color: '#c084fc', iconType: 'dna', link: 'https://www.worldlupusday.org', org: 'WLF' },
  { date: '05-15', name: 'International Clinical Trials Day', description: 'Commemorates the day James Lind started what is considered the first clinical trial on board HMS Salisbury.', color: '#0284c7', iconType: 'stetho', org: 'WHO' },
  { date: '05-16', name: 'International Autoimmune Arthritis Day', description: 'Raises awareness about all forms of autoimmune arthritis including Rheumatoid, Juvenile, Psoriatic and other types.', color: '#fb923c', iconType: 'bone', org: 'IAAD' },
  { date: '05-17', name: 'World Hypertension Day', description: 'Raises awareness about hypertension and encourages people to prevent and control the condition.', color: '#ef4444', iconType: 'heart', link: 'https://www.worldhypertensionleague.org', org: 'WHL' },
  { date: '05-21', name: 'World Anti-Microbial Awareness Week', description: 'Increases awareness of global antimicrobial resistance and encourages best practices among the general public.', color: '#dc2626', iconType: 'shield', org: 'WHO' },
  { date: '05-28', name: "World Menstrual Hygiene Day", description: 'An annual UN-backed day to raise awareness about the challenges girls and women face because of their periods.', color: '#f43f5e', iconType: 'droplet', org: 'UN' },
  { date: '05-31', name: 'World No Tobacco Day', description: 'Informs the public on the dangers of using tobacco and encourages governments to implement tobacco control policies.', color: '#65a30d', iconType: 'lungs', link: 'https://www.who.int/campaigns/world-no-tobacco-day', org: 'WHO' },
  { date: '06-05', name: 'World Environment Day (Environmental Health)', description: 'Encourages awareness and action for the protection of the environment and planetary health.', color: '#16a34a', iconType: 'shield', org: 'UN' },
  { date: '06-14', name: 'World Blood Donor Day', description: 'Thanks voluntary, unpaid blood donors for their life-saving gifts of blood and raises awareness of the need for regular donation.', color: '#dc2626', iconType: 'droplet', link: 'https://www.who.int/campaigns/world-blood-donor-day', org: 'WHO' },
  { date: '06-21', name: 'World Hydrotherapy Day', description: 'Raises awareness about the therapeutic benefits of hydrotherapy for various medical conditions.', color: '#38bdf8', iconType: 'cross', org: 'IAHU' },
  { date: '06-26', name: 'International Day Against Drug Abuse', description: 'Strengthens action and cooperation to achieve the goal of a world free of drug abuse.', color: '#7c3aed', iconType: 'shield', org: 'UN' },
  { date: '07-11', name: 'World Population Day', description: 'Focuses attention on the urgency and importance of population issues including public health challenges.', color: '#0ea5e9', iconType: 'stetho', org: 'UN' },
  { date: '07-28', name: 'World Hepatitis Day', description: 'Brings the world together to raise awareness of the global burden of viral hepatitis and to call for action.', color: '#f59e0b', iconType: 'heart', link: 'https://www.who.int/campaigns/world-hepatitis-day', org: 'WHO' },
  { date: '07-30', name: 'World Day Against Trafficking in Persons', description: 'Raises awareness of the health effects of human trafficking, including exploitation and mental trauma.', color: '#6b7280', iconType: 'shield', org: 'UN' },
  { date: '08-01', name: 'World Breastfeeding Week', description: 'Celebrates breastfeeding and its benefits for infants and mothers globally, advocating for supportive environments.', color: '#f97316', iconType: 'heart', link: 'https://www.worldbreastfeedingweek.org', org: 'WHO/UNICEF' },
  { date: '08-12', name: 'World Sickle Cell Day', description: 'Creates public awareness about sickle cell disease and the challenges faced by patients, their families and caregivers.', color: '#7c3aed', iconType: 'droplet', org: 'WSO' },
  { date: '09-10', name: 'World Suicide Prevention Day', description: 'Provides commitment and action to prevent suicides through awareness, education, and evidence-based intervention.', color: '#6366f1', iconType: 'brain', link: 'https://www.iasp.info/wspd', org: 'IASP' },
  { date: '09-14', name: 'World Sepsis Day', description: 'Advances awareness and treatments for sepsis, the most common cause of death in hospitals worldwide.', color: '#dc2626', iconType: 'stetho', link: 'https://www.world-sepsis-day.org', org: 'GSA' },
  { date: '09-21', name: "World Alzheimer's Day", description: 'Raises awareness and challenges the stigma that surrounds dementia and other forms of Alzheimer\'s disease.', color: '#a855f7', iconType: 'brain', link: 'https://www.alzint.org/what-we-do/world-alzheimers-month', org: 'ADI' },
  { date: '09-26', name: 'World Contraception Day', description: 'An annual worldwide campaign to raise awareness about contraception and the importance of family planning.', color: '#10b981', iconType: 'cross', org: 'WCD' },
  { date: '09-28', name: 'World Rabies Day', description: 'Promotes information, prevention, and elimination efforts for rabies, the world\'s deadliest infectious disease.', color: '#d97706', iconType: 'shield', link: 'https://www.worldrabiesday.org', org: 'GARC' },
  { date: '09-29', name: 'World Heart Day', description: 'Tells people around the world that CVD, including heart disease and stroke, is the world\'s leading cause of death.', color: '#ef4444', iconType: 'heart', link: 'https://www.world-heart-federation.org/world-heart-day', org: 'WHF' },
  { date: '10-01', name: 'World Vegetarian Day', description: 'Promotes the joy, compassion and life-enhancing possibilities of vegetarianism and its benefits for health.', color: '#16a34a', iconType: 'shield', org: 'NAVS' },
  { date: '10-04', name: 'World Animal Day', description: 'Raises the status of animals to improve welfare standards around the world and addresses zoonotic diseases.', color: '#78716c', iconType: 'shield', org: 'WAD' },
  { date: '10-10', name: 'World Mental Health Day', theme: 'Mental Health is a Universal Human Right', description: 'Raises awareness of mental health issues around the world and mobilises efforts in support of mental health.', color: '#6366f1', iconType: 'brain', link: 'https://www.who.int/campaigns/world-mental-health-day', org: 'WHO/WFMH' },
  { date: '10-12', name: 'World Arthritis Day', description: 'Raises awareness of musculoskeletal conditions and their impact on individuals and healthcare systems worldwide.', color: '#f59e0b', iconType: 'bone', org: 'EULAR' },
  { date: '10-13', name: 'International Day for Disaster Risk Reduction', description: 'Promotes global culture of risk awareness and disaster reduction including public health emergency preparedness.', color: '#0ea5e9', iconType: 'shield', org: 'UN' },
  { date: '10-14', name: 'World Standards Day (Medical Devices)', description: 'Raises awareness of the importance of standardization for the global health economy including medical devices.', color: '#64748b', iconType: 'stetho', org: 'ISO' },
  { date: '10-15', name: 'Global Handwashing Day', description: 'Dedicated to raising awareness of handwashing with soap as an easy, effective, and affordable way to prevent diseases.', color: '#38bdf8', iconType: 'shield', org: 'GWPP' },
  { date: '10-16', name: 'World Food Day', description: 'Promotes global awareness and action for those who suffer from hunger and food insecurity and their link to chronic disease.', color: '#f97316', iconType: 'heart', org: 'FAO' },
  { date: '10-17', name: 'International Day for the Eradication of Poverty', description: 'Recognizes poverty\'s direct impact on access to healthcare and overall health outcomes.', color: '#d97706', iconType: 'cross', org: 'UN' },
  { date: '10-20', name: 'World Osteoporosis Day', description: 'Launches a year-long campaign dedicated to raising global awareness of the prevention, diagnosis and treatment of osteoporosis.', color: '#a3e635', iconType: 'bone', link: 'https://www.worldosteoporosisday.org', org: 'IOF' },
  { date: '10-29', name: 'World Stroke Day', description: 'Underlines the serious nature and high rates of stroke and calls for action around prevention and better treatment.', color: '#dc2626', iconType: 'brain', link: 'https://www.world-stroke.org', org: 'WSO' },
  { date: '11-01', name: 'World Vegan Day', description: 'Celebrates veganism and raises awareness about its health benefits and impact on disease prevention.', color: '#16a34a', iconType: 'heart', org: 'VegSoc' },
  { date: '11-02', name: 'All Souls\' Day (Palliative Care)', description: 'A time for reflection on palliative care, end-of-life ethics, and compassionate patient-centred medicine.', color: '#6b7280', iconType: 'stetho', org: 'Clinical Tradition' },
  { date: '11-14', name: 'World Diabetes Day', theme: 'Breaking Barriers, Bridging Gaps', description: 'Created in 1991 by IDF and WHO in response to escalating health threats posed by diabetes.', color: '#0ea5e9', iconType: 'droplet', link: 'https://www.worlddiabetesday.org', org: 'IDF/WHO' },
  { date: '11-16', name: 'World COPD Day', theme: 'Breathing is Life – Act Earlier', description: 'Raises awareness about chronic obstructive pulmonary disease (COPD) and improves care for people with the condition.', color: '#38bdf8', iconType: 'lungs', link: 'https://goldcopd.org/world-copd-day', org: 'GOLD' },
  { date: '11-17', name: 'World Prematurity Day', description: 'Raises awareness of preterm birth and the concerns of babies born too soon.', color: '#a855f7', iconType: 'heart', link: 'https://www.efcni.org/activities/campaigns/world-prematurity-day', org: 'EFCNI' },
  { date: '11-19', name: 'World Toilet Day', description: 'Raises awareness about the global sanitation crisis and its critical link to public health outcomes.', color: '#78716c', iconType: 'shield', org: 'UN' },
  { date: '11-20', name: "Universal Children's Day", description: 'Commemorates children\'s health rights, wellbeing, and protection from disease and malnutrition worldwide.', color: '#f59e0b', iconType: 'heart', org: 'UNICEF' },
  { date: '11-25', name: 'International Day for the Elimination of Violence Against Women', description: 'Raises awareness of violence against women, its health impacts and the need for gender-based violence services.', color: '#f43f5e', iconType: 'shield', org: 'UN' },
  { date: '12-01', name: 'World AIDS Day', theme: 'Let Communities Lead', description: 'An opportunity for people worldwide to unite in the fight against HIV, to show support for people living with HIV.', color: '#dc2626', iconType: 'ribbon', link: 'https://www.who.int/campaigns/world-aids-day', org: 'WHO/UNAIDS' },
  { date: '12-03', name: 'International Day of Persons with Disabilities', description: 'Promotes the rights and well-being of persons with disabilities and raises awareness of their healthcare challenges.', color: '#6366f1', iconType: 'stetho', org: 'UN' },
  { date: '12-10', name: 'Human Rights Day', description: 'Celebrates the Universal Declaration of Human Rights, including the fundamental right to the highest attainable standard of health.', color: '#0d9488', iconType: 'cross', org: 'UN' },
];

/**
 * Returns today's medical awareness day (if any), null otherwise.
 */
export function useMedicalDay(): { today: MedicalDay | null; upcoming: MedicalDay[] } {
  return useMemo(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayKey = `${mm}-${dd}`;

    const today = HEALTH_DAYS.find((d) => d.date === todayKey) ?? null;

    const upcoming = HEALTH_DAYS.filter((d) => {
      const [m, dy] = d.date.split('-').map(Number);
      const event = new Date(now.getFullYear(), m - 1, dy);
      if (event < now) event.setFullYear(now.getFullYear() + 1);
      const diff = (event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 30;
    }).slice(0, 3);

    return { today, upcoming };
  }, []);
}
