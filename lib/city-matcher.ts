import { CITIES_LIST, MoroccanCity, CITY_ARABIC_NAMES } from "@/data/products";

// Top 6 most popular e-commerce cities in Morocco (~80% of orders)
export const TOP_CITIES: MoroccanCity[] = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Tanger",
  "Fès",
  "Agadir",
];

// Rich Moroccan Darija, slang, phonetic, Latin and Arabic alias mappings
export const CITY_ALIASES: Record<MoroccanCity, string[]> = {
  "Casablanca": [
    "casa", "casablanca", "kaza", "kza", "dar lbeida", "dar beida", "dar el beida",
    "dar al baida", "darbaida", "casablanka", "كازا", "الدار البيضاء", "دار البيضاء", "البيضاء", "بيضاء"
  ],
  "Rabat": ["rabat", "rbt", "ribat", "er-rabat", "الرباط", "رباط"],
  "Marrakech": ["marrakech", "marrakesh", "kech", "kch", "marakesh", "marakch", "مراكش", "كش"],
  "Tanger": ["tanger", "tangier", "tanja", "tanjaoua", "طنجة", "طنجه"],
  "Agadir": ["agadir", "gadil", "agadire", "أكادير", "اكادير"],
  "Fès": ["fes", "fez", "fas", "fass", "فاس"],
  "Meknès": ["meknes", "meknas", "miknas", "مكناس"],
  "Oujda": ["oujda", "wejda", "oujda48", "وجدة", "وجده"],
  "Kénitra": ["kenitra", "knitra", "port lyautey", "القنيطرة", "قنيطرة", "قنيطره"],
  "Tétouan": ["tetouan", "titwan", "titouan", "tetuan", "تطوان"],
  "Salé": ["sale", "sla", "slawe", "salé", "سلا"],
  "Temara": ["temara", "tmara", "تمارة", "تماره"],
  "Mohammedia": ["mohammedia", "mohamadia", "fedala", "المحمدية", "محمدية", "المحمديه"],
  "El Jadida": ["el jadida", "eljadida", "jadida", "mazagan", "الجديدة", "جديدة", "الجديده"],
  "Nador": ["nador", "ennador", "nadur", "الناظور", "ناظور"],
  "Beni Mellal": ["beni mellal", "bni mellal", "bni melal", "بني ملال"],
  "Safi": ["safi", "asfi", "آسفي", "اسفي"],
  "Khouribga": ["khouribga", "khoribga", "خريبكة", "خريبكه"],
  "Settat": ["settat", "stat", "سطات"],
  "Berrechid": ["berrechid", "barchid", "burchid", "برشيد"],
  "Taza": ["taza", "تازة", "تازه"],
  "Khemisset": ["khemisset", "lhemisset", "الخميسات", "خميسات"],
  "Larache": ["larache", "3rayech", "arache", "العرائش", "عرائش"],
  "Ksar El Kebir": ["ksar el kebir", "ksar lkbir", "lkbir", "القصر الكبير", "قصر كبير"],
  "Guelmim": ["guelmim", "goulimine", "كلميم"],
  "Berkane": ["berkane", "بركان"],
  "Taourirt": ["taourirt", "تاوريرت"],
  "Fkih Ben Salah": ["fkih ben salah", "fqih ben saleh", "الفقيه بن صالح", "فقيه بن صالح"],
  "Dakhla": ["dakhla", "eddakhla", "الداخلة", "داخله", "الداخله"],
  "Laâyoune": ["laayoune", "layoune", "el aaiun", "العيون", "عيون"],
  "Taroudant": ["taroudant", "taroudante", "تارودانت"],
  "Ouarzazate": ["ouarzazate", "warzzazat", "ورزازات"],
  "Essaouira": ["essaouira", "swira", "es-souira", "mogador", "الصويرة", "صويرة", "الصويره"],
  "Tiznit": ["tiznit", "تيزنيت"],
  "Errachidia": ["errachidia", "rachidia", "الرشيدية", "رشيديه"],
  "Al Hoceima": ["al hoceima", "hoceima", "lhocima", "الحسيمة", "حسيمة"],
  "Sidi Slimane": ["sidi slimane", "سيدي سليمان"],
  "Sidi Kacem": ["sidi kacem", "سيدي قاسم"],
  "Skhirat": ["skhirat", "الصخيرات", "صخيرات"],
  "Bouskoura": ["bouskoura", "بوسكورة", "بوسكوره"],
  "Dar Bouazza": ["dar bouazza", "dar bouaza", "دار بوعزة"],
  "Martil": ["martil", "مرتيل", "مارتيل"],
  "M'diq": ["m'diq", "mdiq", "mdeq", "المضيق", "مضيق"],
  "Fnideq": ["fnideq", "castillejos", "الفنيدق", "فنيدق"],
  "Oulad Teima": ["oulad teima", "ouled teima", "44", "أولاد تايمة", "اولاد تايمة"],
  "Youssoufia": ["youssoufia", "louissifia", "اليوسفية", "يوسفية"],
  "Tan-Tan": ["tan-tan", "tantan", "طانطان"],
  "Guercif": ["guercif", "جرسيف"],
  "Midelt": ["midelt", "ميدلت"],
  "Azrou": ["azrou", "أزرو", "ازرو"],
  "Ifrane": ["ifrane", "إفران", "افران"],
  "Tinghir": ["tinghir", "تنغير"],
  "Chefchaouen": ["chefchaouen", "chaouen", "chawn", "شفشاون", "الشاون", "شاون"],
  "Asilah": ["asilah", "arzila", "أصيلة", "اصيلة"],
  "Zagora": ["zagora", "زاكورة", "زاكوره"],
  "Tata": ["tata", "طاطا"],
  "Boujdour": ["boujdour", "بوجدور"],
  "Smara": ["smara", "السمارة", "سمارة"],
  "Sidi Bennour": ["sidi bennour", "سيدي بنور"],
  "Souk El Arbaa": ["souk el arbaa", "souk larba", "سوق الأربعاء", "سوق الاربعاء"],
  "Ben Guerir": ["ben guerir", "benguerir", "ابن جرير", "بن جرير"],
  "Kalaat Sraghna": ["kalaat sraghna", "qal3at sraghna", "قلعة السراغنة", "قلعة سراغنة"],
  "Autre ville": ["autre ville", "autre", "other", "مدينة أخرى", "اخرى", "أخرى"],
};

