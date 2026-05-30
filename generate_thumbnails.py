import os
import sys
import subprocess

# ضبط ترميز الكونسول لدعم العربية فوراً
if sys.platform == "win32":
    os.system('chcp 65001 >nul')
    # إعادة ضبط الترميز للمخرجات لتجنب أخطاء Unicode
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

# التأكد من تثبيت مكتبة Pillow
try:
    from PIL import Image
except ImportError:
    print("⚠️ مكتبة Pillow غير مثبتة. جاري التثبيت...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        print("✅ تم تثبيت Pillow بنجاح!")
        from PIL import Image
    except Exception as e:
        print(f"❌ فشل تثبيت المكتبة تلقائياً: {e}")
        print("يرجى فتح موجه الأوامر (CMD) وتشغيل: pip install Pillow")
        input("اضغط Enter للخروج...")
        sys.exit(1)

def generate_thumbnails():
    # إعدادات المسارات
    current_dir = os.path.dirname(os.path.abspath(__file__))
    source_dir = os.path.join(current_dir, 'images')
    thumb_dir = os.path.join(source_dir, 'thumbnails')
    
    # العرض المطلوب للصورة المصغرة (بكسل)
    max_width = 400
    
    # إنشاء مجلد المصغرات إذا لم يكن موجوداً
    if not os.path.exists(thumb_dir):
        os.makedirs(thumb_dir)
        print(f"✅ تم إنشاء مجلد الصور المصغرة: {thumb_dir}")

    # صيغ الصور المدعومة
    valid_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.bmp'}
    
    count = 0
    
    print("🔄 جاري فحص الصور ومعالجتها...")
    
    if not os.path.exists(source_dir):
        print(f"❌ لم يتم العثور على مجلد الصور: {source_dir}")
        return

    for filename in os.listdir(source_dir):
        file_path = os.path.join(source_dir, filename)
        
        # تخطي المجلدات والملفات غير الصور
        if os.path.isdir(file_path):
            continue
            
        ext = os.path.splitext(filename)[1].lower()
        if ext not in valid_extensions:
            continue
            
        thumb_path = os.path.join(thumb_dir, filename)
        
        # تخطي إذا كانت الصورة المصغرة موجودة بالفعل
        if os.path.exists(thumb_path):
            continue
            
        try:
            with Image.open(file_path) as img:
                # حساب الارتفاع الجديد للحفاظ على الأبعاد
                w_percent = (max_width / float(img.size[0]))
                h_size = int((float(img.size[1]) * float(w_percent)))
                
                # تغيير الحجم بدقة عالية
                img = img.resize((max_width, h_size), Image.Resampling.LANCZOS)
                
                # حفظ الصورة المصغرة
                img.save(thumb_path)
                print(f"✅ تم إنشاء مصغرة: {filename}")
                count += 1
        except Exception as e:
            print(f"❌ خطأ في معالجة {filename}: {e}")

    if count > 0:
        print(f"\n✨ تم إنشاء {count} صورة مصغرة بنجاح!")
    else:
        print("\n✨ جميع الصور المصغرة موجودة ومحدثة.")

if __name__ == "__main__":
    generate_thumbnails()
    input("\nاضغط Enter للخروج...")