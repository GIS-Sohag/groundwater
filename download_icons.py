import os
import urllib.request
import zipfile
import io
import sys

def download_icons():
    # إعداد المجلدات
    base_dir = os.path.dirname(os.path.abspath(__file__))
    icon_dir = os.path.join(base_dir, 'icon')
    css_dir = os.path.join(icon_dir, 'css')
    webfonts_dir = os.path.join(icon_dir, 'webfonts')

    if not os.path.exists(css_dir):
        os.makedirs(css_dir)
    if not os.path.exists(webfonts_dir):
        os.makedirs(webfonts_dir)

    # رابط Font Awesome Free 6.5.1
    url = "https://use.fontawesome.com/releases/v6.5.1/fontawesome-free-6.5.1-web.zip"
    
    print("⏳ جاري تحميل مكتبة الأيقونات (Font Awesome)...")
    try:
        # التحميل
        with urllib.request.urlopen(url) as response:
            data = response.read()
        
        # استخراج الملفات الضرورية فقط
        print("📦 جاري استخراج الملفات...")
        with zipfile.ZipFile(io.BytesIO(data)) as zip_ref:
            for file in zip_ref.namelist():
                # استخراج ملف CSS
                if file.endswith('all.min.css'):
                    content = zip_ref.read(file)
                    with open(os.path.join(css_dir, 'all.min.css'), 'wb') as f:
                        f.write(content)
                
                # استخراج الخطوط (Webfonts)
                elif '/webfonts/' in file:
                    filename = os.path.basename(file)
                    if filename:
                        content = zip_ref.read(file)
                        with open(os.path.join(webfonts_dir, filename), 'wb') as f:
                            f.write(content)
            
        print(f"✅ تم تحميل الأيقونات بنجاح في المجلد: {icon_dir}")
        print("💡 تم ربط ملفات HTML بالأيقونات المحلية بنجاح.")
        
    except Exception as e:
        print(f"❌ حدث خطأ أثناء التحميل: {e}")
        if "SSL" in str(e):
            print("تلميح: يبدو أن هناك مشكلة في شهادات SSL. حاول تحديث Python.")

if __name__ == "__main__":
    # ضبط الترميز للكونسول لدعم العربية
    if sys.platform == "win32":
        os.system('chcp 65001 >nul')
    download_icons()
    input("\nاضغط Enter للخروج...")