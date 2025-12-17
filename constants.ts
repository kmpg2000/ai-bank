
import { AIApp, AppCategory } from './types';

export const HERO_TAGLINE = "無料のAI アプリで生活を豊かにしませんか。";

export const MOCK_APPS: AIApp[] = [
  {
    id: 'kanji-1',
    name: '漢字吸い込み大作戦',
    description: '迫りくる漢字を掃除機で吸い込むアクションゲーム！楽しみながら漢字力が身につきます。',
    category: AppCategory.STUDY,
    imageUrl: 'https://picsum.photos/400/300?random=100',
    tags: ['漢字', 'ゲーム', '中学受験'],
    rating: 4.8,
    url: 'https://kanji-nu.vercel.app/'
  },
  {
    id: 'science-1',
    name: '理科・全集中の試練',
    description: '理科の重要用語を全集中で暗記！生物・化学・物理・地学を完全網羅した学習アプリ。',
    category: AppCategory.STUDY,
    imageUrl: 'https://picsum.photos/400/300?random=101',
    tags: ['理科', '暗記', '高校受験'],
    rating: 4.7,
    url: 'https://science-six-opal.vercel.app/'
  },
  // 医療カテゴリのアプリを追加
  {
    id: 'medical-ai-1',
    name: 'AI総合病院',
    description: 'オンラインで医療相談や一次診断をサポートするAI。症状のトリアージや受診の目安を提案します。',
    category: AppCategory.MEDICAL,
    imageUrl: 'https://picsum.photos/400/300?random=202',
    tags: ['医療', '診察', '健康相談'],
    rating: 4.6,
    url: 'https://ai-doctor-three-psi.vercel.app/'
  },
];