/**
 * Normalizes text by removing Latin accents, Arabic diacritics,
 * standardizing Arabic letters (أ/إ/آ -> ا, ة -> ه, etc.),
 * and removing whitespace and punctuation.
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  let s = text.trim().toLowerCase();

  // Remove Latin accents
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Remove Arabic diacritics (tashkeel)
  s = s.replace(/[\u064B-\u0652\u0670]/g, "");

  // Standardize Arabic letters
  s = s.replace(/[أإآٱ]/g, "ا");
  s = s.replace(/ة/g, "ه");
  s = s.replace(/ى/g, "ي");
  s = s.replace(/[ؤئ]/g, "ء");

  // Remove punctuation, dashes, apostrophes, and spaces
  s = s.replace(/['’\-_\s]/g, "");

  return s;
}

/**
 * Strips Arabic definite article 'ال' or Latin 'el'/'al' prefix
 */
function stripPrefix(s: string): string {
  if (s.startsWith("ال")) return s.slice(2);
  if (s.startsWith("el")) return s.slice(2);
  if (s.startsWith("al")) return s.slice(2);
  return s;
}

/**
 * Calculates Levenshtein edit distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculates character bigram Dice coefficient for typo tolerance
 */
function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length < 2 || b.length < 2) return 0.0;

  const bigramsA = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bigram = a.slice(i, i + 2);
    bigramsA.set(bigram, (bigramsA.get(bigram) || 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bigram = b.slice(i, i + 2);
    const count = bigramsA.get(bigram) || 0;
    if (count > 0) {
      bigramsA.set(bigram, count - 1);
      intersection++;
    }
  }

  const total = (a.length - 1) + (b.length - 1);
  return total > 0 ? (2 * intersection) / total : 0;
}

