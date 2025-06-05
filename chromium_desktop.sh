#!/bin/bash
# Script to create Chrome desktop shortcut

# Create Desktop directory if it doesn't exist
mkdir -p /home/vncuser/Desktop

# Create Chrome browser desktop shortcut
cat > /home/vncuser/Desktop/chrome-browser.desktop << 'EOF'
[Desktop Entry]
Version=1.0
Name=Google Chrome
Name[ar]=متصفح الويب جوجل كروم
Name[bg]=Уеб браузър Chromium
Name[bn]=ক্রোমিয়াম ওয়েব ব্রাউজার
Name[ca]=Navegador web Chromium
Name[cs]=Webový prohlížeč Chromium
Name[da]=Chromium netbrowser
Name[de]=Chromium-Webbrowser
Name[el]=Περιηγητής ιστού Chromium
Name[en_GB]=Chromium Web Browser
Name[es]=Navegador web Chromium
Name[et]=Chromiumi veebibrauser
Name[fi]=Chromium-selain
Name[fil]=Chromium Web Browser
Name[fr]=Navigateur Web Chromium
Name[gl]=Navegador web Chromium
Name[gu]=Chromium વેબ બ્રાઉઝર
Name[he]=דפדפן האינטרנט Chromium
Name[hi]=Chromium वेब ब्राउज़र
Name[hr]=Chromium web preglednik
Name[hu]=Chromium webböngésző
Name[id]=Peramban Web Chromium
Name[it]=Browser web Chromium
Name[ja]=Chromium ウェブブラウザ
Name[kn]=Chromium ಜಾಲ ವೀಕ್ಷಕ
Name[ko]=Chromium 웹 브라우저
Name[lt]=Chromium interneto naršyklė
Name[lv]=Chromium tīmekļa pārlūks
Name[ml]=ക്രോമിയം വെബ് ബ്രൌസര്‍
Name[mr]=क्रोमियम वेब ब्राऊजर
Name[nl]=Chromium webbrowser
Name[no]=Chromium nettleser
Name[pl]=Przeglądarka internetowa Chromium
Name[pt]=Navegador Web Chromium
Name[pt_BR]=Navegador de Internet Chromium
Name[ro]=Navigator Internet Chromium
Name[ru]=Веб-браузер Chromium
Name[sk]=Webový prehliadač Chromium
Name[sl]=Spletni brskalnik Chromium
Name[sr]=Интернет прегледник Chromium
Name[sv]=Webbläsaren Chromium
Name[ta]=குரோமியம் இணைய உலாவி
Name[te]=Chromium వెబ్ బ్రౌజర్
Name[th]=เว็บเบราว์เซอร์ Chromium
Name[tr]=Chromium Web Tarayıcısı
Name[uk]=Веб-навігатор Chromium
Name[vi]=Trình duyệt Web Chromium
Name[zh_CN]=Chromium 网页浏览器
Name[zh_HK]=Chromium 網頁瀏覽器
Name[zh_TW]=Chromium 網頁瀏覽器
GenericName=Web Browser
GenericName[ar]=متصفح الويب
GenericName[bg]=Уеб браузър
GenericName[bn]=ওয়েব ব্রাউজার
GenericName[ca]=Navegador web
GenericName[cs]=Webový prohlížeč
GenericName[da]=Browser
GenericName[de]=Webbrowser
GenericName[el]=Περιηγητής ιστού
GenericName[en_GB]=Web Browser
GenericName[es]=Navegador web
GenericName[et]=Veebibrauser
GenericName[fi]=WWW-selain
GenericName[fil]=Web Browser
GenericName[fr]=Navigateur Web
GenericName[gl]=Navegador web
GenericName[gu]=વેબ બ્રાઉઝર
GenericName[he]=דפדפן אינטרנט
GenericName[hi]=वेब ब्राउज़र
GenericName[hr]=Web preglednik
GenericName[hu]=Webböngésző
GenericName[id]=Browser Web
GenericName[it]=Browser web
GenericName[ja]=ウェブブラウザ
GenericName[kn]=ಜಾಲ ವೀಕ್ಷಕ
GenericName[ko]=웹 브라우저
GenericName[lt]=Žiniatinklio naršyklė
GenericName[lv]=Tīmekļa pārlūks
GenericName[ml]=വെബ് ബ്രൌസര്‍
GenericName[mr]=वेब ब्राऊजर
GenericName[nl]=Webbrowser
GenericName[no]=Nettleser
GenericName[pl]=Przeglądarka WWW
GenericName[pt]=Navegador Web
GenericName[pt_BR]=Navegador da Internet
GenericName[ro]=Navigator de Internet
GenericName[ru]=Веб-браузер
GenericName[sk]=WWW prehliadač
GenericName[sl]=Spletni brskalnik
GenericName[sr]=Интернет прегледник
GenericName[sv]=Webbläsare
GenericName[ta]=இணைய உலாவி
GenericName[te]=మహాతల అన్వేషి
GenericName[th]=เว็บเบราว์เซอร์
GenericName[tr]=Web Tarayıcısı
GenericName[uk]=Навігатор Тенет
GenericName[vi]=Bộ duyệt Web
GenericName[zh_CN]=网页浏览器
GenericName[zh_HK]=網頁瀏覽器
GenericName[zh_TW]=網頁瀏覽器
Comment=Access the Internet
Comment[ar]=الدخول إلى الإنترنت
Comment[bg]=Достъп до интернет
Comment[bn]=ইন্টারনেটে প্রবেশ করুন
Comment[ca]=Accediu a Internet
Comment[cs]=Přístup k internetu
Comment[da]=Få adgang til internettet
Comment[de]=Internetzugriff
Comment[el]=Πρόσβαση στο Διαδίκτυο
Comment[en_GB]=Access the Internet
Comment[es]=Acceda a Internet.
Comment[et]=Pääs Internetti
Comment[fi]=Käytä internetiä
Comment[fil]=I-access ang Internet
Comment[fr]=Accéder à Internet
Comment[gl]=Acceda a Internet.
Comment[gu]=ઇંટરનેટ ઍક્સેસ કરો
Comment[he]=גישה אל האינטרנט
Comment[hi]=इंटरनेट तक पहुंच स्थापित करें
Comment[hr]=Pristup Internetu
Comment[hu]=Internetelérés
Comment[id]=Akses Internet
Comment[it]=Accesso a Internet
Comment[ja]=インターネットにアクセス
Comment[kn]=ಇಂಟರ್ನೆಟ್ ಅನ್ನು ಪ್ರವೇಶಿಸಿ
Comment[ko]=인터넷 연결
Comment[lt]=Interneto prieiga
Comment[lv]=Piekļūt internetam
Comment[ml]=ഇന്റര്‍‌നെറ്റ് ആക്‌സസ് ചെയ്യുക
Comment[mr]=इंटरनेटमध्ये प्रवेश करा
Comment[nl]=Verbinding maken met internet
Comment[no]=Gå til Internett
Comment[pl]=Skorzystaj z internetu
Comment[pt]=Aceder à Internet
Comment[pt_BR]=Acessar a internet
Comment[ro]=Accesaţi Internetul
Comment[ru]=Доступ в Интернет
Comment[sk]=Prístup do internetu
Comment[sl]=Dostop do interneta
Comment[sr]=Приступите Интернету
Comment[sv]=Gå ut på Internet
Comment[ta]=இணையத்தை அணுகுதல்
Comment[te]=ఇంటర్నెట్‌ను ఆక్సెస్ చెయ్యండి
Comment[th]=เข้าถึงอินเทอร์เน็ต
Comment[tr]=İnternet'e erişin
Comment[uk]=Доступ до Інтернету
Comment[vi]=Truy cập Internet
Comment[zh_CN]=访问互联网
Comment[zh_HK]=連線到網際網路
Comment[zh_TW]=連線到網際網路
Exec=google-chrome %U
Terminal=false
X-MultipleArgs=false
Type=Application
Icon=google-chrome
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml+xml;x-scheme-handler/http;x-scheme-handler/https;
StartupWMClass=google-chrome
StartupNotify=true
Actions=NewWindow;Incognito;TempProfile;

