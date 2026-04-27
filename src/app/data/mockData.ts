// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'farmer' | 'agronomist';
export type CareLevel = 'low' | 'medium' | 'high';
export type FieldStatus = 'active' | 'harvested' | 'fallow' | 'preparing';
export type TaskType = 'watering' | 'fertilizing' | 'pesticide' | 'harvesting' | 'plowing' | 'pruning' | 'other';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RecommendationType = 'fertilizer' | 'pesticide' | 'irrigation' | 'harvest' | 'disease' | 'general';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  phone: string;
  location: string;
  joinDate: string;
  active: boolean;
  assignedAgronomist?: string;
  assignedFarmers?: string[];
}

export interface CropType {
  id: string;
  name: string;
  nameEn: string;
  avgYieldPerAcre: number;
  avgPricePerKg: number;
  avgCostPerAcre: number;
  season: string;
  waterNeeds: 'low' | 'medium' | 'high';
  growthDays: number;
  description: string;
  icon: string;
  color: string;
}

export interface Field {
  id: string;
  farmerId: string;
  name: string;
  acres: number;
  cropTypeId: string;
  careLevel: CareLevel;
  plantingDate: string;
  expectedHarvestDate: string;
  status: FieldStatus;
  healthScore: number;
  location: string;
  notes: string;
  irrigationType: string;
  soilType: string;
  lastInspection?: string;
  agronomistNotes?: string;
  imageUrl?: string;
}

export interface Task {
  id: string;
  fieldId: string;
  farmerId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  type: TaskType;
  priority: 'low' | 'medium' | 'high';
  estimatedCost?: number;
}

export interface Recommendation {
  id: string;
  agronomistId: string;
  farmerId: string;
  fieldId?: string;
  title: string;
  content: string;
  date: string;
  status: 'pending' | 'read' | 'applied' | 'dismissed';
  priority: RecommendationPriority;
  type: RecommendationType;
}

export interface WeatherData {
  date: string;
  temp: number;
  humidity: number;
  condition: string;
  icon: string;
  rainfall: number;
  windSpeed: number;
}

export interface SystemNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

// ─── Crop Types ───────────────────────────────────────────────────────────────

export const cropTypes: CropType[] = [
  { id: 'wheat',     name: 'Σιτάρι',        nameEn: 'Wheat',      avgYieldPerAcre: 280,  avgPricePerKg: 0.28, avgCostPerAcre: 45,  season: 'Χειμωνιάτικο', waterNeeds: 'medium', growthDays: 200, description: 'Κλασική χειμωνιάτικη καλλιέργεια για δημητριακά',       icon: '🌾', color: '#d4a017' },
  { id: 'corn',      name: 'Καλαμπόκι',     nameEn: 'Corn',       avgYieldPerAcre: 900,  avgPricePerKg: 0.18, avgCostPerAcre: 85,  season: 'Καλοκαιρινό',  waterNeeds: 'high',   growthDays: 120, description: 'Υψηλής απόδοσης καλοκαιρινή καλλιέργεια',               icon: '🌽', color: '#f4a261' },
  { id: 'cotton',    name: 'Βαμβάκι',       nameEn: 'Cotton',     avgYieldPerAcre: 320,  avgPricePerKg: 0.65, avgCostPerAcre: 120, season: 'Καλοκαιρινό',  waterNeeds: 'high',   growthDays: 150, description: 'Σημαντική βιομηχανική καλλιέργεια της Ελλάδας',          icon: '☁️', color: '#e0e0e0' },
  { id: 'olives',    name: 'Ελιά',          nameEn: 'Olives',     avgYieldPerAcre: 400,  avgPricePerKg: 0.55, avgCostPerAcre: 70,  season: 'Φθινόπωρο',    waterNeeds: 'low',    growthDays: 365, description: 'Παραδοσιακή ελληνική καλλιέργεια με μακρά ζωή',          icon: '🫒', color: '#6b8e23' },
  { id: 'grapes',    name: 'Αμπέλι',        nameEn: 'Grapes',     avgYieldPerAcre: 500,  avgPricePerKg: 0.45, avgCostPerAcre: 95,  season: 'Καλοκαιρινό',  waterNeeds: 'medium', growthDays: 180, description: 'Καλλιέργεια για επιτραπέζιες σταφυλές ή οινοποιία',     icon: '🍇', color: '#7b2d8b' },
  { id: 'sunflower', name: 'Ηλίανθος',      nameEn: 'Sunflower',  avgYieldPerAcre: 230,  avgPricePerKg: 0.35, avgCostPerAcre: 55,  season: 'Καλοκαιρινό',  waterNeeds: 'low',    growthDays: 100, description: 'Ανθεκτική καλλιέργεια για ελαιόσπορο',                   icon: '🌻', color: '#f9c74f' },
  { id: 'barley',    name: 'Κριθάρι',       nameEn: 'Barley',     avgYieldPerAcre: 250,  avgPricePerKg: 0.22, avgCostPerAcre: 38,  season: 'Χειμωνιάτικο', waterNeeds: 'low',    growthDays: 180, description: 'Ανθεκτικό χειμωνιάτικο δημητριακό',                     icon: '🌱', color: '#a8b576' },
  { id: 'tomatoes',  name: 'Τομάτα',        nameEn: 'Tomatoes',   avgYieldPerAcre: 3500, avgPricePerKg: 0.12, avgCostPerAcre: 180, season: 'Καλοκαιρινό',  waterNeeds: 'high',   growthDays: 90,  description: 'Υψηλής παραγωγής βιομηχανική τομάτα',                   icon: '🍅', color: '#e63946' },
  { id: 'potatoes',  name: 'Πατάτα',        nameEn: 'Potatoes',   avgYieldPerAcre: 2800, avgPricePerKg: 0.20, avgCostPerAcre: 160, season: 'Άνοιξη',       waterNeeds: 'medium', growthDays: 90,  description: 'Δημοφιλής καλλιέργεια με υψηλή απόδοση',                icon: '🥔', color: '#c9a96e' },
  { id: 'sugar_beet',name: 'Ζαχαρότευτλο', nameEn: 'Sugar Beet', avgYieldPerAcre: 5500, avgPricePerKg: 0.04, avgCostPerAcre: 130, season: 'Χειμωνιάτικο', waterNeeds: 'medium', growthDays: 180, description: 'Βιομηχανική καλλιέργεια για παραγωγή ζάχαρης',           icon: '🌰', color: '#8b4513' },
];

