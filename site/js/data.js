/* התוכן שמתחלף לעיתים קרובות: פרויקטים ושלבי עבודה. index.html לא נוגעים בו בשביל זה. */
window.SITE = {
  works: [
    { n: 'קרן גרינלייט',        tag: 'Corporate · Energy' },
    { n: 'אלון קליניק',         tag: 'Clinic · Premium' },
    { n: 'זוכרים 7.10',         tag: 'Memorial · Storytelling' },
    { n: 'סונה סטודיו',         tag: 'Architecture' },
    { n: 'מאסל אנד מושן',       tag: 'SaaS · Global' },
    { n: 'שינובי סטודיוס',      tag: 'Video · Brand' },
    { n: 'ידע שווה כסף',        tag: 'Community · Finance' },
    { n: 'ד״ר נמירובסקי',       tag: 'Aesthetic medicine' },
    { n: 'קימקו סטודיו',        tag: 'Creative · Brand' },
    { n: 'ווישלי',              tag: 'App · Service' },
    { n: 'ברזי',                tag: 'Manufacturing · Luxury' },
    { n: 'סטודיו צילום',        tag: 'Photography' },
    { n: 'מחשב לכל ילד',        tag: 'Government · Impact' },
    { n: 'קוגומלו',             tag: 'Kids · Playful' },
  ],
  /* v3: אותן 14 עבודות עם הקלטת מסך. חמש הוחלפו בפרויקטים שיש להם סרטון. v2 ממשיך לקרוא את works, שממופה לתמונות לפי מיקום */
  worksV3: [
    /* clip: שם הקובץ ב-video/works ו-img/clips (הקלטת מסך שמתנגנת בלפטופ) */
    { n: 'קרן גרינלייט',        tag: 'Corporate · Energy',        clip: 'greenlight' },
    { n: 'קבוצת גולן',          tag: 'Real estate · Investment',  clip: 'golan-group' },
    { n: 'ספיק',                tag: 'Storytelling · Coaching',   clip: 'speak-storytelling' },
    { n: 'סונה סטודיו',         tag: 'Architecture',              clip: 'sauna-studio' },
    { n: 'מאסל אנד מושן',       tag: 'SaaS · Global',             clip: 'muscle-and-motion' },
    { n: 'גלברד סטודיו',        tag: 'Motion · Video',            clip: 'studio-gelbard' },
    { n: 'ידע שווה כסף',        tag: 'Community · Finance',       clip: 'yeda-shave-kesef' },
    { n: 'ד״ר נמירובסקי',       tag: 'Aesthetic medicine',        clip: 'dr-nemirovsky' },
    { n: 'עופר ומאור',          tag: 'Kids · Entertainment',      clip: 'ofer-maor' },
    { n: 'ווישלי',              tag: 'App · Service',             clip: 'washly' },
    { n: 'ברזי',                tag: 'Manufacturing · Luxury',    clip: 'barzi-cosmetics' },
    { n: 'שי כליף',             tag: 'Towing · Rescue',           clip: 'grar-khalif' },
    { n: 'מחשב לכל ילד',        tag: 'Government · Impact',       clip: 'machshev-lekol-yeled' },
    { n: 'קוגומלו',             tag: 'Kids · Playful',            clip: 'kogumelo' },
  ],
  /* המלצות וידאו. הציטוט הקצר לקוח מהסרטון עצמו, מילה במילה ככל האפשר. */
  clients: [
    { v: 'f', n: 'טוהר',          r: 'Fashion · E-commerce',   q: 'ההכנסות שלי הרבה יותר קבועות מאז שיש לי אתר.' },
    { v: 'g', n: 'יהב ברזילי',     r: 'Manufacturing · Luxury', q: 'המפעל שלנו עכשיו נראה באמת מקצועי.' },
    { v: 'a', n: 'ד״ר אור גפן',    r: 'Education · Kids',       q: 'הכול בוצע בצורה יוצאת מן הכלל, ובמהירות.' },
    { v: 'd', n: 'איתי',           r: 'Kids · Playful',         q: 'בדיוק מה שרציתי, בדיוק לצרכים שלנו.' },
    { v: 'e', n: 'שון צעירי',      r: 'Online business',        q: 'תוך שלושה ימים כבר היה לי אתר מושלם.' },
    { v: 'b', n: 'שי סבג',         r: 'Top Level',              q: 'הרבה דרישות, הרבה שינויים, וכל הזמן מקסימום מקצועיות.' },
  ],
  steps: [
    { t: 'שיחה קצרה',        p: 'עשרים דקות. מה העסק, מי הלקוח, ומה האתר צריך לעשות ביום שאחרי העלייה לאוויר.', img: 1 },
    { t: 'מילים לפני פיקסלים', p: 'הקופי נכתב קודם. כל כותרת עונה על שאלה אמיתית של מי שנחת בעמוד.', img: 7 },
    { t: 'עיצוב ותנועה',      p: 'שפה אחת, גריד אחד, ותנועה שמסבירה במקום לקשט. כאן הכלים עובדים בשבילי, ולא להפך.', img: 3 },
    { t: 'באוויר, ומודדים',   p: 'מעקב מחובר לפני ההשקה. אחרי חודש יודעים מה עובד, במקום לנחש.', img: 5 },
  ]
};