[Desktop Action NewWindow]
Name=Open a New Window
Name[ar]=افتح نافذة جديدة
Name[bg]=Отваряне на Нов прозорец
Name[bn]=একটি নতুন উইন্ডো খুলুন
Name[ca]=Obre una finestra nova
Name[cs]=Otevřít nové okno
Name[da]=Åbn et nyt vindue
Name[de]=Neues Fenster öffnen
Name[el]=Άνοιγμα νέου παραθύρου
Name[en_GB]=Open a New Window
Name[es]=Abrir una ventana nueva
Name[et]=Ava uus aken
Name[fi]=Avaa uusi ikkuna
Name[fil]=Magbukas ng Bagong Window
Name[fr]=Ouvrir une nouvelle fenêtre
Name[gl]=Abrir unha nova xanela
Name[gu]=નવી વિંડો ખોલો
Name[hi]=एक नई विंडो खोलें
Name[hr]=Otvori novi prozor
Name[hu]=Új ablak megnyitása
Name[id]=Buka Jendela Baru
Name[it]=Apri una nuova finestra
Name[ja]=新しいウィンドウを開く
Name[kn]=ಹೊಸ ವಿಂಡೊವನ್ನು ತೆರೆ
Name[ko]=새 창 열기
Name[lt]=Atverti naują langą
Name[lv]=Atvērt jaunu logu
Name[ml]=പുതിയ വിന്‍ഡോ തുറക്കുക
Name[mr]=नवीन विंडो उघडा
Name[nl]=Nieuw venster openen
Name[no]=Åpne et nytt vindu
Name[pl]=Otwórz nowe okno
Name[pt]=Abrir nova janela
Name[pt_BR]=Abrir nova janela
Name[ro]=Deschide o fereastră nouă
Name[ru]=Открыть новое окно
Name[sk]=Otvoriť nové okno
Name[sl]=Odpri novo okno
Name[sr]=Отвори нови прозор
Name[sv]=Öppna ett nytt fönster
Name[ta]=புதிய சாளரத்தை திற
Name[te]=క్రొత్త విండో తెరువుము
Name[th]=เปิดหน้าต่างใหม่
Name[tr]=Yeni Pencere Aç
Name[uk]=Відкрити нове вікно
Name[vi]=Mở Cửa sổ Mới
Name[zh_CN]=打开新窗口
Name[zh_HK]=開啟新視窗
Name[zh_TW]=開啟新視窗
Exec=google-chrome

