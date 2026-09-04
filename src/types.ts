export type TabType = "tu-vi" | "natal-chart" | "tarot" | "kinh-dich" | "history";

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
