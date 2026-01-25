# مجلد البيانات الجغرافية

## الملفات المطلوبة

### ملف الشيب فايل الخاص بالمياه الجوفية:
- `groundwater.shp` - الملف الرئيسي
- `groundwater.shx` - ملف الفهرس
- `groundwater.dbf` - ملف قاعدة البيانات
- `groundwater.prj` - ملف الإسقاط

### تحويل الشيب فايل إلى GeoJSON:
لاستخدام الشيب فايل في الموقع، يجب تحويله إلى تنسيق GeoJSON:

1. استخدم أداة مثل QGIS أو أدوات أونلاين لتحويل الشيب فايل
2. احفظ الملف باسم `groundwater.geojson`
3. تأكد من أن الملف يحتوي على الخصائص التالية:
   - `probability`: مستوى الاحتمالية (very-high, high, medium, low, very-low)
   - `level`: النص العربي لمستوى الاحتمالية

### مثال على هيكل البيانات:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "probability": "very-high",
        "level": "احتمال عالي جداً"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      }
    }
  ]
}
```

### استخدام البيانات:
بعد إضافة ملف `groundwater.geojson`، يمكنك تحميله في الموقع باستخدام:
```javascript
loadShapefile('data/groundwater.geojson');
```