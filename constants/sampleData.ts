/**
 * بيانات العيّنة لتطبيق تألق — صالونات وخدمات وحلاقون ومدن.
 * الأسعار بالهللة (6000 = 60.00 ﷼). مأخوذة من دليل التصميم (docs/DESIGN.md §10).
 *
 * هذه البيانات تُغذّي وضع العرض (Demo) الذي يعمل دون خادم. عند ربط Supabase
 * تُستبدل بجداول salons / services / barbers.
 */
import type { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export interface SampleService {
  id: string;
  name: string;
  price: number; // هللة
  dur: number; // دقائق
}

export interface SampleBarber {
  id: string;
  name: string;
  title: string;
}

export type SalonAudience = "men" | "women" | "kids" | "family";

export interface SampleSalon {
  id: string;
  name: string;
  tagline: string;
  audience: SalonAudience;
  audienceLabel: string;
  city: string;
  rating: number;
  reviews: number;
  homeService: boolean;
  featured: boolean;
  accent: string; // لون الغلاف
  icon: IconName;
  services: SampleService[];
  barbers: SampleBarber[];
}

export const CITIES = [
  "الرياض",
  "جدة",
  "الدمام",
  "مكة",
  "المدينة",
  "الخبر",
  "أبها",
  "الطائف",
] as const;

export interface Category {
  id: SalonAudience | "home";
  label: string;
  icon: IconName;
}

export const CATEGORIES: Category[] = [
  { id: "men", label: "رجال", icon: "man-outline" },
  { id: "women", label: "نساء", icon: "woman-outline" },
  { id: "kids", label: "أطفال", icon: "happy-outline" },
  { id: "home", label: "خدمة منزلية", icon: "home-outline" },
];

/** قائمة الخدمات النموذجية (تُستخدم كخدمات افتراضية لغرفة الحبر) */
export const DEFAULT_SERVICES: SampleService[] = [
  { id: "svc-classic", name: "قصة كلاسيكية", price: 6000, dur: 30 },
  { id: "svc-fade", name: "فيد", price: 7500, dur: 40 },
  { id: "svc-beard", name: "تشذيب لحية", price: 4500, dur: 20 },
  { id: "svc-towel", name: "فوطة ساخنة", price: 5500, dur: 25 },
  { id: "svc-combo", name: "شعر + لحية", price: 9500, dur: 55 },
];

const menBarbers: SampleBarber[] = [
  { id: "b-1", name: "خالد الحربي", title: "حلاق أول" },
  { id: "b-2", name: "سامي القحطاني", title: "خبير فيد" },
  { id: "b-3", name: "ماجد العتيبي", title: "حلاق" },
];

const womenBarbers: SampleBarber[] = [
  { id: "b-4", name: "نورة الزهراني", title: "خبيرة تجميل" },
  { id: "b-5", name: "ريم الشمري", title: "مصففة شعر" },
];

const kidsBarbers: SampleBarber[] = [
  { id: "b-6", name: "عبدالله الدوسري", title: "حلاق أطفال" },
];

export const SALONS: SampleSalon[] = [
  {
    id: "salon-ink",
    name: "غرفة الحبر",
    tagline: "حلاقة رجالية عصرية بلمسة كلاسيكية",
    audience: "men",
    audienceLabel: "رجال",
    city: "الرياض",
    rating: 4.9,
    reviews: 328,
    homeService: false,
    featured: true,
    accent: "#1F222A",
    icon: "cut-outline",
    services: DEFAULT_SERVICES,
    barbers: menBarbers,
  },
  {
    id: "salon-gold-blade",
    name: "الشفرة الذهبية",
    tagline: "الأناقة تصلك أينما كنت",
    audience: "men",
    audienceLabel: "رجال · منزلي",
    city: "جدة",
    rating: 4.8,
    reviews: 214,
    homeService: true,
    featured: true,
    accent: "#8A6D18",
    icon: "cut-outline",
    services: [
      { id: "gb-1", name: "قصة كلاسيكية", price: 7000, dur: 35 },
      { id: "gb-2", name: "فيد احترافي", price: 8500, dur: 45 },
      { id: "gb-3", name: "شعر + لحية", price: 11000, dur: 60 },
      { id: "gb-4", name: "حلاقة منزلية VIP", price: 15000, dur: 70 },
    ],
    barbers: menBarbers,
  },
  {
    id: "salon-crown",
    name: "قصّات التاج",
    tagline: "صالون عائلي لكل الأذواق",
    audience: "family",
    audienceLabel: "عائلي",
    city: "الرياض",
    rating: 4.7,
    reviews: 156,
    homeService: false,
    featured: true,
    accent: "#2B2F3A",
    icon: "people-outline",
    services: [
      { id: "cr-1", name: "قصة رجالية", price: 6500, dur: 30 },
      { id: "cr-2", name: "قصة أطفال", price: 4000, dur: 20 },
      { id: "cr-3", name: "تصفيف نسائي", price: 12000, dur: 60 },
    ],
    barbers: [...menBarbers.slice(0, 2), ...womenBarbers.slice(0, 1)],
  },
  {
    id: "salon-scissors",
    name: "المقص الصغير",
    tagline: "متخصصون في قصّات الأطفال المرحة",
    audience: "kids",
    audienceLabel: "أطفال",
    city: "الدمام",
    rating: 4.9,
    reviews: 98,
    homeService: false,
    featured: false,
    accent: "#2360A6",
    icon: "happy-outline",
    services: [
      { id: "sc-1", name: "قصة أطفال", price: 4000, dur: 20 },
      { id: "sc-2", name: "أول قصة (تذكار)", price: 6000, dur: 30 },
    ],
    barbers: kidsBarbers,
  },
  {
    id: "salon-pearl",
    name: "دار اللؤلؤة",
    tagline: "تجميل وعناية نسائية فاخرة",
    audience: "women",
    audienceLabel: "نساء",
    city: "جدة",
    rating: 4.8,
    reviews: 271,
    homeService: false,
    featured: true,
    accent: "#565C6B",
    icon: "flower-outline",
    services: [
      { id: "pl-1", name: "قصّ وتصفيف", price: 13000, dur: 60 },
      { id: "pl-2", name: "صبغة شعر", price: 22000, dur: 90 },
      { id: "pl-3", name: "مكياج مناسبات", price: 30000, dur: 75 },
    ],
    barbers: womenBarbers,
  },
  {
    id: "salon-lumi",
    name: "ميزون لومي",
    tagline: "خدمة تجميل نسائية منزلية راقية",
    audience: "women",
    audienceLabel: "نساء · منزلي",
    city: "الرياض",
    rating: 4.6,
    reviews: 132,
    homeService: true,
    featured: false,
    accent: "#3C4150",
    icon: "sparkles-outline",
    services: [
      { id: "lm-1", name: "تصفيف منزلي", price: 16000, dur: 60 },
      { id: "lm-2", name: "مكياج منزلي", price: 28000, dur: 75 },
      { id: "lm-3", name: "عناية بالبشرة", price: 20000, dur: 50 },
    ],
    barbers: womenBarbers,
  },
];

export function getSalon(id: string): SampleSalon | undefined {
  return SALONS.find((s) => s.id === id);
}

/** أوقات المواعيد المتاحة (عيّنة) */
export const TIME_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:30",
  "17:00",
  "18:30",
  "20:00",
  "21:00",
];

export type PaymentMethodId = "mada" | "applepay" | "wallet";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  hint: string;
  icon: IconName;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "mada", label: "بطاقة مدى", hint: "الافتراضية", icon: "card-outline" },
  { id: "applepay", label: "Apple Pay", hint: "دفع سريع", icon: "logo-apple" },
  { id: "wallet", label: "محفظة تألق", hint: "من رصيدك", icon: "wallet-outline" },
];