// ─── Users ────────────────────────────────────────────────────────────────────

export const users: User[] = [
  { id: 'admin1',  name: 'Νίκος Παπαδόπουλος',      email: 'admin@agrotical.gr',   password: 'admin123',  role: 'admin',      phone: '6971234567', location: 'Αθήνα',        joinDate: '2023-01-15', active: true },
  { id: 'farmer1', name: 'Γιώργης Κωστόπουλος',     email: 'farmer1@agrotical.gr', password: 'farmer123', role: 'farmer',     phone: '6981234567', location: 'Λάρισα',       joinDate: '2023-03-10', active: true,  assignedAgronomist: 'agro1' },
  { id: 'farmer2', name: 'Μαρία Αλεξίου',           email: 'farmer2@agrotical.gr', password: 'farmer123', role: 'farmer',     phone: '6991234567', location: 'Θεσσαλονίκη', joinDate: '2023-04-20', active: true,  assignedAgronomist: 'agro1' },
  { id: 'farmer3', name: 'Θανάσης Νικολάου',        email: 'farmer3@agrotical.gr', password: 'farmer123', role: 'farmer',     phone: '6951234567', location: 'Κρήτη',        joinDate: '2023-05-05', active: true,  assignedAgronomist: 'agro2' },
  { id: 'farmer4', name: 'Ελένη Δημητρίου',         email: 'farmer4@agrotical.gr', password: 'farmer123', role: 'farmer',     phone: '6961234567', location: 'Πάτρα',        joinDate: '2023-06-12', active: false, assignedAgronomist: 'agro2' },
  { id: 'agro1',   name: 'Δρ. Αντώνης Λυκούργος',  email: 'agro1@agrotical.gr',   password: 'agro123',   role: 'agronomist', phone: '6971112233', location: 'Λάρισα',       joinDate: '2023-02-01', active: true,  assignedFarmers: ['farmer1', 'farmer2'] },
  { id: 'agro2',   name: 'Σοφία Παπακωνσταντίνου', email: 'agro2@agrotical.gr',   password: 'agro123',   role: 'agronomist', phone: '6972223344', location: 'Ηράκλειο',     joinDate: '2023-02-15', active: true,  assignedFarmers: ['farmer3', 'farmer4'] },
];

// ─── Fields ───────────────────────────────────────────────────────────────────