[Desktop Action Incognito]
Name=Open a New Window in incognito mode
Name[ar]=افتح نافذة جديدة في وضع التخفي
Name[bg]=Отваряне на нов прозорец в режим \"инкогнито\"
Name[bn]=একটি নতুন উইন্ডো খুলুন ইনকগনিটো মোড
Name[ca]=Obre una finestra nova en mode d'incògnit
Name[cs]=Otevřít nové okno v režimu anonymního prohlížení
Name[da]=Åbn et nyt vindue i Inkognito-tilstand
Name[de]=Neues Fenster im Inkognito-Modus öffnen
Name[el]=Άνοιγμα νέου παραθύρου σε λειτουργία για ανώνυμη περιήγηση
Name[en_GB]=Open a New Window in incognito mode
Name[es]=Abrir una ventana nueva en modo incógnito
Name[et]=Ava uus aken tundmatus režiimis
Name[fi]=Avaa uusi ikkuna incognito-tilassa
Name[fil]=Magbukas ng Bagong Window sa incognito mode
Name[fr]=Ouvrir une nouvelle fenêtre en mode navigation privée
Name[gl]=Abrir unha nova xanela en modo de incógnito
Name[gu]=છુપાયેલી સ્થિતિમાં નવી વિંડો ખોલો
Name[hi]=इनकॉग्निटो मोड में एक नई विंडो खोलें
Name[hr]=Otvori novi prozor u načinu rada incognito
Name[hu]=Új ablak megnyitása Inkognitó módban
Name[id]=Buka Jendela Baru dalam mode penyamaran
Name[it]=Apri una nuova finestra in modalità in incognito
Name[ja]=新しいシークレット ウィンドウを開く
Name[kn]=ಅಜ್ಞಾತ ಮೋಡ್‌ನಲ್ಲಿ ಹೊಸ ವಿಂಡೋವನ್ನು ತೆರೆಯಿರಿ
Name[ko]=시크릿 모드에서 새 창 열기
Name[lt]=Atverti naują langą inkognito režimu
Name[lv]=Atvērt jaunu logu inkognito režīmā
Name[ml]=വേഷ പ്രച്ഛന്ന മോഡിൽ പുതിയ വിന്‍ഡോ തുറക്കുക
Name[mr]=गुप्त मोडमध्ये नवीन विंडो उघडा
Name[nl]=Nieuw venster openen in incognitomodus
Name[no]=Åpne et nytt vindu i inkognitomodus
Name[pl]=Otwórz nowe okno w trybie incognito
Name[pt]=Abrir nova janela em modo de navegação anónima
Name[pt_BR]=Abrir nova janela em modo anônimo
Name[ro]=Deschide o fereastră nouă în mod incognito
Name[ru]=Открыть новое окно в режиме инкогнито
Name[sk]=Otvoriť nové okno v režime inkognito
Name[sl]=Odpri novo okno v načinu brez beleženja zgodovine
Name[sr]=Отвори нови прозор у режиму без архивирања
Name[sv]=Öppna ett nytt inkognitofönster
Name[ta]=புதிய மறைநிலைச் சாளரத்தை திற
Name[te]=అజ్ఞాత మోడ్‌లో క్రొత్త విండో తెరువుము
Name[th]=เปิดหน้าต่างใหม่ในโหมดไม่ระบุตัวตน
Name[tr]=Gizli modda yeni pencere aç
Name[uk]=Відкрити нове вікно в режимі анонімного перегляду
Name[vi]=Mở Cửa sổ Mới trong chế độ ẩn danh
Name[zh_CN]=以隐身模式打开新窗口
Name[zh_HK]=以隱身模式開啟新視窗
Name[zh_TW]=以隱身模式開啟新視窗
Exec=google-chrome --incognito

