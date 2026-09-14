@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Opens the site in edit mode. Click any text to fix it, Ctrl+S saves straight to the file.
rem If the local server is already running (from Claude), this only opens the browser.
start "" "http://localhost:5173/v3/?edit=1"
node "%USERPROFILE%\.claude\skills\design-dna\tools\site-edit\server.mjs" --root site --port 5173
pause