/**
 * Computes an accuracy score between a query and a target candidate (0.0 to 1.0)
 */
export function calculateMatchScore(query: string, target: string): number {
  const nq = normalizeText(query);
  const nt = normalizeText(target);

  if (!nq || !nt) return 0;
  if (nq === nt) return 1.0;

  const sq = stripPrefix(nq);
  const st = stripPrefix(nt);

  if (sq && st && sq === st) return 0.98;

  // Prefix match
  if (nt.startsWith(nq) || (st && sq && st.startsWith(sq))) {
    const ratio = nq.length / nt.length;
    return 0.85 + ratio * 0.13;
  }

  // Substring match
  if (nt.includes(nq) || (st && sq && st.includes(sq))) {
    const ratio = nq.length / nt.length;
    return 0.70 + ratio * 0.15;
  }

  // Levenshtein similarity
  const maxLen = Math.max(nq.length, nt.length);
  const dist = levenshteinDistance(nq, nt);
  const levSim = Math.max(0, 1 - dist / maxLen);

  // Bigram Dice similarity
  const dice = diceCoefficient(nq, nt);

  return Math.max(levSim, dice);
}

export interface CityMatchResult {
  city: MoroccanCity;
  arabicName: string;
  score: number;
  matchedAlias: string;
}

/**
 * High-accuracy matcher that finds the best Moroccan city for ANY input
 * Supports Darija, French, Arabic, Latin phonetics, typos, and abbreviations.
 */
export function findBestCityMatch(rawQuery: string): CityMatchResult | null {
  if (!rawQuery || rawQuery.trim().length === 0) return null;

  const query = rawQuery.trim();
  let bestMatch: CityMatchResult | null = null;
  let highestScore = 0;

  for (const city of CITIES_LIST) {
    if (city === "Autre ville") continue;

    const arName = CITY_ARABIC_NAMES[city] || "";
    const aliases = CITY_ALIASES[city] || [];

    // All strings to test against
    const candidates = [city, arName, ...aliases];

    for (const candidate of candidates) {
      if (!candidate) continue;
      const score = calculateMatchScore(query, candidate);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          city,
          arabicName: arName,
          score,
          matchedAlias: candidate,
        };
      }

      // Short-circuit on exact match
      if (score >= 0.99) {
        return bestMatch;
      }
    }
  }

  // If score meets minimal confidence threshold (0.42)
  if (bestMatch && highestScore >= 0.42) {
    return bestMatch;
  }

  return null;
}

/**
 * Filters city options for the real-time search dropdown as the user types
 */
export function searchCities(query: string, limit = 8): { city: MoroccanCity; arabicName: string }[] {
  if (!query || query.trim().length === 0) {
    return TOP_CITIES.map((c) => ({
      city: c,
      arabicName: CITY_ARABIC_NAMES[c] || "",
    }));
  }

  const results: { city: MoroccanCity; arabicName: string; score: number }[] = [];

  for (const city of CITIES_LIST) {
    if (city === "Autre ville") continue;
    const arName = CITY_ARABIC_NAMES[city] || "";
    const aliases = CITY_ALIASES[city] || [];
    const candidates = [city, arName, ...aliases];

    let maxScore = 0;
    for (const candidate of candidates) {
      const score = calculateMatchScore(query, candidate);
      if (score > maxScore) maxScore = score;
    }

    if (maxScore >= 0.40) {
      results.push({
        city,
        arabicName: arName,
        score: maxScore,
      });
    }
  }

  // Sort by highest matching score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit).map(({ city, arabicName }) => ({
    city,
    arabicName,
  }));
}
