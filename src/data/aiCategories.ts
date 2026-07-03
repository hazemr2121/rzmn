import type { Category } from "../types";

// "Made by AI" (صنع بالذكاء الاصطناعي) — AI-written question banks, source: "ai".
// Works exactly like "local": questions are embedded here and never fetched from a
// server or external API.
//
// Authoring rules for this bank:
//  - Audience is Middle Eastern; questions lean on games/consoles popular in the
//    region (PUBG, FIFA/EA FC, PlayStation, Assassin's Creed…) and stay doable —
//    "hard" means a real challenge for casual players, not obscure trivia.
//  - Question text is fully Arabic — transliterate game titles into Arabic script
//    (أساسنز كريد، جود أوف وور…), no Latin script in questions or answers.
//  - Answers are NOT multiple choice, so every answer must be short and unambiguous
//    (one to three words).
//  - Media is attached per-question via metadata: `imageUrl`, `audioUrl`, `videoUrl`
//    on the Question object. Use direct, stable file URLs (e.g. Wikimedia Commons
//    Special:FilePath) so the board can pull and render them directly.
export const AI_CATEGORIES: Category[] = [
  /* ─────────────────────────────────────── VIDEO GAMES ── */
  {
    id: "ai_video_games", name: "ألعاب الفيديو", emoji: "🎮",
    source: "ai",
    grad: "linear-gradient(135deg,#3a1a5c,#160a2e)",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=60",
    questions: [
      /* ── سهل — 300 ── */
      { q: "مين الشركة اللي بتصنع جهاز البلايستيشن؟", a: "سوني", difficulty: "easy", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/PlayStation-SCPH-1000-with-Controller.jpg?width=800" },
      { q: "إيه اللعبة اللي بتبني فيها عالم كامل من مكعبات؟", a: "ماين كرافت", difficulty: "easy" },
      { q: "إيه لعبة الباتل رويال اللي لما تكسب فيها بتقولك 'عشاء اليوم دجاج بامتياز'؟", a: "ببجي", difficulty: "easy" },
      { q: "إيه لون قبعة وهدوم ماريو الشهيرة؟", a: "أحمر", difficulty: "easy" },
      { q: "إيه اسم القنفذ الأزرق السريع بتاع شركة سيجا؟", a: "سونيك", difficulty: "easy" },
      { q: "مين الشركة اللي بتصنع جهاز الإكس بوكس؟", a: "مايكروسوفت", difficulty: "easy", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Xbox-console.jpg?width=800" },
      { q: "إيه لعبة كرة القدم الشهيرة اللي كل سنة بتنزل نسخة جديدة وكل الشباب بتتلم عليها؟", a: "فيفا", difficulty: "easy" },
      { q: "إيه اسم الشخصية الصفرا اللي بتاكل النقط في المتاهة وبتهرب من الأشباح؟", a: "باك مان", difficulty: "easy" },
      { q: "إيه اللعبة اللي بترتب فيها القطع النازلة عشان تكمّل صفوف وتمسحها؟", a: "تتريس", difficulty: "easy" },
      { q: "إيه جهاز نينتندو المحمول القديم اللي كله كان بيلعب عليه تتريس؟", a: "جيم بوي", difficulty: "easy", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Game-Boy-FL.jpg?width=800" },

      /* ── متوسط — 600 ── */
      { q: "إيه اسم أخو ماريو صاحب اللبس الأخضر؟", a: "لويجي", difficulty: "medium" },
      { q: "مين الشركة اليابانية اللي عملت ماريو وزيلدا وبوكيمون؟", a: "نينتندو", difficulty: "medium" },
      { q: "في أي دولة عربية بتدور أحداث لعبة أساسنز كريد أوريجينز؟", a: "مصر", difficulty: "medium", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Kheops-Pyramid.jpg?width=800" },
      { q: "إيه اسم بطل سلسلة جود أوف وور اللي بيحارب الآلهة؟", a: "كريتوس", difficulty: "medium" },
      { q: "إيه اسم بطلة سلسلة تومب رايدر مكتشفة الآثار؟", a: "لارا كروفت", difficulty: "medium" },
      { q: "إيه أكتر لعبة فيديو مبيعاً في التاريخ؟", a: "ماين كرافت", difficulty: "medium" },
      { q: "إيه اسم المدينة الخيالية اللي بتدور فيها أحداث جراند ثفت أوتو 5؟", a: "لوس سانتوس", difficulty: "medium" },
      { q: "إيه اسم العملة اللي بتشتري بيها جوه لعبة فورتنايت؟", a: "في بوكس", difficulty: "medium" },
      { q: "مين الاستوديو المطوّر لسلسلة جراند ثفت أوتو (جي تي ايه)؟", a: "روكستار", difficulty: "medium" },
      { q: "كام لاعب في الفريق الواحد في لعبة فالورانت؟", a: "5 لاعيبة", difficulty: "medium" },

      /* ── صعب — 900 ── */
      { q: "في أي مدينة عربية بتدور أحداث لعبة أساسنز كريد ميراج؟", a: "بغداد", difficulty: "hard" },
      { q: "مين المصمم الياباني اللي ابتكر شخصية ماريو؟", a: "شيغيرو مياموتو", difficulty: "hard" },
      { q: "إيه أول لعبة فيديو تجارية ناجحة نزلت سنة 1972 وكانت شبه تنس الطاولة؟", a: "بونج", difficulty: "hard", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/TeleGames-Atari-Pong.png?width=800" },
      { q: "في أي سنة نزل أول جهاز بلايستيشن في اليابان؟", a: "1994", difficulty: "hard" },
      { q: "إيه اسم الفيروس اللي حوّل الناس لزومبي في أول أجزاء ريزيدنت إيفل؟", a: "فيروس تي", difficulty: "hard" },
      { q: "إيه اسم حصان جيرالت في سلسلة ذا ويتشر؟", a: "روتش", difficulty: "hard" },
      { q: "مين الاستوديو الياباني المطوّر للعبة إلدن رينج؟", a: "فروم سوفتوير", difficulty: "hard" },
      { q: "إيه اسم المدينة المستقبلية اللي بتدور فيها أحداث سايبر بانك 2077؟", a: "نايت سيتي", difficulty: "hard" },
    ]
  },
];