[Desktop Action TempProfile]
Name=Open a New Window with a temporary profile
Name[ar]=افتح نافذة جديدة بملف مؤقت
Name[bg]=Отваряне на Нов прозорец с временен профил
Name[bn]=অস্থায়ী প্রোফাইল সহ একটি নতুন উইন্ডো খুলুন
Name[ca]=Obre una finestra nova amb un perfil temporal
Name[cs]=Otevřít nové okno s dočasným profilem
Name[da]=Åbn et nyt vindue med en midlertidig profil
Name[de]=Neues Fenster mit einem temporären Profil öffnen
Name[el]=Άνοιγμα νέου παραθύρου με προσωρινό προφίλ
Name[en_GB]=Open a New Window with a temporary profile
Name[es]=Abrir una ventana nueva con un perfil temporal
Name[et]=Ava uus aken ajutise profiiliga
Name[fi]=Avaa uusi ikkuna käyttäen väliaikaista profiilia
Name[fil]=Magbukas ng Bagong Window na may pansamantalang profile
Name[fr]=Ouvrir une nouvelle fenêtre avec un profil temporaire
Name[gl]=Abrir unha nova xanela cun perfil temporal
Name[gu]=કામચલાઉ પ્રોફાઇલ સાથે નવી વિંડો ખોલો
Name[hi]=अस्थायी प्रोफ़ाइल के साथ एक नई विंडो खोलें
Name[hr]=Otvori novi prozor s privremenim profilom
Name[hu]=Új ablak megnyitása ideiglenes profillal
Name[id]=Buka Jendela Baru dengan profil sementara
Name[it]=Apri una nuova finestra con un profilo temporaneo
Name[ja]=一時プロファイルで新しいウィンドウを開く
Name[kn]=ತಾತ್ಕಾಲಿಕ ಪ್ರೊಫೈಲ್ ಜೊತೆಗೆ ಹೊಸ ವಿಂಡೋವನ್ನು ತೆರೆಯಿರಿ
Name[ko]=임시 프로필로 새 창 열기
Name[lt]=Atverti naują langą su laikinuoju profiliu
Name[lv]=Atvērt jaunu logu ar īslaicīgu profilu
Name[ml]=താൽക്കാലിക പ്രൊഫൈലുള്ള പുതിയ വിന്‍ഡോ തുറക്കുക
Name[mr]=तात्पुरत्या प्रोफाइलसह नवीन विंडो उघडा
Name[nl]=Nieuw venster openen met een tijdelijk profiel
Name[no]=Åpne et nytt vindu med en midlertidig profil
Name[pl]=Otwórz nowe okno z tymczasowym profilem
Name[pt]=Abrir nova janela com um perfil temporário
Name[pt_BR]=Abrir nova janela com um perfil temporário
Name[ro]=Deschide o fereastră nouă cu un profil temporar
Name[ru]=Открыть новое окно с временным профилем
Name[sk]=Otvoriť nové okno s dočasným profilom
Name[sl]=Odpri novo okno z začasnim profilom
Name[sr]=Отвори нови прозор са привременим профилом
Name[sv]=Öppna ett nytt fönster med en tillfällig profil
Name[ta]=தற்காலிக சுயவிவரத்துடன் புதிய சாளரத்தை திற
Name[te]=తాత్కాలిక ప్రొఫైల్‌తో క్రొత్త విండో తెరువుము
Name[th]=เปิดหน้าต่างใหม่ด้วยโปรไฟล์ชั่วคราว
Name[tr]=Geçici bir profille yeni pencere aç
Name[uk]=Відкрити нове вікно з тимчасовим профілем
Name[vi]=Mở Cửa sổ Mới với hồ sơ tạm
Name[zh_CN]=以临时配置文件打开新窗口
Name[zh_HK]=以臨時設定檔開啟新視窗
Name[zh_TW]=以暫時性設定檔開啟新視窗
Exec=google-chrome --temp-profile
EOF

# Set ownership and permissions
chown 1000:1000 /home/vncuser/Desktop/chrome-browser.desktop
chmod +x /home/vncuser/Desktop/chrome-browser.desktop

# Create Chrome preferences directory if it doesn't exist
mkdir -p /home/vncuser/.config/google-chrome

# Set Chrome flags to work properly in Docker
cat > /home/vncuser/.config/google-chrome/Local\ State << 'EOF'
{
  "browser": {
    "custom_chrome_frame": false,
    "window_placement": {
      "bottom": 800,
      "left": 0,
      "maximized": false,
      "right": 1280,
      "top": 0,
      "work_area_bottom": 800,
      "work_area_left": 0,
      "work_area_right": 1280,
      "work_area_top": 0
    }
  },
  "command_line_args": {
    "enable-features": "NoSandbox",
    "disable-gpu": true,
    "window-size": "1280,800",
    "window-position": "0,0"
  }
}
EOF

chown -R 1000:1000 /home/vncuser/.config