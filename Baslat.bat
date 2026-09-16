@echo off
title J.A.R.V.I.S. Windows Asistani
color 0b

echo ================================================================
echo          J.A.R.V.I.S. WINDOWS ASISTANI BASLATICI
echo ================================================================
echo.

:: Node.js kontrolu
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [HATA] Bilgisayarinizda Node.js kurulu bulunamadi!
    echo.
    echo J.A.R.V.I.S.'i calistirmak icin Node.js gereklidir:
    echo 1. https://nodejs.org adresine gidin.
    echo 2. "LTS" (Onerilen) surumunu indirip kurun.
    echo 3. Kurulum tamamlandiktan sonra bu dosyayi (Baslat.bat) tekrar acin.
    echo.
    pause
    exit /b
)

:: node_modules klasoru yoksa npm install calistir
if not exist node_modules (
    echo Gerekli paketler yukleniyor (bu islem ilk acilista 1-2 dakika surebilir)...
    call npm install
    if %errorlevel% neq 0 (
        echo [HATA] Paketler yuklenirken bir sorun olustu.
        pause
        exit /b
    )
)

echo.
echo J.A.R.V.I.S. sistemi baslatiliyor...
echo.
echo Tarayiciniz acilacak: http://localhost:3000
echo.

:: Tarayiciyi baslat
start "" http://localhost:3000

:: Uygulama sunucusunu calistir
call npm run dev

pause
