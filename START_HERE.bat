@echo off
chcp 65001 >nul
color 0B
title 🌊 خريطة المياه الجوفية - محافظة سوهاج 🌊

:menu
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo    🌊 خريطة المياه الجوفية التفاعلية - محافظة سوهاج 🌊
echo ═══════════════════════════════════════════════════════════════
echo.
echo    اختر ما تريد تشغيله:
echo.
echo    [1] 🗺️  خريطة المياه الجوفية (groundwater.html)
echo    [2] 🏠 الصفحة الرئيسية للمشروع (home.html)
echo    [3] 🧪 اختبار الخريطة (test-map.html)
echo    [4] 📖 قراءة التعليمات
echo    [5] 🛠️  تطبيق الإصلاحات الشاملة (CSS/JS)
echo    [6] ❌ خروج
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
set /p choice="   اختر رقم (1-6): "

if "%choice%"=="1" goto groundwater
if "%choice%"=="2" goto home
if "%choice%"=="3" goto test
if "%choice%"=="4" goto readme
if "%choice%"=="5" goto fix
if "%choice%"=="6" goto end
goto menu

:fix
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo    🛠️  تطبيق الإصلاحات الشاملة
echo ═══════════════════════════════════════════════════════════════
echo.
python apply_fixes.py
goto menu

:groundwater
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo    🗺️  تشغيل خريطة المياه الجوفية
echo ═══════════════════════════════════════════════════════════════
echo.
echo جاري البحث عن خادم محلي...
echo.

REM Try Node.js first
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ تم العثور على Node.js
    echo 🚀 جاري تشغيل الخادم المحلي...
    echo.
    echo 📍 الخريطة متاحة على: http://localhost:8000/groundwater.html
    echo.
    echo ⚠️  لا تغلق هذه النافذة!
    echo.
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8000/groundwater.html"
    npx http-server -p 8000 -c-1
    goto menu
)

REM Try Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ تم العثور على Python
    echo 🚀 جاري تشغيل الخادم المحلي...
    echo.
    echo 📍 الخريطة متاحة على: http://localhost:8000/groundwater.html
    echo.
    echo ⚠️  لا تغلق هذه النافذة!
    echo.
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8000/groundwater.html"
    python -m http.server 8000
    goto menu
)

REM No server found
echo ❌ لم يتم العثور على Python أو Node.js!
echo.
echo 📥 يرجى تثبيت أحد البرامج التالية:
echo.
echo    • Python: https://www.python.org/downloads/
echo    • Node.js: https://nodejs.org/
echo.
echo 💡 سيتم فتح الملف مباشرة (قد لا تعمل بعض الميزات)
echo.
timeout /t 3 /nobreak >nul
start "" "groundwater.html"
pause
goto menu

:home
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo    🏠 تشغيل الصفحة الرئيسية
echo ═══════════════════════════════════════════════════════════════
echo.
start "" "home.html"
echo ✅ تم فتح الصفحة الرئيسية
echo.
timeout /t 2 /nobreak >nul
goto menu

:test
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo    🧪 تشغيل اختبار الخريطة
echo ═══════════════════════════════════════════════════════════════
echo.
echo جاري البحث عن خادم محلي...
echo.

REM Try Node.js first
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ تم العثور على Node.js
    echo 🚀 جاري تشغيل الخادم المحلي...
    echo.
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8000/test-map.html"
    npx http-server -p 8000 -c-1
    goto menu
)

REM Try Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ تم العثور على Python
    echo 🚀 جاري تشغيل الخادم المحلي...
    echo.
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8000/test-map.html"
    python -m http.server 8000
    goto menu
)

echo ❌ لم يتم العثور على خادم محلي
start "" "test-map.html"
pause
goto menu

:readme
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo    📖 التعليمات
echo ═══════════════════════════════════════════════════════════════
echo.
if exist "اقرأني.txt" (
    start "" "اقرأني.txt"
    echo ✅ تم فتح ملف التعليمات
) else (
    echo ❌ ملف التعليمات غير موجود
)
echo.
timeout /t 2 /nobreak >nul
goto menu

:end
cls
echo.
echo ═══════════════════════════════════════════════════════════════
echo    شكراً لاستخدامك خريطة المياه الجوفية! 🌊💧
echo ═══════════════════════════════════════════════════════════════
echo.
timeout /t 2 /nobreak >nul
exit