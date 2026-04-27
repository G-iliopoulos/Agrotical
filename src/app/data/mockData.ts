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
  assignedAgronomist?: string; // farmer -> agronomist id
  assignedFarmers?: string[];  // agronomist -> farmer ids
}

export interface CropType {
  id: string;
  name: string;
  nameEn: string;
  avgYieldPerAcre: number; // kg per στρέμμα
  avgPricePerKg: number;   // € per kg
  avgCostPerAcre: number;  // € per στρέμμα
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
  healthScore: number; // 0-100
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
  {
    id: 'wheat',
    name: 'Σιτάρι',
    nameEn: 'Wheat',
    avgYieldPerAcre: 280,
    avgPricePerKg: 0.28,
    avgCostPerAcre: 45,
    season: 'Χειμωνιάτικο',
    waterNeeds: 'medium',
    growthDays: 200,
    description: 'Κλασική χειμωνιάτικη καλλιέργεια για δημητριακά',
    icon: '🌾',
    color: '#d4a017',
  },
  {
    id: 'corn',
    name: 'Καλαμπόκι',
    nameEn: 'Corn',
    avgYieldPerAcre: 900,
    avgPricePerKg: 0.18,
    avgCostPerAcre: 85,
    season: 'Καλοκαιρινό',
    waterNeeds: 'high',
    growthDays: 120,
    description: 'Υψηλής απόδοσης καλοκαιρινή καλλιέργεια',
    icon: '🌽',
    color: '#f4a261',
  },
  {
    id: 'cotton',
    name: 'Βαμβάκι',
    nameEn: 'Cotton',
    avgYieldPerAcre: 320,
    avgPricePerKg: 0.65,
    avgCostPerAcre: 120,
    season: 'Καλοκαιρινό',
    waterNeeds: 'high',
    growthDays: 150,
    description: 'Σημαντική βιομηχανική καλλιέργεια της Ελλάδας',
    icon: '☁️',
    color: '#e0e0e0',
  },
  {
    id: 'olives',
    name: 'Ελιά',
    nameEn: 'Olives',
    avgYieldPerAcre: 400,
    avgPricePerKg: 0.55,
    avgCostPerAcre: 70,
    season: 'Φθινόπωρο',
    waterNeeds: 'low',
    growthDays: 365,
    description: 'Παραδοσιακή ελληνική καλλιέργεια με μακρά ζωή',
    icon: '🫒',
    color: '#6b8e23',
  },
  {
    id: 'grapes',
    name: 'Αμπέλι',
    nameEn: 'Grapes',
    avgYieldPerAcre: 500,
    avgPricePerKg: 0.45,
    avgCostPerAcre: 95,
    season: 'Καλοκαιρινό',
    waterNeeds: 'medium',
    growthDays: 180,
    description: 'Καλλιέργεια για επιτραπέζιες σταφυλές ή οινοποιία',
    icon: '🍇',
    color: '#7b2d8b',
  },
  {
    id: 'sunflower',
    name: 'Ηλίανθος',
    nameEn: 'Sunflower',
    avgYieldPerAcre: 230,
    avgPricePerKg: 0.35,
    avgCostPerAcre: 55,
    season: 'Καλοκαιρινό',
    waterNeeds: 'low',
    growthDays: 100,
    description: 'Ανθεκτική καλλιέργεια για ελαιόσπορο',
    icon: '🌻',
    color: '#f9c74f',
  },
  {
    id: 'barley',
    name: 'Κριθάρι',
    nameEn: 'Barley',
    avgYieldPerAcre: 250,
    avgPricePerKg: 0.22,
    avgCostPerAcre: 38,
    season: 'Χειμωνιάτικο',
    waterNeeds: 'low',
    growthDays: 180,
    description: 'Ανθεκτικό χειμωνιάτικο δημητριακό',
    icon: '🌱',
    color: '#a8b576',
  },
  {
    id: 'tomatoes',
    name: 'Τομάτα',
    nameEn: 'Tomatoes',
    avgYieldPerAcre: 3500,
    avgPricePerKg: 0.12,
    avgCostPerAcre: 180,
    season: 'Καλοκαιρινό',
    waterNeeds: 'high',
    growthDays: 90,
    description: 'Υψηλής παραγωγής βιομηχανική τομάτα',
    icon: '🍅',
    color: '#e63946',
  },
  {
    id: 'potatoes',
    name: 'Πατάτα',
    nameEn: 'Potatoes',
    avgYieldPerAcre: 2800,
    avgPricePerKg: 0.20,
    avgCostPerAcre: 160,
    season: 'Άνοιξη',
    waterNeeds: 'medium',
    growthDays: 90,
    description: 'Δημοφιλής καλλιέργεια με υψηλή απόδοση',
    icon: '🥔',
    color: '#c9a96e',
  },
  {
    id: 'sugar_beet',
    name: 'Ζαχαρότευτλο',
    nameEn: 'Sugar Beet',
    avgYieldPerAcre: 5500,
    avgPricePerKg: 0.04,
    avgCostPerAcre: 130,
    season: 'Χειμωνιάτικο',
    waterNeeds: 'medium',
    growthDays: 180,
    description: 'Βιομηχανική καλλιέργεια για παραγωγή ζάχαρης',
    icon: '🌰',
    color: '#8b4513',
  },
];

export function getCropById(id: string) {
  return cropTypes.find(c => c.id === id);
}

// ─── TODO (επόμενο commit) ────────────────────────────────────────────────────
// Θα προστεθούν: users[], fields[], tasks[], recommendations[]
// καθώς και οι financial calculation functions
