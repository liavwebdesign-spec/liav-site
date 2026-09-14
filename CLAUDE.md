# liav-site

- האתר: `site/` (v3 פעיל ב-`site/v3/`), GitHub Pages דרך Actions. כל שינוי עולה לאוויר מיד.
- עריכת תוכן: `?edit=1` (לדוגמה `http://localhost:5173/v3/?edit=1`). ליאב עורך טקסטים ותמונות בעצמו: `edit-site.cmd` פותח את העריכה ו-`publish-site.cmd` מעלה לאוויר. לפני שינוי ב-index.html בודקים ב-`site/_edits/edits.log` אם ליאב ערך משהו.
- שער מסירה: `tools/qa.mjs` ב-12 רוחבים, `tools/theme-check.mjs` בדסקטופ ובנייד, `tools/v3-motion.mjs`, ו-`tools/pin-film.mjs` לכל סקשן מוצמד. אחרי כל שינוי ב-v3.css או ב-v3.js מעלים את `?v=N`.
