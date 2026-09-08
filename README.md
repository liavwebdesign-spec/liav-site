# ליאב מצרי · האתר החדש

אתר תדמית של סטודיו ליאב מצרי: פתיח image sequence מסרטוני Magnific של ליאב, ואחריו סקשנים שמונעים ב-GSAP מתוך Motion Vault. סטטי לגמרי, מתפרסם ל-GitHub Pages דרך Actions.

המסר: אמן אתרים. יוצר אתרים ב-AI שלא נראים כמו AI.

## מבנה

```
site/                 מה שמתפרסם
  index.html          עמוד אחד. הקופי של הסצנות ב-.layer, השאר בסקשנים
  css/tokens.css      שחור קולנועי + ליים אחד, סולם טיפוגרפי נוזלי, --head לפונט הכותרות
  css/site.css
  js/sequence.js      מנוע ה-image sequence (מבוסס velox), מוצמד לסקשן #intro
  js/site.js          Lenis + מהלכי ה-Vault: G59 G37 G4 G12 G15 G08 B23 B61 B40 B32 B03
  frames/ frames-lo/ frames-pt/   שלוש שכבות פריימים (דסקטופ / פרוקסי / פורטרט)
  img/works/featured  4 נבחרות (G59) · img/works/cloud 10 (G37)
source/clips/         קליפי המקור (לא נדחפים)
source/testimonials/  11 ההמלצות מהאתר הישן, לשלב הבא
tools/build-frames.sh פירוק קליפים לפריימים (מהסקיל image-sequence-site)
tools/font-sheet.html 32 פונטים של פונטאפ על שחור, לבחירה
tools/shot.mjs        צילומי QA דרך CDP: node tools/shot.mjs [--mobile] 0 4500 12000
tools/stamp.py        cache-busting ל-css/js. להריץ אחרי כל עריכה
```

## הפתיח

`CONFIG` ב-`sequence.js`: `frames` הוא מערך לפי סצנה (הקליפים באורכים שונים), `pxPerFrame` 24, `holdPx` 520. הקנבס `position:sticky` בתוך `#intro`, והגלילה נמדדת יחסית לתחילתו. Lenis מספק את מיקום הגלילה (גלגלת עם lerp, טאץ' 1:1). טלפונים בפורטרט מקבלים `frames-pt`.

הכותרת הפותחת היא מסכת SVG: שכבה שחורה עם חלון בצורת האותיות, שנמסה בתחילת סצנה 1 (`maskFade`).

### החלפת קליפים

```bash
bash tools/build-frames.sh --opening source/opening.png --out site --fps 24 source/clips/1.mp4 source/clips/2.mp4 ...
```
ואז לעדכן `CONFIG.scenes` ו-`CONFIG.frames` לפי הפלט. גרסאות 9:16 ל-`frames-pt` יחליפו את החיתוך המרכזי כשיגיעו.

## QA

- `?at=N` בכתובת: מדלג על הפרילודר וקופץ למיקום גלילה. לצילומים בלבד.
- `node tools/shot.mjs 0 4500 12000` לדסקטופ, `--mobile` לטלפון 390x844.
- שרת מקומי: `.claude/launch.json` (site-edit של design-dna, `?edit=1` לעריכת טקסט ותמונות).

## עוד לא

- סצנה 4 (זום למסך) והמסירה 1:1 לסקשן העבודות. `#handoff` מוכן ומוסתר.
- אפסקייל 1080p לפני פירוק.
- ההמלצות (מוכנות ב-`source/testimonials`).
