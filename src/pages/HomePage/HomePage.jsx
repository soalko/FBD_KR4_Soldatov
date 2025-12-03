import React, { useState, useCallback, useEffect } from 'react';
import {
    Grid,
    Box,
    Typography,
    Paper,
    Container,
    Fab,
    Tooltip,
    Zoom,
    Slide,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Add,
    FilterList,
    Search as SearchIcon,
    Save,
} from '@mui/icons-material';
import TechnologyCard from '../../components/TechnologyCard/TechnologyCard';
import ProgressHeader from '../../components/ProgressHeader/ProgressHeader';
import QuickActions from '../../components/QuickActions/QuickActions';
import SearchBar from '../../components/SearchBar/SearchBar';
import TechnologyFilter from '../../components/TechnologyFilter/TechnologyFilter';
import BulkEditPanel from '../../components/BulkEditPanel/BulkEditPanel';
import DeadlineForm from '../../components/DeadlineForm/DeadlineForm';

// Начальные данные по умолчанию
const defaultTechnologies = [
    { id: 1, title: 'React Components', description: 'Изучение базовых компонентов React и их жизненного цикла', status: 'completed', deadline: '2024-03-15', tags: ['Frontend', 'React'] },
    { id: 2, title: 'JSX Syntax', description: 'Освоение синтаксиса JSX и его особенностей', status: 'in-progress', deadline: '2024-04-20', tags: ['Frontend', 'JavaScript'] },
    { id: 3, title: 'State Management', description: 'Работа с состоянием компонентов и управление данными', status: 'not-started', deadline: null, tags: ['Frontend', 'State'] },
    { id: 4, title: 'React Hooks', description: 'Использование хуков useState, useEffect, useMemo и других', status: 'in-progress', deadline: '2024-05-10', tags: ['Frontend', 'React'] },
    { id: 5, title: 'React Router v6', description: 'Навигация в React приложениях с использованием React Router', status: 'not-started', deadline: null, tags: ['Routing', 'React'] },
    { id: 6, title: 'Context API', description: 'Управление глобальным состоянием приложения', status: 'completed', deadline: '2024-02-28', tags: ['State', 'React'] },
    { id: 7, title: 'Custom Hooks', description: 'Создание собственных переиспользуемых хуков', status: 'not-started', deadline: null, tags: ['React', 'Advanced'] },
    { id: 8, title: 'Performance Optimization', description: 'Оптимизация производительности React приложений', status: 'in-progress', deadline: '2024-06-15', tags: ['Performance', 'React'] },
    { id: 9, title: 'Next.js Framework', description: 'Изучение фреймворка Next.js для серверного рендеринга', status: 'not-started', deadline: null, tags: ['Framework', 'React'] },
    { id: 10, title: 'TypeScript with React', description: 'Использование TypeScript в React проектах', status: 'in-progress', deadline: '2024-05-30', tags: ['TypeScript', 'React'] },
];

