
export enum AppCategory {
  ALL = 'すべて',
  ENTERTAINMENT = '娯楽',
  LAW = '法律',
  MEDICAL = '医学',
  SPORTS = 'スポーツ',
  STUDY = '中高受験',
  PRODUCTIVITY = '生産性',
  CREATIVE = 'クリエイティブ',
}

export interface AIApp {
  id: string;
  name: string;
  description: string;
  category: AppCategory;
  imageUrl: string;
  tags: string[];
  rating: number;
  url?: string;
}

export interface ConciergeResponse {
  recommendedAppId: string | null;
  message: string;
}

export interface NewsSource {
  title: string;
  uri: string;
}

export enum NewsCategory {
  ECONOMY = '経済',
  ENTERTAINMENT = 'エンタメ',
  SPORTS = 'スポーツ',
  INTERNATIONAL = '国際',
  SCIENCE = '科学',
}

export interface NewsItem {
  title: string;
  summary: string;
}

export interface NewsData {
  items: Record<NewsCategory, NewsItem[]>;
  sources: NewsSource[];
  timestamp: Date;
}

export interface WisdomData {
  japanese: string;
  romaji: string;
  english: string;
  theme: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