export const fields: Field[] = [
  { id: 'field1', farmerId: 'farmer1', name: 'Χωράφι 1',    acres: 15, cropTypeId: 'wheat',    careLevel: 'high',   plantingDate: '2025-11-10', expectedHarvestDate: '2026-06-15', status: 'active',    healthScore: 87, location: 'Λάρισα, Περιοχή Α',        notes: 'Αρδεύεται κάθε 10 μέρες. Έγινε λίπανση τον Φεβρουάριο.', irrigationType: 'Σταγόνα',       soilType: 'Αμμοπηλώδες',  lastInspection: '2026-03-10', imageUrl: 'https://images.unsplash.com/photo-1627842822558-c1f15aef9838?w=600' },
  { id: 'field2', farmerId: 'farmer1', name: 'Χωράφι 2',    acres: 8,  cropTypeId: 'corn',     careLevel: 'medium', plantingDate: '2026-04-15', expectedHarvestDate: '2026-09-10', status: 'preparing', healthScore: 72, location: 'Λάρισα, Περιοχή Β',        notes: 'Προετοιμασία εδάφους σε εξέλιξη.',                       irrigationType: 'Τεχνητή βροχή', soilType: 'Πηλώδες',       lastInspection: '2026-03-05', imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600' },
  { id: 'field3', farmerId: 'farmer1', name: 'Ελαιώνας 1',  acres: 12, cropTypeId: 'olives',   careLevel: 'low',    plantingDate: '2025-03-20', expectedHarvestDate: '2025-11-20', status: 'harvested', healthScore: 91, location: 'Λάρισα, Περιοχή Γ',        notes: 'Παλαιός ελαιώνας ~40 ετών. Εξαιρετική ποιότητα.',        irrigationType: 'Σταγόνα',       soilType: 'Ασβεστολιθικό', lastInspection: '2026-02-20', imageUrl: 'https://images.unsplash.com/photo-1722228097356-bd0202d99367?w=600' },
  { id: 'field4', farmerId: 'farmer1', name: 'Αμπελώνας 1', acres: 5,  cropTypeId: 'grapes',   careLevel: 'high',   plantingDate: '2025-04-01', expectedHarvestDate: '2025-09-15', status: 'harvested', healthScore: 78, location: 'Λάρισα, Περιοχή Δ',        notes: 'Ποικιλία Ξινόμαυρο για τοπικό κρασί.',                   irrigationType: 'Σταγόνα',       soilType: 'Πηλοαμμώδες',   lastInspection: '2026-01-15', imageUrl: 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=600' },
  { id: 'field5', farmerId: 'farmer2', name: 'Χωράφι 3',    acres: 20, cropTypeId: 'cotton',   careLevel: 'high',   plantingDate: '2026-04-20', expectedHarvestDate: '2026-10-05', status: 'preparing', healthScore: 85, location: 'Θεσσαλονίκη, Τοποθεσία Α', notes: 'Ετοιμασία για νέα σεζόν βαμβακιού.',                      irrigationType: 'Τεχνητή βροχή', soilType: 'Αργιλώδες',     lastInspection: '2026-03-01' },
  { id: 'field6', farmerId: 'farmer2', name: 'Χωράφι 4',    acres: 6,  cropTypeId: 'tomatoes', careLevel: 'high',   plantingDate: '2026-05-01', expectedHarvestDate: '2026-08-30', status: 'active',    healthScore: 93, location: 'Θεσσαλονίκη, Τοποθεσία Β', notes: 'Βιομηχανική τομάτα. Σύμβαση με μεταποιητική εταιρεία.',   irrigationType: 'Σταγόνα',       soilType: 'Αμμοπηλώδες',  lastInspection: '2026-03-12' },
  { id: 'field7', farmerId: 'farmer3', name: 'Ελαιώνας 2',  acres: 25, cropTypeId: 'olives',   careLevel: 'medium', plantingDate: '2025-03-15', expectedHarvestDate: '2025-12-01', status: 'active',    healthScore: 88, location: 'Κρήτη, Τοποθεσία Α',       notes: 'Ποικιλία Κορωνέικη. Εξαγωγή σε λάδι premium ποιότητας.', irrigationType: 'Σταγόνα',       soilType: 'Ασβεστολιθικό', lastInspection: '2026-03-08' },
  { id: 'field8', farmerId: 'farmer3', name: 'Χωράφι 5',    acres: 18, cropTypeId: 'wheat',    careLevel: 'medium', plantingDate: '2025-11-25', expectedHarvestDate: '2026-06-20', status: 'active',    healthScore: 75, location: 'Κρήτη, Τοποθεσία Β',       notes: 'Χειμωνιάτικο σιτάρι σκληρό.',                            irrigationType: 'Βροχή',         soilType: 'Πηλοαμμώδες',   lastInspection: '2026-02-28' },
];

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasks: Task[] = [
  { id: 'task1', fieldId: 'field1', farmerId: 'farmer1', title: 'Άρδευση χωραφιού',       description: 'Ποτίστε το χωράφι Νταμάρι για 3 ώρες',                  dueDate: '2026-03-25', completed: false, type: 'watering',    priority: 'high',   estimatedCost: 15  },
  { id: 'task2', fieldId: 'field1', farmerId: 'farmer1', title: 'Λίπανση σιταριού',        description: 'Εφαρμογή αζωτούχων λιπασμάτων (100kg/στρ)',             dueDate: '2026-03-28', completed: false, type: 'fertilizing', priority: 'high',   estimatedCost: 180 },
  { id: 'task3', fieldId: 'field2', farmerId: 'farmer1', title: 'Προετοιμασία εδάφους',    description: 'Οργωμα και ισοπέδωση για καλαμπόκι',                    dueDate: '2026-04-01', completed: false, type: 'plowing',     priority: 'medium', estimatedCost: 120 },
  { id: 'task4', fieldId: 'field1', farmerId: 'farmer1', title: 'Εφαρμογή ζιζανιοκτόνου', description: 'Καταπολέμηση αγριάδας και άλλων ζιζανίων',               dueDate: '2026-04-05', completed: true,  type: 'pesticide',   priority: 'medium', estimatedCost: 75  },
  { id: 'task5', fieldId: 'field3', farmerId: 'farmer1', title: 'Κλάδεμα ελαιών',          description: 'Διαμορφωτικό κλάδεμα για καλύτερη παραγωγή',           dueDate: '2026-04-10', completed: false, type: 'pruning',     priority: 'low',    estimatedCost: 250 },
  { id: 'task6', fieldId: 'field5', farmerId: 'farmer2', title: 'Σπορά βαμβακιού',         description: 'Έναρξη σποράς βαμβακιού στο Ξηρολάκκι',                dueDate: '2026-04-20', completed: false, type: 'plowing',     priority: 'high',   estimatedCost: 350 },
  { id: 'task7', fieldId: 'field6', farmerId: 'farmer2', title: 'Εμβολιασμός τομάτας',     description: 'Εφαρμογή εντομοκτόνου για προστασία από έντομα',         dueDate: '2026-03-26', completed: false, type: 'pesticide',   priority: 'urgent' as any, estimatedCost: 95 },
];

// ─── Recommendations ──────────────────────────────────────────────────────────

export const recommendations: Recommendation[] = [
  { id: 'rec1', agronomistId: 'agro1', farmerId: 'farmer1', fieldId: 'field1', title: 'Επιπλέον αζωτούχα λίπανση',        content: 'Βάσει της ανάλυσης εδάφους που πραγματοποιήσαμε, συνιστώ επιπλέον εφαρμογή 50kg/στρ αζωτούχου λιπάσματος (26-0-0) στο σιτάρι του Νταμαριού. Η περίοδος εφαρμογής είναι τέλη Μαρτίου για βέλτιστα αποτελέσματα.', date: '2026-03-18', status: 'pending', priority: 'high',   type: 'fertilizer' },
  { id: 'rec2', agronomistId: 'agro1', farmerId: 'farmer1', fieldId: 'field2', title: 'Επιλογή υβριδίου καλαμποκιού',     content: 'Για τις συνθήκες του αγρού Κουτσούφλι, προτείνω χρήση υβριδίου Pioneer P9074 ή DKC6677, τα οποία έχουν αποδώσει καλά σε παρόμοια πηλώδη εδάφη της περιοχής.',                                              date: '2026-03-15', status: 'read',    priority: 'medium', type: 'general'    },
  { id: 'rec3', agronomistId: 'agro1', farmerId: 'farmer2', fieldId: 'field5', title: 'Προσοχή σε αφίδες βαμβακιού',      content: 'Έχουν αναφερθεί περιστατικά αφίδων σε παρακείμενα χωράφια. Προτείνω προληπτική εφαρμογή εντομοκτόνου (Imidacloprid ή Thiamethoxam) κατά τη σπορά.',                                                     date: '2026-03-20', status: 'pending', priority: 'urgent', type: 'pesticide'  },
  { id: 'rec4', agronomistId: 'agro1', farmerId: 'farmer2', fieldId: 'field6', title: 'Βελτιστοποίηση άρδευσης τομάτας', content: 'Το σύστημα σταγόνας λειτουργεί καλά, αλλά προτείνω αύξηση της συχνότητας σε καθημερινή άρδευση κατά τη φάση ανθοφορίας για καλύτερη καρπόδεση.',                                                   date: '2026-03-12', status: 'applied', priority: 'medium', type: 'irrigation' },
];

// ─── Weather (Mock) ───────────────────────────────────────────────────────────

export const weatherData: WeatherData[] = [
  { date: '2026-03-21', temp: 16, humidity: 65, condition: 'Αίθριος',      icon: '☀️',  rainfall: 0,  windSpeed: 12 },
  { date: '2026-03-22', temp: 18, humidity: 58, condition: 'Αίθριος',      icon: '☀️',  rainfall: 0,  windSpeed: 8  },
  { date: '2026-03-23', temp: 14, humidity: 75, condition: 'Συννεφιά',     icon: '⛅',  rainfall: 3,  windSpeed: 18 },
  { date: '2026-03-24', temp: 11, humidity: 88, condition: 'Βροχή',        icon: '🌧️', rainfall: 12, windSpeed: 22 },
  { date: '2026-03-25', temp: 13, humidity: 80, condition: 'Ελαφρά βροχή', icon: '🌦️', rainfall: 5,  windSpeed: 15 },
  { date: '2026-03-26', temp: 17, humidity: 62, condition: 'Αίθριος',      icon: '☀️',  rainfall: 0,  windSpeed: 10 },
  { date: '2026-03-27', temp: 19, humidity: 55, condition: 'Αίθριος',      icon: '☀️',  rainfall: 0,  windSpeed: 7  },
];

// ─── System Notifications ─────────────────────────────────────────────────────

export const systemNotifications: SystemNotification[] = [
  { id: 'notif1', title: 'Νέα σύσταση γεωπόνου',        message: 'Ο γεωπόνος σας έστειλε νέα σύσταση για το χωράφι Νταμάρι',               date: '2026-03-18', read: false, type: 'info'    },
  { id: 'notif2', title: 'Προειδοποίηση: Ξηρασία',       message: 'Αναμένεται περίοδος ξηρασίας 7 ημερών. Ενισχύστε την άρδευση.',          date: '2026-03-17', read: false, type: 'warning' },
  { id: 'notif3', title: 'Θυμηθείτε: Λίπανση σιταριού', message: 'Η λίπανση στο χωράφι Νταμάρι πλησιάζει στην προγραμματισμένη ημερομηνία', date: '2026-03-16', read: true,  type: 'info'    },
];

// ─── Financial Calculations ───────────────────────────────────────────────────

export const careLevelMultiplier: Record<CareLevel, number> = { low: 0.7, medium: 1.0, high: 1.3 };
export const careLevelCostMultiplier: Record<CareLevel, number> = { low: 0.65, medium: 1.0, high: 1.38 };
export const soilYieldMultiplier: Record<string, number> = { 'Πηλώδες': 1.15, 'Αμμοπηλώδες': 1.05, 'Πηλοαμμώδες': 1.00, 'Αργιλώδες': 0.90, 'Ασβεστολιθικό': 0.85 };
export const soilCostMultiplier: Record<string, number>  = { 'Πηλώδες': 1.00, 'Αμμοπηλώδες': 0.95, 'Πηλοαμμώδες': 1.00, 'Αργιλώδες': 1.10, 'Ασβεστολιθικό': 1.18 };
export const irrigationYieldMultiplier: Record<string, number> = { 'Σταγόνα': 1.15, 'Τεχνητή βροχή': 1.05, 'Βροχή': 0.85, 'Υπόγεια': 1.20, 'Χωρίς άρδευση': 0.65 };
export const irrigationCostMultiplier: Record<string, number>  = { 'Σταγόνα': 1.12, 'Τεχνητή βροχή': 1.07, 'Βροχή': 0.80, 'Υπόγεια': 1.20, 'Χωρίς άρδευση': 0.72 };

export function calculateFieldFinancials(field: Field) {
  const crop = cropTypes.find(c => c.id === field.cropTypeId)!;
  if (!crop) return { estimatedYield: 0, estimatedRevenue: 0, estimatedCosts: 0, estimatedProfit: 0, profitMargin: 0, yieldPerAcre: 0, revenuePerAcre: 0, soilFactor: 1, irrigationFactor: 1 };
  const careMult     = careLevelMultiplier[field.careLevel];
  const careCostMult = careLevelCostMultiplier[field.careLevel];
  const soilYield    = soilYieldMultiplier[field.soilType] ?? 1.0;
  const soilCost     = soilCostMultiplier[field.soilType] ?? 1.0;
  const irrigYield   = irrigationYieldMultiplier[field.irrigationType] ?? 0.85;
  const irrigCost    = irrigationCostMultiplier[field.irrigationType] ?? 0.80;
  const estimatedYield   = field.acres * crop.avgYieldPerAcre * careMult * soilYield * irrigYield;
  const estimatedRevenue = estimatedYield * crop.avgPricePerKg;
  const estimatedCosts   = field.acres * crop.avgCostPerAcre * careCostMult * soilCost * irrigCost;
  const estimatedProfit  = estimatedRevenue - estimatedCosts;
  const profitMargin     = estimatedRevenue > 0 ? (estimatedProfit / estimatedRevenue) * 100 : 0;
  return {
    estimatedYield: Math.round(estimatedYield), estimatedRevenue: Math.round(estimatedRevenue),
    estimatedCosts: Math.round(estimatedCosts), estimatedProfit: Math.round(estimatedProfit),
    profitMargin: Math.round(profitMargin), yieldPerAcre: Math.round(field.acres > 0 ? estimatedYield / field.acres : 0),
    revenuePerAcre: Math.round(field.acres > 0 ? estimatedRevenue / field.acres : 0),
    soilFactor: Math.round(soilYield * 100), irrigationFactor: Math.round(irrigYield * 100),
  };
}

export function getFieldsByFarmer(farmerId: string) { return fields.filter(f => f.farmerId === farmerId); }

export function getFarmerTotals(farmerId: string) {
  const farmerFields = getFieldsByFarmer(farmerId);
  let totalAcres = 0, totalRevenue = 0, totalCosts = 0, totalProfit = 0, totalYield = 0;
  farmerFields.forEach(field => {
    const fin = calculateFieldFinancials(field);
    totalAcres += field.acres; totalRevenue += fin.estimatedRevenue;
    totalCosts += fin.estimatedCosts; totalProfit += fin.estimatedProfit; totalYield += fin.estimatedYield;
  });
  return { totalAcres, totalRevenue, totalCosts, totalProfit, totalYield, fieldCount: farmerFields.length, avgProfitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0 };
}

export function getCropById(id: string) { return cropTypes.find(c => c.id === id); }
export function getUserById(id: string) { return users.find(u => u.id === id); }

export const monthlyProductionData = [
  { month: 'Ιαν',  παραγωγη: 0,     εσοδα: 0,     εξοδα: 2400 },
  { month: 'Φεβ',  παραγωγη: 0,     εσοδα: 0,     εξοδα: 3200 },
  { month: 'Μαρ',  παραγωγη: 0,     εσοδα: 0,     εξοδα: 4100 },
  { month: 'Απρ',  παραγωγη: 800,   εσοδα: 1200,  εξοδα: 5800 },
  { month: 'Μαι',  παραγωγη: 2400,  εσοδα: 3600,  εξοδα: 2100 },
  { month: 'Ιουν', παραγωγη: 8500,  εσοδα: 12500, εξοδα: 1800 },
  { month: 'Ιουλ', παραγωγη: 12000, εσοδα: 18000, εξοδα: 2200 },
  { month: 'Αυγ',  παραγωγη: 9500,  εσοδα: 14200, εξοδα: 1900 },
  { month: 'Σεπ',  παραγωγη: 6200,  εσοδα: 9300,  εξοδα: 1600 },
  { month: 'Οκτ',  παραγωγη: 4800,  εσοδα: 7200,  εξοδα: 2800 },
  { month: 'Νοε',  παραγωγη: 1200,  εσοδα: 1800,  εξοδα: 3100 },
  { month: 'Δεκ',  παραγωγη: 0,     εσοδα: 0,     εξοδα: 2600 },
];

export const cropDistributionData = [
  { name: 'Σιτάρι',    value: 33, color: '#d4a017' },
  { name: 'Καλαμπόκι', value: 20, color: '#f4a261' },
  { name: 'Ελιά',      value: 27, color: '#6b8e23' },
  { name: 'Αμπέλι',    value: 10, color: '#7b2d8b' },
  { name: 'Βαμβάκι',   value: 10, color: '#90be6d' },
];
