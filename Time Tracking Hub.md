# Time Tracking Hub
## تطبيق إدارة الوقت والمهام الشامل (Time Tracking Hub)

```
- git history commands
**create a new repository on the command line:**
echo "# Time_Tracking_Hub" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/nasermaher/Time_Tracking_Hub.git
git push -u origin main

**or push an existing repository from the command line:**
git remote add origin https://github.com/nasermaher/Time_Tracking_Hub.git
git branch -M main
git push -u origin main
```

### نَظْرَة عامة على التطبيق
قم بتطوير تطبيق ويب تفاعلي لتتبع الوقت وإدارة المهام باستخدام
**Flask, HTML, CSS, JavaScript, JSON, MySQL** مع التصميم المظلم الحديث.

---

## المتطلبات التقنية

### Backend Stack
- **Flask** (Python Web Framework)
- **MySQL** لقاعدة البيانات
- **SQLAlchemy** ORM
- **Flask-CORS** للـ API
- **JSON** لتبادل البيانات

### Frontend Stack
- **HTML5** هيكل الصفحات
- **CSS3** تصميم مظلم متجاوب
- **JavaScript** (Vanilla JS) للتفاعل
- **Font Awesome** للأيقونات
- **Google Fonts** للخطوط

---

## هيكل قاعدة البيانات

### جداول MySQL المطلوبة:

```sql
-- جدول المشاريع
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- جدول المشاريع الفرعية
CREATE TABLE subprojects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- جدول المهام
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('active', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);

-- جدول تتبع الوقت
CREATE TABLE time_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT,
    subproject_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    entry_type ENUM('work', 'meeting') DEFAULT 'work',
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration_seconds INT DEFAULT 0,
    is_manual BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (subproject_id) REFERENCES subprojects(id)
);
```

---

## الواجهات المطلوبة

### 1. الصفحة الرئيسية - Timer Dashboard
**المسار:** `/`

#### العناصر الأساسية:
- **شريط جانبي للتنقل** يحتوي على:
  - Timer (أيقونة ساعة)
  - Tasks (أيقونة مهام)
  - Projects (أيقونة مجلد)
  - Reports (أيقونة تقارير)

- **منطقة الموقت الرئيسية:**
  - عداد الوقت الرقمي: `00:00:00`
  - حقل "What are you working on?"
  - قوائم منسدلة للمشروع والمشروع الفرعي
  - أزرار: `Start Work`, `Start Meeting`, `Log manual entry`

- **جدول زمني Timeline:**
  - عرض إدخالات اليوم الحالي
  - تصنيف كل إدخال (WORK/MEETING)
  - عرض المدة الزمنية لكل إدخال
  - أزرار تحرير وحذف لكل إدخال

#### المواصفات التقنية:
```javascript
// وظائف JavaScript مطلوبة
- startTimer() // بدء الموقت
- stopTimer() // إيقاف الموقت
- pauseTimer() // إيقاف مؤقت
- logManualEntry() // إدخال يدوي
- loadProjects() // تحميل المشاريع
- updateTimeline() // تحديث الجدول الزمني
```

### 2. صفحة التقارير - Reports
**المسار:** `/reports`

#### المكونات:
- **فلاتر التقارير:**
  - تاريخ البداية (mm/dd/yyyy)
  - تاريخ النهاية (mm/dd/yyyy)
  - فلتر المشروعات
  - فلتر المشروعات الفرعية

- **إحصائيات سريعة:**
  - إجمالي المدة الزمنية
  - عدد الإدخالات
  - عدد المشروعات/المشروعات الفرعية

- **تحليل المشروعات:**
  - توزيع الوقت حسب المشروع
  - قائمة مفصلة بالإدخالات الأخيرة

- **تصدير البيانات:**
  - زر "Export CSV"

### 3. صفحة إدارة المشروعات - Projects
**المسار:** `/projects`

#### الوظائف:
- **إضافة مشروع جديد:**
  - حقل إدخال النص
  - زر "Add Project"

- **إضافة مشروع فرعي:**
  - قائمة منسدلة لاختيار المشروع الرئيس
  - حقل النص للمشروع الفرعي
  - زر "Add Subproject"

- **إدارة المشروعات الموجودة:**
  - عرض المشروعات مع المشروعات الفرعية
  - أزرار: Rename, Delete Project
  - أزرار للمشاريع الفرعية: Rename, Remove

### 4. صفحة إدارة المهام - Tasks
**المسار:** `/tasks`

#### المميزات:
- **إضافة مهمة جديدة:**
  - حقل "Add a new task"
  - زر "Add Task"

