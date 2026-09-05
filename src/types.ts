export type TabType = "tu-vi" | "natal-chart" | "tarot" | "kinh-dich" | "history" | "plant-diary";

export interface AstrologicalProfile {
  fullName?: string;
  birthDate?: string;
  birthHour?: string;
  calendarType?: "solar" | "lunar";
  gender?: "Nam" | "Nữ" | "Khác";
  birthPlace?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  notes?: string;
  tuViImageUrl?: string; // Ảnh Lá Số Tử Vi cá nhân
  natalChartImageUrl?: string; // Ảnh Bản Đồ Sao cá nhân
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  role?: "admin" | "user";
  createdAt?: string;
  lastLogin?: string;
  astroProfile?: AstrologicalProfile;
}

export interface AstroChartItem {
  id: string;
  userId: string;
  type: "tu-vi" | "natal-chart";
  title: string;
  fullName?: string;
  birthDate?: string;
  birthHour?: string;
  calendarType?: "solar" | "lunar";
  gender?: string;
  birthPlace?: string;
  chartImageUrl?: string;
  notes?: string;
  updatedAt: number;
}

export interface UserMusicCloudRecord {
  id: string;
  userId: string;
  title: string;
  artist?: string;
  duration?: number;
  fileSize?: string;
  mimeType?: string;
  driveFileId?: string;
  driveUrl?: string;
  createdAt?: number;
}

export interface TuViAspect {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  palaces: string[];
  suggestions: string[];
}

export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  arcana: "major" | "minor";
  suit?: "wands" | "cups" | "swords" | "pentacles";
  number: number;
  keywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  symbolism: string;
  element?: string;
  quote?: string;
  colorGradient: string;
}

export interface DrawnCard extends TarotCard {
  isReversed: boolean;
  positionName: string;
}

export interface TarotSpread {
  id: string;
  name: string;
  cardCount: number;
  description: string;
  positions: string[];
}

export interface Hexagram {
  id: number;
  number: number;
  name: string;
  chineseName: string;
  binary: string; // 6 bits e.g. "111111" for Qian (Heaven) bottom to top
  upperTrigram: string;
  lowerTrigram: string;
  upperTrigramSymbol: string;
  lowerTrigramSymbol: string;
  meaning: string;
  judgment: string; // Thoán từ
  image: string; // Tượng từ
  quote: {
    text: string;
    author: string;
    context: string;
  };
}

export interface HistoryItem {
  id: string;
  type: "tu-vi" | "natal-chart" | "tarot" | "kinh-dich";
  title: string;
  aspectOrSpread?: string;
  question: string;
  timestamp: number;
  resultMarkdown: string;
  summary?: string;
  meta?: {
    cards?: { name: string; isReversed: boolean; position: string }[];
    hexagram?: {
      name: string;
      number: number;
      quote?: { text: string; author: string };
      relatingName?: string;
      relatingNumber?: number;
      changingLines?: number[];
    };
    aspect?: string;
    hasImage?: boolean;
    imageUrl?: string;
  };
}

export interface DailyLunarInfo {
  solarDate: string;
  lunarDateStr: string;
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  canChiDay: string;
  canChiMonth: string;
  canChiYear: string;
  element: string;
  zodiacDay: string;
  luckyHours: string[];
  unluckyHours: string[];
  suitableActivities: string[];
  unsuitableActivities: string[];
}

export type PlantTreeType = "sakura" | "ginkgo" | "bodhi" | "wisteria";

export interface PlantTreeOption {
  id: PlantTreeType;
  name: string;
  nameEn: string;
  title: string;
  element: string;
  meaning: string;
  description: string;
  imageUrl: string;
  googlePhotoUrl?: string;
  googlePhotoCredit?: string;
  accentGradient: string;
  accentColor: string;
  borderColor: string;
  tagColor: string;
  manifestSuggestions: string[];
  sorrowSuggestions: string[];
}

export interface PlantDiaryEntry {
  id: string;
  type: "water" | "weed"; // "water": tưới cây bằng manifest, "weed": nhặt cỏ trút bỏ phiền muộn
  treeId: PlantTreeType;
  treeName: string;
  content: string;
  timestamp: number;
  dateStr: string;
  expGained: number;
  wisdomMessage?: string;
}

export interface UserPlantGardenState {
  selectedTreeId: PlantTreeType;
  level: number; // 1 to 5
  exp: number; // current level progress (e.g. 0-100)
  totalExp: number;
  waterCount: number;
  weedCount: number;
  plantedAt: number;
  lastTendedAt: number;
  entries: PlantDiaryEntry[];
}
