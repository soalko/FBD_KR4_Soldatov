import { useState, useEffect, useCallback } from 'react';
import StorageService from '../services/storage';

// Начальные данные по умолчанию
const defaultTechnologies = [
    {
        id: 1,
        title: 'React Components',
        description: 'Изучение базовых компонентов React и их жизненного цикла',
        status: 'completed',
        deadline: '2024-03-15',
        tags: ['Frontend', 'React'],
        createdAt: '2024-01-15',
        priority: 0,
    },
    {
        id: 2,
        title: 'JSX Syntax',
        description: 'Освоение синтаксиса JSX и его особенностей',
        status: 'in-progress',
        deadline: '2024-04-20',
        tags: ['Frontend', 'JavaScript'],
        createdAt: '2024-02-01',
        priority: 1,
    },
    {
        id: 3,
        title: 'State Management',
        description: 'Работа с состоянием компонентов и управление данными',
        status: 'not-started',
        deadline: null,
        tags: ['Frontend', 'State'],
        createdAt: '2024-02-15',
        priority: 0,
    },
    {
        id: 4,
        title: 'React Hooks',
        description: 'Использование хуков useState, useEffect, useMemo и других',
        status: 'in-progress',
        deadline: '2024-05-10',
        tags: ['Frontend', 'React'],
        createdAt: '2024-02-20',
        priority: 2,
    },
    {
        id: 5,
        title: 'React Router v6',
        description: 'Навигация в React приложениях с использованием React Router',
        status: 'not-started',
        deadline: null,
        tags: ['Routing', 'React'],
        createdAt: '2024-03-01',
        priority: 0,
    },
    {
        id: 6,
        title: 'Context API',
        description: 'Управление глобальным состоянием приложения',
        status: 'completed',
        deadline: '2024-02-28',
        tags: ['State', 'React'],
        createdAt: '2024-01-20',
        priority: 0,
    },
    {
        id: 7,
        title: 'Custom Hooks',
        description: 'Создание собственных переиспользуемых хуков',
        status: 'not-started',
        deadline: null,
        tags: ['React', 'Advanced'],
        createdAt: '2024-03-05',
        priority: 1,
    },
    {
        id: 8,
        title: 'Performance Optimization',
        description: 'Оптимизация производительности React приложений',
        status: 'in-progress',
        deadline: '2024-06-15',
        tags: ['Performance', 'React'],
        createdAt: '2024-02-25',
        priority: 0,
    },
    {
        id: 9,
        title: 'Next.js Framework',
        description: 'Изучение фреймворка Next.js для серверного рендеринга',
        status: 'not-started',
        deadline: null,
        tags: ['Framework', 'React'],
        createdAt: '2024-03-10',
        priority: 0,
    },
    {
        id: 10,
        title: 'TypeScript with React',
        description: 'Использование TypeScript в React проектах',
        status: 'in-progress',
        deadline: '2024-05-30',
        tags: ['TypeScript', 'React'],
        createdAt: '2024-02-28',
        priority: 3,
    },
];

