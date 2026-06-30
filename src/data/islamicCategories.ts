import type { Category } from "../types";

// Sourced from rn0x/IslamicQuizAPI (dorar.net). Questions are fetched per-cell
// from the backend (source: "islamic"); apiCategoryId = mainCategory id (1-6).
export const ISLAMIC_CATEGORIES: Category[] = [
  {
    id: "islamic_tafseer", name: "التفسير", emoji: "📖",
    source: "islamic", apiCategoryId: 1,
    grad: "linear-gradient(135deg,#1f6b4a,#0d3a26)",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Koran.JPG?width=900",
  },
  {
    id: "islamic_akida", name: "العقيدة", emoji: "🕋",
    source: "islamic", apiCategoryId: 2,
    grad: "linear-gradient(135deg,#1a5a6b,#0d2f3a)",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Kaaba_mirror_edit_jj.jpg?width=900",
  },
  {
    id: "islamic_hadith", name: "الحديث", emoji: "📜",
    source: "islamic", apiCategoryId: 3,
    grad: "linear-gradient(135deg,#6b5a1a,#3a2f0d)",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Al-Masjid_an-Nabawi.jpg?width=900",
  },
  {
    id: "islamic_figh", name: "الفقه", emoji: "⚖️",
    source: "islamic", apiCategoryId: 4,
    grad: "linear-gradient(135deg,#4a1f6b,#260d3a)",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Sultan_Ahmed_Mosque_Istanbul_Turkey_retouched.jpg?width=900",
  },
  {
    id: "islamic_history", name: "التاريخ", emoji: "🏛️",
    source: "islamic", apiCategoryId: 5,
    grad: "linear-gradient(135deg,#6b3a1a,#3a1f0d)",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Dome_of_the_Rock_Temple_Mount.jpg?width=900",
  },
  {
    id: "islamic_arabia", name: "اللغة العربية", emoji: "✍️",
    source: "islamic", apiCategoryId: 6,
    grad: "linear-gradient(135deg,#1f4a6b,#0d263a)",
    imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Maghribi_script.jpg?width=900",
  },
];
