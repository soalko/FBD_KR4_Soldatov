export const validateDeadline = (deadline, notes) => {
    const errors = {};

    if (!deadline) {
        errors.deadline = 'Пожалуйста, выберите дату дедлайна';
    } else if (deadline < new Date()) {
        errors.deadline = 'Дедлайн не может быть в прошлом';
    }

    if (notes && notes.length > 500) {
        errors.notes = 'Примечания не могут превышать 500 символов';
    }

    return errors;
};

export const validateTechnology = (technology) => {
    const errors = {};

    if (!technology.title || technology.title.trim() === '') {
        errors.title = 'Название технологии обязательно';
    } else if (technology.title.length > 100) {
        errors.title = 'Название не может превышать 100 символов';
    }

    if (!technology.description || technology.description.trim() === '') {
        errors.description = 'Описание обязательно';
    } else if (technology.description.length > 500) {
        errors.description = 'Описание не может превышать 500 символов';
    }

    const validStatuses = ['completed', 'in-progress', 'not-started'];
    if (!validStatuses.includes(technology.status)) {
        errors.status = 'Неверный статус';
    }

    return errors;
};

export const validateTechnologyForm = (formData) => {
    const errors = {};

    // Валидация названия
    if (!formData.title || formData.title.trim() === '') {
        errors.title = 'Название технологии обязательно';
    } else if (formData.title.trim().length < 2) {
        errors.title = 'Название должно содержать минимум 2 символа';
    } else if (formData.title.length > 100) {
        errors.title = 'Название не может превышать 100 символов';
    }

    // Валидация описания
    if (!formData.description || formData.description.trim() === '') {
        errors.description = 'Описание обязательно';
    } else if (formData.description.trim().length < 10) {
        errors.description = 'Описание должно содержать минимум 10 символов';
    } else if (formData.description.length > 500) {
        errors.description = 'Описание не может превышать 500 символов';
    }

    // Валидация статуса
    const validStatuses = ['completed', 'in-progress', 'not-started'];
    if (!validStatuses.includes(formData.status)) {
        errors.status = 'Неверный статус';
    }

    // Валидация тегов
    if (formData.tags && formData.tags.length > 10) {
        errors.tags = 'Максимальное количество тегов - 10';
    } else if (formData.tags) {
        for (const tag of formData.tags) {
            if (tag.length > 20) {
                errors.tags = 'Тег не может превышать 20 символов';
                break;
            }
            if (!/^[a-zA-Zа-яА-Я0-9\s\-_]+$/.test(tag)) {
                errors.tags = 'Тег может содержать только буквы, цифры, пробелы, дефисы и подчеркивания';
                break;
            }
        }
    }

    // Валидация дедлайна
    if (formData.deadline && formData.deadline < new Date()) {
        errors.deadline = 'Дедлайн не может быть в прошлом';
    }

    // Валидация приоритета
    if (formData.priority !== undefined && (formData.priority < 0 || formData.priority > 2)) {
        errors.priority = 'Неверное значение приоритета';
    }

    return errors;
};

export const validateDuplicateTechnology = (technologies, newTechnology) => {
    const errors = {};

    // Проверка на дублирование названия (регистронезависимо)
    const existingTitles = technologies.map(tech => tech.title.toLowerCase().trim());
    if (existingTitles.includes(newTechnology.title.toLowerCase().trim())) {
        errors.title = 'Технология с таким названием уже существует';
    }

    // Проверка на похожие названия (Levenshtein distance < 3)
    const similarityThreshold = 3;
    for (const tech of technologies) {
        if (calculateLevenshteinDistance(
            tech.title.toLowerCase().trim(),
            newTechnology.title.toLowerCase().trim()
        ) < similarityThreshold) {
            errors.title = 'Похожая технология уже существует';
            break;
        }
    }

    return errors;
};

// Функция для расчета расстояния Левенштейна
const calculateLevenshteinDistance = (a, b) => {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // замена
                    matrix[i][j - 1] + 1,     // вставка
                    matrix[i - 1][j] + 1      // удаление
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

// Функция для проверки сложности пароля (если понадобится)
export const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push('Пароль должен содержать минимум 8 символов');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Пароль должен содержать хотя бы одну заглавную букву');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Пароль должен содержать хотя бы одну строчную букву');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Пароль должен содержать хотя бы одну цифру');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Пароль должен содержать хотя бы один специальный символ');
    }

    return errors;
};

// Функция для проверки email
export const validateEmail = (email) => {
    const errors = [];

    if (!email) {
        errors.push('Email обязателен');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Некорректный формат email');
    }

    return errors;
};

// Функция для проверки URL
export const validateUrl = (url) => {
    const errors = [];

    if (!url) {
        errors.push('URL обязателен');
    } else {
        try {
            new URL(url);
        } catch (error) {
            errors.push('Некорректный формат URL');
        }
    }

    return errors;
};

// Функция для проверки номера телефона
export const validatePhone = (phone) => {
    const errors = [];

    if (!phone) {
        errors.push('Телефон обязателен');
    } else if (!/^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s\-()]/g, ''))) {
        errors.push('Некорректный формат телефона');
    }

    return errors;
};

// Валидация даты
export const validateDate = (date, minDate = null, maxDate = null) => {
    const errors = [];

    if (!date) {
        errors.push('Дата обязательна');
    } else {
        const dateObj = new Date(date);

        if (isNaN(dateObj.getTime())) {
            errors.push('Некорректная дата');
        }

        if (minDate && dateObj < new Date(minDate)) {
            errors.push(`Дата не может быть раньше ${new Date(minDate).toLocaleDateString()}`);
        }

        if (maxDate && dateObj > new Date(maxDate)) {
            errors.push(`Дата не может быть позже ${new Date(maxDate).toLocaleDateString()}`);
        }
    }

    return errors;
};