const HomePage = ({ addNotification }) => {
    // Загрузка данных из localStorage при инициализации
    const [technologies, setTechnologies] = useState(() => {
        const savedData = localStorage.getItem('technologiesData');
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (error) {
                console.error('Error parsing saved data:', error);
                return defaultTechnologies;
            }
        }
        return defaultTechnologies;
    });

    const [filteredTech, setFilteredTech] = useState(technologies);
    const [filter, setFilter] = useState('all');
    const [searchResults, setSearchResults] = useState(technologies);
    const [selectedTechIds, setSelectedTechIds] = useState([]);
    const [selectedForDeadline, setSelectedForDeadline] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [saveStatus, setSaveStatus] = useState({ open: false, message: '', severity: 'success' });

    // Сохранение данных в localStorage при изменении
    useEffect(() => {
        localStorage.setItem('technologiesData', JSON.stringify(technologies));
    }, [technologies]);

    // Автоматическое сохранение с уведомлением
    const saveToStorage = (action = 'автосохранение') => {
        localStorage.setItem('technologiesData', JSON.stringify(technologies));
        setSaveStatus({
            open: true,
            message: `Данные сохранены (${action})`,
            severity: 'success'
        });
    };

    // Фильтрация технологий
    const applyFilter = useCallback((techList, filterType) => {
        if (filterType === 'all') return techList;
        return techList.filter(tech => tech.status === filterType);
    }, []);

    // Обработчик изменения статуса
    const handleStatusChange = (id, newStatus) => {
        setTechnologies(prev => {
            const updated = prev.map(tech =>
                tech.id === id ? { ...tech, status: newStatus } : tech
            );
            return updated;
        });
        addNotification(`Статус технологии "${technologies.find(t => t.id === id)?.title}" изменен на "${newStatus}"`, 'success');
        saveToStorage('изменение статуса');
    };

    // Массовое изменение статуса
    const handleBulkStatusChange = (ids, newStatus) => {
        setTechnologies(prev => {
            const updated = prev.map(tech =>
                ids.includes(tech.id) ? { ...tech, status: newStatus } : tech
            );
            return updated;
        });
        setSelectedTechIds([]);
        saveToStorage('массовое изменение');
    };

    // Обновление всех статусов
    const handleUpdateAllStatuses = (status) => {
        setTechnologies(prev => {
            const updated = prev.map(tech => ({ ...tech, status }));
            return updated;
        });
        addNotification(`Все технологии отмечены как "${status}"`, 'info');
        saveToStorage('обновление всех статусов');
    };

    // Случайный выбор
    const handleRandomSelect = (id) => {
        const randomTech = technologies.find(t => t.id === id);
        setSelectedTechIds([id]);
        addNotification(`Следующая технология выбрана случайно: "${randomTech?.title}"`, 'info');
    };

    // Экспорт данных
    const handleExportData = () => {
        const dataStr = JSON.stringify(technologies, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `technology-roadmap-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        addNotification('Данные успешно экспортированы', 'success');
    };

    // Импорт данных
    const handleImportData = (importedData) => {
        try {
            if (!Array.isArray(importedData)) {
                throw new Error('Invalid data format');
            }

            const validatedData = importedData.map(item => ({
                id: item.id || Date.now() + Math.random(),
                title: item.title || 'Без названия',
                description: item.description || '',
                status: ['completed', 'in-progress', 'not-started'].includes(item.status)
                    ? item.status
                    : 'not-started',
                deadline: item.deadline || null,
                tags: item.tags || [],
                notes: item.notes || '',
            }));

            setTechnologies(validatedData);
            setFilteredTech(validatedData);
            setSearchResults(validatedData);
            addNotification(`Успешно импортировано ${validatedData.length} технологий`, 'success');
            saveToStorage('импорт данных');
        } catch (error) {
            addNotification('Ошибка при импорте данных: неверный формат файла', 'error');
        }
    };

    // Загрузка ресурсов
    const handleResourceLoad = async (id) => {
        // Имитация загрузки данных из API
        return new Promise(resolve => {
            setTimeout(() => {
                const tech = technologies.find(t => t.id === id);
                const resources = [
                    `Официальная документация по ${tech?.title}`,
                    'Практические задания и упражнения',
                    'Видео-курсы и туториалы',
                    'Примеры кода на GitHub',
                    'Сообщество и форумы для обсуждения',
                ];
                resolve(resources);
            }, 800);
        });
    };

    // Установка дедлайна
    const handleSetDeadline = async (id, deadline, notes) => {
        setTechnologies(prev => {
            const updated = prev.map(tech =>
                tech.id === id ? { ...tech, deadline, notes } : tech
            );
            return updated;
        });
        setSelectedForDeadline(null);
        addNotification(`Дедлайн установлен для технологии`, 'success');
        saveToStorage('установка дедлайна');
    };

    // Обработчик поиска
    const handleSearch = (results) => {
        setSearchResults(results);
        setFilteredTech(applyFilter(results, filter));
    };

    // Обработчик фильтра
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setFilteredTech(applyFilter(searchResults, newFilter));
    };

    // Обработчик выбора карточек
    const handleTechSelect = (id, event) => {
        if (event.ctrlKey || event.metaKey) {
            // Выбор нескольких элементов с Ctrl/Cmd
            setSelectedTechIds(prev => {
                if (prev.includes(id)) {
                    return prev.filter(techId => techId !== id);
                } else {
                    return [...prev, id];
                }
            });
        } else if (event.shiftKey && selectedTechIds.length > 0) {
            // Выбор диапазона с Shift
            const lastSelected = selectedTechIds[selectedTechIds.length - 1];
            const currentIndex = technologies.findIndex(t => t.id === id);
            const lastIndex = technologies.findIndex(t => t.id === lastSelected);

            const start = Math.min(currentIndex, lastIndex);
            const end = Math.max(currentIndex, lastIndex);

            const rangeIds = technologies
                .slice(start, end + 1)
                .map(t => t.id);

            setSelectedTechIds([...new Set([...selectedTechIds, ...rangeIds])]);
        } else {
            // Одиночный выбор
            setSelectedTechIds([id]);
        }
    };

    // Добавление новой технологии
    const handleAddTechnology = () => {
        const newId = Math.max(0, ...technologies.map(t => t.id)) + 1;
        const newTech = {
            id: newId,
            title: 'Новая технология',
            description: 'Добавьте описание технологии',
            status: 'not-started',
            deadline: null,
            tags: ['Новая'],
            notes: '',
        };

        setTechnologies(prev => [newTech, ...prev]);
        addNotification('Новая технология добавлена', 'success');
        saveToStorage('добавление технологии');
    };

    // Ручное сохранение
    const handleManualSave = () => {
        saveToStorage('ручное сохранение');
    };

    // Восстановление данных по умолчанию
    const handleResetData = () => {
        if (window.confirm('Вы уверены, что хотите сбросить все данные? Все текущие изменения будут потеряны.')) {
            setTechnologies(defaultTechnologies);
            setFilteredTech(defaultTechnologies);
            setSearchResults(defaultTechnologies);
            localStorage.setItem('technologiesData', JSON.stringify(defaultTechnologies));
            addNotification('Данные восстановлены до начального состояния', 'info');
        }
    };

    // Обработка изменений в карточке
    const handleCardUpdate = (id, updates) => {
        setTechnologies(prev => {
            const updated = prev.map(tech =>
                tech.id === id ? { ...tech, ...updates } : tech
            );
            return updated;
        });
        saveToStorage('обновление карточки');
    };

    // Обновление при изменении technologies
    useEffect(() => {
        setFilteredTech(applyFilter(searchResults, filter));
    }, [technologies, filter, searchResults, applyFilter]);

    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>
            <Box sx={{ mb: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
                            Дорожная карта технологий
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                            Отслеживайте прогресс изучения технологий и достигайте целей эффективно
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <ProgressHeader technologies={technologies} />

            <Box sx={{ mb: 4 }}>
                <QuickActions
                    technologies={technologies}
                    onUpdateAllStatuses={handleUpdateAllStatuses}
                    onRandomSelect={handleRandomSelect}
                    onExportData={handleExportData}
                    onImportData={handleImportData}
                    addNotification={addNotification}
                />
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={9}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h5" fontWeight="600">
                                Технологии ({filteredTech.length})
                            </Typography>

                            <Box display="flex" gap={1}>
                                <Tooltip title="Поиск">
                                    <Fab
                                        size="small"
                                        color={showSearch ? "primary" : "default"}
                                        onClick={() => setShowSearch(!showSearch)}
                                        aria-label="поиск"
                                    >
                                        <SearchIcon />
                                    </Fab>
                                </Tooltip>

                                <Tooltip title="Фильтры">
                                    <Fab
                                        size="small"
                                        color={showFilters ? "primary" : "default"}
                                        onClick={() => setShowFilters(!showFilters)}
                                        aria-label="фильтры"
                                    >
                                        <FilterList />
                                    </Fab>
                                </Tooltip>
                            </Box>
                        </Box>

                        <Slide direction="down" in={showSearch} mountOnEnter unmountOnExit>
                            <Box sx={{ mb: 3 }}>
                                <SearchBar
                                    technologies={technologies}
                                    onSearch={handleSearch}
                                />
                            </Box>
                        </Slide>

                        <Slide direction="down" in={showFilters} mountOnEnter unmountOnExit>
                            <Box sx={{ mb: 3 }}>
                                <TechnologyFilter
                                    currentFilter={filter}
                                    onFilterChange={handleFilterChange}
                                />
                            </Box>
                        </Slide>

                        <Grid container spacing={3}>
                            {filteredTech.map((tech, index) => (
                                <Grid item xs={12} key={tech.id}>
                                    <Zoom in style={{ transitionDelay: `${index * 50}ms` }}>
                                        <Box>
                                            <TechnologyCard
                                                {...tech}
                                                onStatusChange={handleStatusChange}
                                                onResourceLoad={handleResourceLoad}
                                                isSelected={selectedTechIds.includes(tech.id)}
                                                onSelect={(id, e) => handleTechSelect(id, e)}
                                                onUpdate={handleCardUpdate}
                                            />
                                        </Box>
                                    </Zoom>
                                </Grid>
                            ))}
                        </Grid>

                        {filteredTech.length === 0 && (
                            <Box textAlign="center" py={8}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Технологии не найдены
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Попробуйте изменить критерии поиска или фильтрации
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={3}>
                    <Box position="sticky" top={24}>
                        {selectedForDeadline && (
                            <Box sx={{ mb: 3 }}>
                                <DeadlineForm
                                    technologyId={selectedForDeadline.id}
                                    technologyTitle={selectedForDeadline.title}
                                    onSetDeadline={handleSetDeadline}
                                    addNotification={addNotification}
                                />
                            </Box>
                        )}

                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="h6" fontWeight="600" gutterBottom>
                                Массовое редактирование
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Выберите технологии для одновременного изменения статуса
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Советы:
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    • Ctrl/Cmd + Click для множественного выбора
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    • Shift + Click для выбора диапазона
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    • Выбрано: {selectedTechIds.length}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Данные автоматически сохраняются при любых изменениях
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>

            {selectedTechIds.length > 0 && (
                <BulkEditPanel
                    selectedTechIds={selectedTechIds}
                    technologies={technologies}
                    onBulkStatusChange={handleBulkStatusChange}
                    onClearSelection={() => setSelectedTechIds([])}
                    addNotification={addNotification}
                />
            )}

            <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Tooltip title="Добавить технологию" placement="left">
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={handleAddTechnology}
                    >
                        <Add />
                    </Fab>
                </Tooltip>
            </Box>

            {/* Уведомление о сохранении */}
            <Snackbar
                open={saveStatus.open}
                autoHideDuration={2000}
                onClose={() => setSaveStatus({ ...saveStatus, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={saveStatus.severity}
                    sx={{ width: '100%' }}
                    onClose={() => setSaveStatus({ ...saveStatus, open: false })}
                >
                    {saveStatus.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default HomePage;