const useTechnologies = () => {
    const [technologies, setTechnologies] = useState(() => {
        const saved = StorageService.loadTechnologies();
        return saved || defaultTechnologies;
    });

    const [isLoading, setIsLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [version, setVersion] = useState(0); // Для принудительного обновления

    // Сохранение в localStorage
    const saveTechnologies = useCallback((techArray) => {
        StorageService.saveTechnologies(techArray);
        setLastSaved(new Date());
        setVersion(v => v + 1); // Увеличиваем версию для триггера обновления
    }, []);

    // Автоматическое сохранение при изменении
    useEffect(() => {
        if (technologies.length > 0) {
            saveTechnologies(technologies);
        }
    }, [technologies, saveTechnologies]);

    // Добавить технологию
    const addTechnology = useCallback((tech) => {
        const newId = Math.max(0, ...technologies.map(t => t.id)) + 1;
        const newTech = {
            ...tech,
            id: newId,
            createdAt: new Date().toISOString().split('T')[0],
            status: tech.status || 'not-started',
            tags: tech.tags || [],
            notes: tech.notes || '',
            priority: tech.priority || 0,
        };

        setTechnologies(prev => [newTech, ...prev]);
        return newTech;
    }, [technologies]);

    // Обновить технологию
    const updateTechnology = useCallback((id, updates) => {
        setTechnologies(prev => prev.map(tech =>
            tech.id === id ? {
                ...tech,
                ...updates,
                updatedAt: new Date().toISOString(),
                version: (tech.version || 0) + 1, // Увеличиваем версию конкретной технологии
            } : tech
        ));
    }, []);

    // Удалить технологию
    const deleteTechnology = useCallback((id) => {
        setTechnologies(prev => prev.filter(tech => tech.id !== id));
    }, []);

    // Изменить статус
    const updateStatus = useCallback((id, status) => {
        updateTechnology(id, {
            status,
            ...(status === 'completed' && { completedAt: new Date().toISOString() })
        });
    }, [updateTechnology]);

    // Изменить приоритет
    const togglePriority = useCallback((id, isPriority) => {
        updateTechnology(id, {
            priority: isPriority ? 1 : 0,
        });
    }, [updateTechnology]);

    // Массовое изменение статуса
    const bulkUpdateStatus = useCallback((ids, status) => {
        setTechnologies(prev => prev.map(tech =>
            ids.includes(tech.id)
                ? {
                    ...tech,
                    status,
                    updatedAt: new Date().toISOString(),
                    version: (tech.version || 0) + 1,
                    ...(status === 'completed' && { completedAt: new Date().toISOString() })
                }
                : tech
        ));
    }, []);

    // Сортировка технологий (приоритетные сверху)
    const getSortedTechnologies = useCallback(() => {
        return [...technologies].sort((a, b) => {
            // Сначала по приоритету (высокий приоритет сверху)
            if (b.priority !== a.priority) {
                return b.priority - a.priority;
            }

            // Затем по статусу (в процессе → не начато → завершено)
            const statusOrder = { 'in-progress': 0, 'not-started': 1, 'completed': 2 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }

            // Затем по дедлайну
            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            }

            // Затем по дате создания
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [technologies]);

    // Сброс к начальным данным
    const resetToDefault = useCallback(() => {
        setTechnologies(defaultTechnologies);
        saveTechnologies(defaultTechnologies);
    }, [saveTechnologies]);

    // Получить статистику
    const getStatistics = useCallback(() => {
        const total = technologies.length;
        const completed = technologies.filter(t => t.status === 'completed').length;
        const inProgress = technologies.filter(t => t.status === 'in-progress').length;
        const notStarted = technologies.filter(t => t.status === 'not-started').length;

        const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Расчет по тегам
        const tagStats = {};
        technologies.forEach(tech => {
            (tech.tags || []).forEach(tag => {
                if (!tagStats[tag]) {
                    tagStats[tag] = { total: 0, completed: 0, inProgress: 0, notStarted: 0 };
                }
                tagStats[tag].total += 1;
                tagStats[tag][tech.status] += 1;
            });
        });

        // Расчет по месяцам
        const monthlyStats = {};
        technologies.forEach(tech => {
            if (tech.deadline) {
                const month = new Date(tech.deadline).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
                if (!monthlyStats[month]) {
                    monthlyStats[month] = { total: 0, completed: 0, inProgress: 0, notStarted: 0 };
                }
                monthlyStats[month].total += 1;
                monthlyStats[month][tech.status] += 1;
            }
        });

        // Прогресс во времени
        const timelineProgress = technologies
            .filter(t => t.createdAt)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .reduce((acc, tech, index) => {
                const prevCompleted = acc.length > 0 ? acc[acc.length - 1].completed : 0;
                const completed = prevCompleted + (tech.status === 'completed' ? 1 : 0);
                const date = tech.createdAt.split('T')[0];

                acc.push({
                    date,
                    index,
                    completed,
                    percentage: Math.round((completed / (index + 1)) * 100),
                    technology: tech.title,
                });

                return acc;
            }, []);

        return {
            total,
            completed,
            inProgress,
            notStarted,
            progressPercentage,
            tagStats,
            monthlyStats,
            timelineProgress,
            lastUpdated: lastSaved,
            version, // Добавляем версию для отслеживания изменений
        };
    }, [technologies, lastSaved, version]);

    // Подписка на изменения в localStorage (для синхронизации между вкладками)
    useEffect(() => {
        const handleStorageChange = () => {
            const savedData = StorageService.loadTechnologies(defaultTechnologies);
            if (JSON.stringify(savedData) !== JSON.stringify(technologies)) {
                setTechnologies(savedData);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [technologies]);

    // Возвращаем сортированные технологии
    const sortedTechnologies = getSortedTechnologies();

    return {
        technologies: sortedTechnologies,
        rawTechnologies: technologies,
        isLoading,
        lastSaved,
        version,

        // Методы
        addTechnology,
        updateTechnology,
        deleteTechnology,
        updateStatus,
        togglePriority,
        bulkUpdateStatus,
        resetToDefault,
        getStatistics,

        // Экспорт/импорт
        exportData: () => StorageService.exportAllData(),
        importData: (data) => {
            if (StorageService.importData(data)) {
                const savedData = StorageService.loadTechnologies(defaultTechnologies);
                setTechnologies(savedData);
                return true;
            }
            return false;
        },
    };
};

export default useTechnologies;