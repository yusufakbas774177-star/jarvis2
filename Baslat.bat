@echo off
chcp 65001 >nul
title J.A.R.V.I.S. Windows Asistanı - Başlatıcı
color 0b

:: 1. Adım: Çalışma dizinini projenin bulunduğu klasöre sabitle (Yönetici olarak çalıştırılsa bile)
cd /d "%~dp0"

echo ================================================================
echo       J.A.R.V.I.S. WINDOWS ASİSTANI (TONY STARK OS)
echo ================================================================
echo.
echo [*] Çalışma Dizini: %cd%
echo.

:: 2. Adım: Node.js ve NPM Kontrolü
echo [*] Sistem gereksinimleri kontrol ediliyor...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo.
    echo ================================================================
    echo [HATA] Bilgisayarınızda Node.js kurulu bulunamadı!
    echo ================================================================
    echo.
    echo J.A.R.V.I.S.'ın çalışabilmesi için Node.js gereklidir:
    echo 1. https://nodejs.org adresine gidin.
    echo 2. "LTS (Önerilen)" sürümünü indirip kurun.
    echo 3. Kurulum sırasında "Next" diyerek varsayılan seçeneklerle bitirin.
    echo 4. Kurulum bitince bu pencereyi kapatıp "Baslat.bat"ı tekrar açın.
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [HATA] NPM paketi bulunamadı. Lütfen Node.js kurulumunu onarın.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [+] Node.js Hazır: %NODE_VER%

:: 3. Adım: Port 3000 Çakışma Kontrolü (Önceki açık oturumlar için)
echo [*] Port 3000 durumu taranıyor...
set PORT_PID=
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr /r ":3000 " ^| findstr "LISTENING"') do (
    set PORT_PID=%%a
)

if defined PORT_PID (
    echo [UYARI] Port 3000 zaten kullanımda (PID: %PORT_PID%).
    echo Eski açık kalan J.A.R.V.I.S. oturumu sonlandırılıyor...
    taskkill /F /PID %PORT_PID% >nul 2>nul
    timeout /t 1 /nobreak >nul
)

:: 4. Adım: Gerekli Paketlerin Kontrolü ve Yüklenmesi
if not exist "node_modules\tsx" (
    echo.
    echo [*] Gerekli kütüphaneler eksik veya ilk kez kuruluyor...
    echo [*] Paketler yükleniyor (bu işlem bağlantınıza göre 1-2 dakika sürebilir)...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [*] Normal yükleme uyarısı alındı, güvenli mod ile tekrar deneniyor...
        call npm install --legacy-peer-deps
    )
    if not exist "node_modules\tsx" (
        color 0c
        echo.
        echo [HATA] Kütüphaneler yüklenemedi!
        echo Lütfen internet bağlantınızı kontrol edip tekrar deneyin.
        pause
        exit /b 1
    )
    echo [+] Kütüphaneler başarıyla hazırlandı.
) else (
    echo [+] Kütüphaneler mevcut.
)

:: 5. Adım: .env Dosyası Kontrolü
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [+] .env dosyası .env.example şablonundan oluşturuldu.
    )
)

echo.
echo ================================================================
echo    J.A.R.V.I.S. ÇEKİRDEĞİ BAŞLATILIYOR...
echo    Erişim Adresi: http://localhost:3000
echo ================================================================
echo.

:: 6. Adım: Tarayıcıyı sunucu açıldıktan 3 saniye sonra aç (Sayfa bulunamadı hatasını önler)
start "" /b cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: 7. Adım: Uygulamayı Başlat (tsx server.ts)
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [*] Geliştirme modu kapandı, alternatif başlatıcı deneniyor...
    call npx tsx server.ts
)

echo.
echo J.A.R.V.I.S. oturumu sonlandı.
pause
