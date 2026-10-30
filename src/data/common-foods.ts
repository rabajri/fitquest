/**
 * Built-in list of common foods, so most meals can be logged without typing numbers.
 * Values are typical estimates for one portion (home recipes and brands vary).
 * Calories roughly match protein × 4 + carbs × 4 + fat × 9.
 *
 * Names are shown in Arabic. The English name and `terms` are extra search words.
 */

export type FoodCategory =
  | 'Saudi & Arabic dishes'
  | 'Bread & breakfast'
  | 'Rice, pasta & sides'
  | 'Meat, fish & beans'
  | 'Dairy'
  | 'Dates & fruit'
  | 'Vegetables & salads'
  | 'Snacks & sweets'
  | 'Drinks'
  | 'Fast food';

export type CommonFood = {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  category: FoodCategory;
  terms?: string[];
};

type Row = [
  id: string,
  name: string,
  english: string,
  portion: string,
  calories: number,
  protein: number,
  fat: number,
  carbs: number,
  terms?: string[],
];

const GROUPS: Record<FoodCategory, Row[]> = {
  'Saudi & Arabic dishes': [
    ['kabsa-chicken', 'كبسة دجاج', 'Chicken kabsa', '1 plate (400 g)', 640, 35, 20, 78, ['kabsah', 'كبسة', 'كبسة دجاج']],
    ['kabsa-lamb', 'كبسة لحم', 'Lamb kabsa', '1 plate (400 g)', 760, 34, 32, 80, ['kabsah', 'كبسة لحم']],
    ['mandi-chicken', 'مندي دجاج', 'Chicken mandi', '1 plate (400 g)', 680, 38, 22, 80, ['مندي', 'مندي دجاج']],
    ['mandi-lamb', 'مندي لحم', 'Lamb mandi', '1 plate (400 g)', 800, 36, 36, 80, ['مندي لحم']],
    ['sayadiyah', 'صيادية (سمك ورز)', 'Sayadiyah (fish and rice)', '1 plate (350 g)', 560, 30, 16, 72, ['صيادية', 'سمك']],
    ['jareesh', 'جريش', 'Jareesh', '1 bowl (250 g)', 300, 12, 9, 42, ['jarish', 'جريش']],
    ['saleeg', 'سليق', 'Saleeg', '1 plate (300 g)', 450, 20, 16, 56, ['saleek', 'سليق']],
    ['harees', 'هريس', 'Harees', '1 bowl (250 g)', 330, 18, 10, 42, ['hareis', 'هريس']],
    ['margoog', 'مرقوق', 'Margoog', '1 bowl (300 g)', 380, 20, 10, 52, ['marqooq', 'مرقوق']],
    ['masoub', 'معصوب', 'Masoub', '1 bowl (300 g)', 600, 10, 22, 92, ['معصوب']],
    ['mutabbaq', 'مطبق لحم', 'Mutabbaq (meat)', '1 piece (150 g)', 420, 15, 24, 36, ['mutabbak', 'مطبق']],
    ['bamia', 'بامية باللحم', 'Okra stew with meat (bamia)', '1 bowl (250 g)', 280, 18, 15, 18, ['bamya', 'بامية']],
    ['molokhia', 'ملوخية بالدجاج', 'Molokhia with chicken', '1 bowl (300 g)', 250, 22, 12, 12, ['mulukhiyah', 'ملوخية']],
    ['warak-enab', 'ورق عنب', 'Stuffed vine leaves (warak enab)', '5 pieces (100 g)', 180, 3, 9, 22, ['dolma', 'ورق عنب']],
    ['shakshuka', 'شكشوكة', 'Shakshuka', '1 serving (2 eggs)', 250, 14, 17, 10, ['شكشوكة']],
    ['foul', 'فول مدمس', 'Foul medames', '1 bowl (200 g)', 300, 14, 12, 34, ['ful', 'fool', 'فول']],
    ['hummus', 'حمص', 'Hummus', '3 tbsp (50 g)', 88, 4, 5, 7, ['حمص']],
    ['mutabal', 'متبل (بابا غنوج)', 'Mutabal (baba ghanoush)', '3 tbsp (50 g)', 72, 1.5, 5.5, 4, ['متبل']],
    ['falafel', 'فلافل', 'Falafel', '1 piece', 58, 2.3, 3, 5.4, ['taameya', 'فلافل']],
    ['lentil-soup', 'شوربة عدس', 'Lentil soup', '1 bowl (250 ml)', 180, 10, 4, 26, ['shorba', 'شوربة عدس']],
    ['oat-soup', 'شوربة شوفان', 'Oat soup (shorbat shofan)', '1 bowl (250 ml)', 170, 9, 6, 20, ['شوربة شوفان']],
    ['tawook', 'شيش طاووق', 'Shish tawook', '1 skewer (120 g)', 200, 30, 8, 2, ['شيش طاووق']],
    ['kofta', 'كفتة كباب', 'Kofta kebab', '1 skewer (100 g)', 250, 18, 18, 3, ['kebab', 'كفتة', 'كباب']],
    ['shawarma-chicken', 'ساندويتش شاورما دجاج', 'Chicken shawarma sandwich', '1 wrap', 520, 28, 22, 52, ['شاورما دجاج']],
    ['shawarma-beef', 'ساندويتش شاورما لحم', 'Meat shawarma sandwich', '1 wrap', 550, 27, 26, 52, ['beef', 'lamb', 'شاورما لحم']],
    ['samboosa-meat', 'سمبوسة لحم', 'Samboosa (meat)', '1 piece', 130, 4.5, 8, 10, ['sambousek', 'سمبوسة']],
    ['samboosa-cheese', 'سمبوسة جبن', 'Samboosa (cheese)', '1 piece', 125, 4, 8, 9.5, ['سمبوسة جبن']],
    ['grilled-fish', 'سمك مشوي (هامور)', 'Grilled fish (hammour)', '1 fillet (150 g)', 176, 36, 3.5, 0, ['hamour', 'هامور', 'سمك']],
    ['luqaimat', 'لقيمات', 'Luqaimat', '5 pieces', 300, 3.5, 13, 42, ['لقيمات']],
    ['kunafa', 'كنافة', 'Kunafa', '1 piece (100 g)', 380, 7, 20, 44, ['knafeh', 'كنافة']],
    ['basbousa', 'بسبوسة', 'Basbousa', '1 piece (60 g)', 230, 3, 9, 34, ['بسبوسة']],
    ['maamoul', 'معمول تمر', 'Maamoul (date)', '1 piece', 150, 2, 6, 22, ['معمول']],
  ],
  'Bread & breakfast': [
    ['khubz', 'خبز عربي', 'Arabic bread', '1 loaf (60 g)', 160, 5.5, 0.7, 33, ['pita', 'khubz', 'خبز']],
    ['tamees', 'خبز تميس', 'Tamees bread', '1 piece (100 g)', 280, 9, 3, 55, ['tamis', 'تميس']],
    ['toast-white', 'توست أبيض', 'White toast', '1 slice', 75, 2.5, 1, 14, ['bread', 'توست']],
    ['toast-brown', 'توست بر', 'Brown toast', '1 slice', 70, 3.5, 1, 12, ['whole wheat', 'توست بر']],
    ['croissant', 'كرواسون', 'Croissant', '1 (60 g)', 245, 5, 13, 27, ['كرواسون']],
    ['manakish-zaatar', 'مناقيش زعتر', "Za'atar manakish", '1 piece', 376, 8, 16, 50, ['zaatar', 'مناقيش زعتر', 'فطيرة']],
    ['manakish-cheese', 'مناقيش جبن', 'Cheese manakish', '1 piece', 444, 16, 20, 50, ['مناقيش جبن', 'فطيرة جبن']],
    ['egg-boiled', 'بيض مسلوق', 'Boiled egg', '1 large', 78, 6.3, 5.3, 0.6, ['بيض مسلوق']],
    ['egg-fried', 'بيض مقلي', 'Fried egg', '1 large', 90, 6.3, 7, 0.4, ['بيض مقلي']],
    ['omelette', 'أومليت', 'Omelette', '2 eggs', 190, 13, 15, 1, ['omelet', 'عجة', 'أومليت']],
    ['oats-milk', 'شوفان بالحليب', 'Oats with milk', '1 bowl (40 g oats)', 276, 13, 8, 38, ['oatmeal', 'porridge', 'شوفان']],
    ['pancakes', 'بان كيك', 'Pancakes', '2 medium', 348, 8, 12, 52, ['بان كيك']],
    ['labneh', 'لبنة', 'Labneh', '2 tbsp (30 g)', 56, 2.5, 4.5, 1.5, ['لبنة']],
    ['white-cheese', 'جبن أبيض', 'White cheese', '30 g', 82, 5, 6.5, 1, ['feta', 'akkawi', 'جبن أبيض']],
    ['halloumi', 'حلوم', 'Halloumi', '2 slices (50 g)', 160, 11, 12.5, 1, ['حلوم']],
    ['cheese-triangle', 'جبن مثلثات', 'Cheese triangle', '1 piece', 45, 2, 3.7, 1, ['processed cheese', 'جبن مثلثات']],
    ['honey', 'عسل', 'Honey', '1 tbsp', 64, 0, 0, 17, ['عسل']],
    ['olives', 'زيتون', 'Olives', '10 olives', 61, 0.4, 6, 1.5, ['زيتون']],
  ],
  'Rice, pasta & sides': [
    ['rice-white', 'رز أبيض (مطبوخ)', 'White rice (cooked)', '1 cup (160 g)', 200, 4.3, 0.4, 45, ['basmati', 'رز', 'أرز']],
    ['rice-brown', 'رز بني (مطبوخ)', 'Brown rice (cooked)', '1 cup (195 g)', 215, 5, 1.8, 45, ['رز بني']],
    ['pasta', 'معكرونة (مطبوخة)', 'Pasta (cooked)', '1 cup (140 g)', 220, 8, 1.3, 43, ['spaghetti', 'macaroni', 'معكرونة']],
    ['bulgur', 'برغل (مطبوخ)', 'Bulgur (cooked)', '1 cup (180 g)', 150, 5.6, 0.4, 34, ['burghul', 'برغل']],
    ['potato-boiled', 'بطاطس مسلوقة', 'Boiled potato', '1 medium', 150, 4, 0.2, 34, ['بطاطس مسلوقة']],
    ['fries', 'بطاطس مقلية', 'French fries', '1 medium portion', 361, 4, 17, 48, ['chips', 'بطاطس مقلية']],
  ],
  'Meat, fish & beans': [
    ['chicken-breast', 'صدر دجاج مشوي', 'Grilled chicken breast', '100 g', 165, 31, 3.6, 0, ['صدر دجاج']],
    ['chicken-thigh', 'فخذ دجاج مشوي', 'Grilled chicken thigh', '100 g', 205, 26, 11, 0, ['فخذ دجاج']],
    ['chicken-quarter', 'ربع دجاج مشوي (بالجلد)', 'Roast chicken quarter (with skin)', '1 quarter', 323, 38, 19, 0, ['ربع دجاج']],
    ['lamb', 'لحم غنم (مطبوخ)', 'Lamb (cooked)', '100 g', 289, 25, 21, 0, ['mutton', 'لحم غنم']],
    ['beef-steak', 'ستيك لحم بقر (مطبوخ)', 'Beef steak (cooked)', '100 g', 240, 26, 15, 0, ['ستيك', 'لحم بقر']],
    ['beef-mince', 'لحم مفروم (مطبوخ)', 'Minced beef (cooked)', '100 g', 257, 26, 17, 0, ['ground beef', 'لحم مفروم']],
    ['tuna-water', 'تونة بالماء (مصفاة)', 'Tuna in water (drained)', '1 can (120 g)', 125, 29, 1, 0, ['تونة']],
    ['tuna-oil', 'تونة بالزيت (مصفاة)', 'Tuna in oil (drained)', '1 can (120 g)', 228, 30, 12, 0, ['تونة بالزيت']],
    ['salmon', 'سلمون (مطبوخ)', 'Salmon (cooked)', '100 g', 205, 22, 12, 0, ['سلمون']],
    ['shrimp', 'روبيان (مطبوخ)', 'Shrimp (cooked)', '100 g', 99, 24, 0.3, 0.2, ['prawns', 'روبيان', 'جمبري']],
    ['lentils', 'عدس (مطبوخ)', 'Lentils (cooked)', '1 cup (200 g)', 230, 18, 0.8, 40, ['عدس']],
    ['chickpeas', 'حمص حب (مطبوخ)', 'Chickpeas (cooked)', '1 cup (165 g)', 270, 14.5, 4.2, 45, ['حمص حب']],
  ],
  Dairy: [
    ['laban', 'لبن (كامل الدسم)', 'Laban (full fat)', '1 cup (240 ml)', 130, 8, 6.5, 10, ['buttermilk', 'لبن']],
    ['laban-light', 'لبن (قليل الدسم)', 'Laban (low fat)', '1 cup (240 ml)', 99, 8, 3, 10, ['لبن قليل الدسم']],
    ['milk-full', 'حليب (كامل الدسم)', 'Milk (full fat)', '1 cup (240 ml)', 150, 8, 8, 12, ['حليب']],
    ['milk-light', 'حليب (قليل الدسم)', 'Milk (low fat)', '1 cup (240 ml)', 102, 8, 2.5, 12, ['حليب قليل الدسم']],
    ['yogurt', 'زبادي (كامل الدسم)', 'Plain yogurt (full fat)', '1 pot (170 g)', 105, 6, 5.5, 8, ['zabadi', 'زبادي']],
    ['greek-yogurt', 'زبادي يوناني (قليل الدسم)', 'Greek yogurt (low fat)', '1 pot (170 g)', 119, 17, 3, 6, ['زبادي يوناني']],
    ['cheddar', 'جبن شيدر', 'Cheddar cheese', '1 slice (20 g)', 80, 5, 6.6, 0.3, ['شيدر']],
  ],
  'Dates & fruit': [
    ['dates', 'تمر', 'Dates', '3 dates (30 g)', 90, 0.7, 0.1, 22, ['tamr', 'sukkari', 'تمر']],
    ['date-medjool', 'تمر مجدول', 'Medjool date', '1 date', 66, 0.4, 0, 18, ['مجدول']],
    ['banana', 'موز', 'Banana', '1 medium', 105, 1.3, 0.4, 27, ['موز']],
    ['apple', 'تفاح', 'Apple', '1 medium', 95, 0.5, 0.3, 25, ['تفاح']],
    ['orange', 'برتقال', 'Orange', '1 medium', 62, 1.2, 0.2, 15.4, ['برتقال']],
    ['grapes', 'عنب', 'Grapes', '1 cup', 104, 1.1, 0.2, 27, ['عنب']],
    ['watermelon', 'حبحب (بطيخ)', 'Watermelon', '1 cup (150 g)', 46, 0.9, 0.2, 11.5, ['بطيخ', 'حبحب']],
    ['mango', 'مانجو', 'Mango', '1 cup', 99, 1.4, 0.6, 25, ['مانجو']],
    ['strawberries', 'فراولة', 'Strawberries', '1 cup', 50, 1, 0.5, 12, ['فراولة']],
    ['pomegranate', 'رمان', 'Pomegranate', '½ fruit', 117, 2.3, 1.6, 26, ['رمان']],
  ],
  'Vegetables & salads': [
    ['salad-plain', 'سلطة خضراء (بدون صوص)', 'Green salad (no dressing)', '1 bowl', 30, 2, 0.3, 6, ['سلطة خضراء']],
    ['salad-oil', 'سلطة خضراء بزيت الزيتون', 'Green salad with olive oil', '1 bowl', 158, 2, 14, 6, ['سلطة']],
    ['tabbouleh', 'تبولة', 'Tabbouleh', '1 bowl (150 g)', 185, 3, 14, 12, ['tabouli', 'تبولة']],
    ['fattoush', 'فتوش', 'Fattoush', '1 bowl (150 g)', 163, 3, 11, 13, ['فتوش']],
    ['cucumber', 'خيار', 'Cucumber', '1 medium', 30, 1.3, 0.2, 7, ['خيار']],
    ['tomato', 'طماطم', 'Tomato', '1 medium', 22, 1.1, 0.2, 4.8, ['طماطم']],
    ['carrot', 'جزر', 'Carrot', '1 medium', 25, 0.6, 0.1, 6, ['جزر']],
    ['olive-oil', 'زيت زيتون', 'Olive oil', '1 tbsp', 120, 0, 13.5, 0, ['زيت زيتون']],
  ],
  'Snacks & sweets': [
    ['almonds', 'لوز', 'Almonds', '1 handful (28 g)', 170, 6, 14, 6, ['لوز']],
    ['mixed-nuts', 'مكسرات مشكلة', 'Mixed nuts', '1 handful (28 g)', 175, 5, 15, 6, ['مكسرات']],
    ['peanut-butter', 'زبدة فول سوداني', 'Peanut butter', '1 tbsp', 100, 3.5, 8, 3.5, ['زبدة فول سوداني']],
    ['dark-chocolate', 'شوكولاتة داكنة', 'Dark chocolate', '2 squares (20 g)', 114, 1.5, 8, 9, ['شوكولاتة داكنة']],
    ['milk-chocolate', 'شوكولاتة بالحليب', 'Milk chocolate bar', '1 bar (45 g)', 235, 3.4, 13, 26, ['chocolate', 'شوكولاتة']],
    ['crisps', 'شيبس', 'Potato chips', '1 small bag (28 g)', 150, 2, 10, 15, ['crisps', 'شيبس']],
    ['protein-bar', 'بروتين بار', 'Protein bar', '1 bar (60 g)', 220, 20, 7, 22, ['بروتين بار']],
    ['biscuit', 'بسكويت', 'Biscuit / cookie', '1 piece', 75, 1, 3.5, 10, ['cookie', 'بسكويت']],
    ['ice-cream', 'آيس كريم', 'Ice cream', '1 scoop', 140, 2.5, 7.5, 16, ['آيس كريم']],
    ['popcorn', 'فشار (سادة)', 'Popcorn (plain)', '3 cups', 97, 3, 1, 19, ['فشار']],
    ['cake', 'كيك', 'Cake', '1 slice (80 g)', 305, 3.5, 14, 42, ['كيك']],
    ['donut', 'دونات', 'Glazed donut', '1 donut', 265, 4, 14, 31, ['doughnut', 'دونات']],
  ],
  Drinks: [
    ['gahwa', 'قهوة عربية (بدون سكر)', 'Arabic coffee (no sugar)', '1 small cup', 2, 0, 0, 0.4, ['gahwa', 'qahwa', 'قهوة عربية']],
    ['black-coffee', 'قهوة سوداء / أمريكانو', 'Black coffee / Americano', '1 cup', 5, 0.3, 0, 0.5, ['americano', 'قهوة سوداء']],
    ['latte', 'لاتيه (حليب كامل الدسم)', 'Latte (full-fat milk)', '1 medium (350 ml)', 167, 10, 7, 16, ['لاتيه']],
    ['cappuccino', 'كابتشينو', 'Cappuccino', '1 medium', 110, 6.5, 4.5, 10, ['كابتشينو']],
    ['tea-sugar', 'شاي بالسكر', 'Black tea with sugar', '1 cup (1 tsp sugar)', 20, 0, 0, 5, ['shai', 'شاي']],
    ['karak', 'شاي كرك', 'Karak tea', '1 cup', 120, 3, 3.5, 19, ['chai', 'كرك']],
    ['orange-juice', 'عصير برتقال', 'Orange juice', '1 cup (240 ml)', 112, 1.7, 0.5, 26, ['عصير برتقال']],
    ['soft-drink', 'مشروب غازي', 'Soft drink', '1 can (330 ml)', 140, 0, 0, 35, ['soda', 'cola', 'pepsi', 'مشروب غازي']],
    ['diet-soft-drink', 'مشروب غازي دايت', 'Diet soft drink', '1 can (330 ml)', 1, 0, 0, 0, ['diet soda', 'دايت']],
    ['energy-drink', 'مشروب طاقة', 'Energy drink', '1 can (250 ml)', 110, 0, 0, 27, ['مشروب طاقة']],
    ['vimto', 'فيمتو (مخفف)', 'Vimto (diluted)', '1 glass (250 ml)', 100, 0, 0, 25, ['فيمتو']],
    ['protein-shake', 'بروتين شيك (بالماء)', 'Protein shake (with water)', '1 scoop', 120, 24, 1.5, 3, ['whey', 'بروتين']],
  ],
  'Fast food': [
    ['burger', 'برجر لحم', 'Beef burger', '1 regular', 344, 17, 16, 33, ['hamburger', 'برجر']],
    ['cheeseburger', 'تشيز برجر', 'Cheeseburger', '1 regular', 305, 15, 13, 32, ['تشيز برجر']],
    ['chicken-burger', 'برجر دجاج كرسبي', 'Crispy chicken burger', '1 regular', 449, 20, 21, 45, ['برجر دجاج']],
    ['broasted', 'دجاج بروستد', 'Broasted chicken', '2 pieces', 592, 45, 36, 22, ['fried chicken', 'بروستد']],
    ['nuggets', 'ناجتس دجاج', 'Chicken nuggets', '6 pieces', 268, 15, 16, 16, ['ناجتس']],
    ['pizza-margherita', 'بيتزا مارغريتا', 'Margherita pizza', '1 slice (large pizza)', 282, 12, 10, 36, ['pizza', 'بيتزا']],
    ['pizza-pepperoni', 'بيتزا ببروني', 'Pepperoni pizza', '1 slice (large pizza)', 309, 13, 13, 35, ['بيتزا ببروني']],
    ['sub-turkey', 'ساندويتش صب تركي', 'Turkey sub sandwich', '6-inch', 287, 18, 3.5, 46, ['subway', 'ساندويتش']],
  ],
};

export const FOOD_CATEGORIES = Object.keys(GROUPS) as FoodCategory[];

export const COMMON_FOODS: CommonFood[] = FOOD_CATEGORIES.flatMap((category) =>
  GROUPS[category].map(([id, name, english, portion, calories, protein_g, fat_g, carbs_g, terms]) => ({
    id,
    name,
    portion,
    calories,
    protein_g,
    fat_g,
    carbs_g,
    category,
    terms: [english, ...(terms ?? [])],
  }))
);

/** Lower-case text with Arabic letter variants folded together, for forgiving search. */
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ً-ْ]/g, ''); // Arabic vowel marks
}

/** Foods whose name, category or extra terms contain every word typed. */
export function searchCommonFoods(query: string): CommonFood[] {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return COMMON_FOODS;
  return COMMON_FOODS.filter((food) => {
    const haystack = normalizeSearch([food.name, food.category, ...(food.terms ?? [])].join(' '));
    return words.every((w) => haystack.includes(w));
  });
}
