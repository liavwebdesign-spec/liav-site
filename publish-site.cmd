@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Publishes the text/image edits to the live site (GitHub Pages updates within ~1 minute).
git add site
git commit -m "Content edits from the browser (site-edit)"
git push
echo.
echo Live in about a minute: https://liavwebdesign-spec.github.io/liav-site/v3/
pause