- **قائمة المهام:**
  - عرض المهام النشطة والمكتملة
  - checkbox للمهام المكتملة
  - حالة المهمة (COMPLETED TASK / ACTIVE TASK)
  - زر حذف لكل مهمة

---

## تصميم الواجهة

### نمط الألوان:
```css
:root {
  --primary-bg: #1a1f2e;
  --secondary-bg: #252a3a;
  --card-bg: #2d3748;
  --accent-color: #4fd1c7;
  --secondary-accent: #f6ad55;
  --text-primary: #ffffff;
  --text-secondary: #a0aec0;
  --border-color: #4a5568;
}
```

### المواصفات البصرية:
- **تصميم مظلم كامل**
- **بطاقات مدورة الزوايا** (border-radius: 12px)
- **ظلال ناعمة** للعناصر
- **أزرار ملونة** مع تأثيرات hover
- **تصميم متجاوب** للأجهزة المختلفة
- **خطوط حديثة** (Inter أو Roboto)

---

## APIs المطلوبة

### مسارات Flask:

```python
# Timer APIs
@app.route('/api/timer/start', methods=['POST'])
@app.route('/api/timer/stop', methods=['POST'])
@app.route('/api/timer/pause', methods=['POST'])

# Projects APIs
@app.route('/api/projects', methods=['GET', 'POST'])
@app.route('/api/projects/<id>', methods=['PUT', 'DELETE'])
@app.route('/api/subprojects', methods=['GET', 'POST'])
@app.route('/api/subprojects/<id>', methods=['PUT', 'DELETE'])

# Tasks APIs
@app.route('/api/tasks', methods=['GET', 'POST'])
@app.route('/api/tasks/<id>', methods=['PUT', 'DELETE'])
@app.route('/api/tasks/<id>/toggle', methods=['PUT'])

# Time Entries APIs
@app.route('/api/time-entries', methods=['GET', 'POST'])
@app.route('/api/time-entries/<id>', methods=['PUT', 'DELETE'])

# Reports APIs
@app.route('/api/reports', methods=['GET'])
@app.route('/api/reports/export', methods=['GET'])
```

---

## المميزات التفاعلية

### الموقت الحي:
- تحديث العداد كل ثانية
- حفظ حالة الموقت في المتصفح
- صوت تنبيه عند البداية/النهاية

### التحديث التلقائي:
- تحديث الجدول الزمني تلقائيًا
- حفظ البيانات في أثناء الكتابة
- عرض إشعارات للعمليات الناجحة/الفاشلة

### التجربة التفاعلية:
- تأثيرات الانتقال الناعمة
- تغيير الألوان عند التفاعل
- رسائل تأكيد للعمليات المهمة

---

## متطلبات الأداء

### السرعة:
- تحميل الصفحة < 2 ثانية
- استجابة API < 500ms
- تحديث UI فوري

### قابلية الاستخدام:
- تصميم متجاوب للجوال والحاسوب
- اختصارات لوحة المفاتيح
- حفظ نسخة احتياطية من البيانات محليًا 

---

## ملفات المشروع المطلوبة

```
time_tracking/
├── app.py                 # تطبيق Flask الرئيسي
├── models.py              # نماذج قاعدة البيانات
├── config.py              # إعدادات التطبيق
├── requirements.txt       # مكتبات Python
├── static/
│   ├── css/
│   │   ├── style.css     # التصميم الرئيسي
│   │   └── components.css # تصميم المكونات
│   ├── js/
│   │   ├── app.js        # JavaScript الرئيسي
│   │   ├── timer.js      # وظائف الموقت
│   │   ├── projects.js   # إدارة المشاريع
│   │   └── tasks.js      # إدارة المهام
│   └── images/
│       └── logo.png      # شعار التطبيق
├── templates/
│   ├── base.html         # القالب الأساسي
│   ├── timer.html        # صفحة الموقت
│   ├── reports.html      # صفحة التقارير
│   ├── projects.html     # صفحة المشاريع
│   └── tasks.html        # صفحة المهام
└── database/
    └── schema.sql        # هيكل قاعدة البيانات
```

---

## التشغيل والتطوير

### خطوات التشغيل:
1. إنشاء قاعدة البيانات MySQL
2. تثبيت المتطلبات: `pip install -r requirements.txt`
3. تشغيل التطبيق: `python app.py`
4. الوصول عبر: `http://localhost:5000`

### البيئة التطوير:
- Python 3.8+
- MySQL 8.0+
- متصفح حديث يدعم ES6

---

**ملاحظة:** التطبيق يجب أن يكون مطابقًا تمامًا للتصميم المعروض في الصور، مع الحفاظ على نفس الألوان والتخطيط والوظائف.