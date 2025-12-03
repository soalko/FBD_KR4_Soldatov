// Сервис для работы с localStorage
const STORAGE_KEYS = {
    TECHNOLOGIES: 'technologiesData',
    SETTINGS: 'roadmap-settings',
    THEME: 'themeMode',
};

class StorageService {
    // Сохранение данных
    static save(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
            return true;
        } catch (error) {
            console.error(`Error saving to localStorage (${key}):`, error);
            return false;
        }
    }

    // Загрузка данных
    static load(key, defaultValue = null) {
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return defaultValue;
            }
            return JSON.parse(serializedData);
        } catch (error) {
            console.error(`Error loading from localStorage (${key}):`, error);
            return defaultValue;
        }
    }

    // Удаление данных
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing from localStorage (${key}):`, error);
            return false;
        }
    }

    // Очистка всех данных
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // Проверка наличия данных
    static has(key) {
        return localStorage.getItem(key) !== null;
    }

    // Получение всех ключей
    static getAllKeys() {
        return Object.keys(localStorage);
    }

    // Специфичные методы для нашего приложения

    static saveTechnologies(technologies) {
        return this.save(STORAGE_KEYS.TECHNOLOGIES, technologies);
    }

    static loadTechnologies(defaultValue = []) {
        return this.load(STORAGE_KEYS.TECHNOLOGIES, defaultValue);
    }

    static saveSettings(settings) {
        return this.save(STORAGE_KEYS.SETTINGS, settings);
    }

    static loadSettings(defaultValue = {}) {
        return this.load(STORAGE_KEYS.SETTINGS, defaultValue);
    }

    static saveTheme(theme) {
        return this.save(STORAGE_KEYS.THEME, theme);
    }

    static loadTheme(defaultValue = 'light') {
        return this.load(STORAGE_KEYS.THEME, defaultValue);
    }

    // Экспорт всех данных приложения
    static exportAllData() {
        const allData = {};
        Object.values(STORAGE_KEYS).forEach(key => {
            allData[key] = this.load(key);
        });
        return allData;
    }

    // Импорт данных
    static importData(data) {
        try {
            Object.keys(data).forEach(key => {
                if (Object.values(STORAGE_KEYS).includes(key)) {
                    this.save(key, data[key]);
                }
            });
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Получение информации о хранилище
    static getStorageInfo() {
        const totalBytes = JSON.stringify(localStorage).length;
        const keys = this.getAllKeys();

        const infoByKey = {};
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            infoByKey[key] = {
                size: value ? value.length * 2 : 0, // Байты
                hasValue: value !== null,
            };
        });

        return {
            totalBytes,
            totalKeys: keys.length,
            keys,
            infoByKey,
        };
    }

    // Резервное копирование с меткой времени
    static createBackup() {
        const backupData = this.exportAllData();
        const backupKey = `backup_${Date.now()}`;
        this.save(backupKey, {
            timestamp: new Date().toISOString(),
            data: backupData,
        });
        return backupKey;
    }

    // Восстановление из резервной копии
    static restoreFromBackup(backupKey) {
        const backup = this.load(backupKey);
        if (backup && backup.data) {
            return this.importData(backup.data);
        }
        return false;
    }

    // Очистка устаревших резервных копий
    static cleanOldBackups(maxAgeDays = 7) {
        const keys = this.getAllKeys();
        const now = Date.now();
        const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

        keys.forEach(key => {
            if (key.startsWith('backup_')) {
                const backup = this.load(key);
                if (backup && backup.timestamp) {
                    const backupTime = new Date(backup.timestamp).getTime();
                    if (now - backupTime > maxAge) {
                        this.remove(key);
                    }
                }
            }
        });
    }
}

export default StorageService;
export { STORAGE_KEYS };