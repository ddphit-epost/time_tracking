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
