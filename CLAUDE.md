# liav-site

- האתר: `site/` (v3 פעיל ב-`site/v3/`), GitHub Pages דרך Actions. כל שינוי עולה לאוויר מיד.
- עריכת תוכן: `?edit=1` (לדוגמה `http://localhost:5173/v3/?edit=1`). ליאב עורך טקסטים ותמונות בעצמו: `edit-site.cmd` פותח את העריכה ו-`publish-site.cmd` מעלה לאוויר. לפני שינוי ב-index.html בודקים ב-`site/_edits/edits.log` אם ליאב ערך משהו.
- שער מסירה: `tools/qa.mjs` ב-12 רוחבים, `tools/theme-check.mjs` בדסקטופ ובנייד, `tools/v3-motion.mjs`, ו-`tools/pin-film.mjs` לכל סקשן מוצמד. אחרי כל שינוי ב-v3.css או ב-v3.js מעלים את `?v=N`.
- גרסה אנגלית: `site/en/index.html`, אותם v3.css/v3.js עם `lang="en" dir="ltr"`, ובנוסף `v3/en.css` (פונטים, מידות, היפוכי כיוון) ו-`js/data-en.js` (טקסטים ב-JS). כל שינוי מבני בעמוד העברי צריך להיכנס גם לאנגלי. ב-JS: `EN`, `FLIP` (כפל לכל תנועה אופקית), `T` (מחרוזות). שער המסירה רץ על שני העמודים (`--base http://localhost:5173/en/`).
