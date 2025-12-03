import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Paper,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Refresh,
    TrendingUp,
    CalendarMonth,
    Category,
    Timeline,
    Download,
} from '@mui/icons-material';
import {
    PieChart,
    Pie,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area,
} from 'recharts';
import StorageService from '../../services/storage';

const StatisticsPage = () => {
    const [technologies, setTechnologies] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [timeRange, setTimeRange] = useState('all');
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Загрузка данных из localStorage
    useEffect(() => {
        const loadData = () => {
            const savedData = StorageService.loadTechnologies();
            setTechnologies(savedData || []);
        };

        loadData();

        // Слушаем изменения в localStorage
        const handleStorageChange = () => {
            loadData();
            setLastUpdated(new Date());
        };

        window.addEventListener('storage', handleStorageChange);

        // Проверяем изменения каждые 2 секунды (для текущей вкладки)
        const interval = setInterval(loadData, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const handleRefresh = () => {
        const savedData = StorageService.loadTechnologies();
        setTechnologies(savedData || []);
        setLastUpdated(new Date());
    };

    // Расчет статистики
    const calculateStatistics = () => {
        const total = technologies.length;
        const completed = technologies.filter(t => t.status === 'completed').length;
        const inProgress = technologies.filter(t => t.status === 'in-progress').length;
        const notStarted = technologies.filter(t => t.status === 'not-started').length;

        const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Расчет по месяцам
        const monthlyData = {};
        technologies.forEach(tech => {
            if (tech.deadline) {
                const month = new Date(tech.deadline).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
                if (!monthlyData[month]) {
                    monthlyData[month] = { completed: 0, inProgress: 0, notStarted: 0, total: 0 };
                }
                monthlyData[month][tech.status] += 1;
                monthlyData[month].total += 1;
            }
        });

        const monthlyProgress = Object.keys(monthlyData)
            .sort((a, b) => new Date(a) - new Date(b))
            .map(month => ({
                month,
                completed: monthlyData[month].completed,
                inProgress: monthlyData[month].inProgress,
                notStarted: monthlyData[month].notStarted,
                total: monthlyData[month].total,
            }));

        // Статистика по тегам
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

        const categoryData = Object.keys(tagStats)
            .map(category => ({
                category,
                count: tagStats[category].total,
                completed: tagStats[category].completed,
                inProgress: tagStats[category].inProgress,
                notStarted: tagStats[category].notStarted,
                completionRate: Math.round((tagStats[category].completed / tagStats[category].total) * 100),
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

        // Динамика прогресса
        const progressHistory = [];
        let cumulativeCompleted = 0;

        technologies
            .filter(t => t.deadline)
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .forEach((tech, index) => {
                if (tech.status === 'completed') {
                    cumulativeCompleted += 1;
                }
                progressHistory.push({
                    index: index + 1,
                    completed: cumulativeCompleted,
                    percentage: Math.round((cumulativeCompleted / technologies.length) * 100),
                    technology: tech.title,
                });
            });

        // Статус данные для круговой диаграммы
        const statusData = [
            { name: 'Завершено', value: completed, color: '#4caf50' },
            { name: 'В процессе', value: inProgress, color: '#2196f3' },
            { name: 'Не начато', value: notStarted, color: '#9e9e9e' },
        ];

        // Расчет средней продолжительности
        const completedTechs = technologies.filter(t => t.status === 'completed' && t.deadline);
        let avgDuration = 0;
        if (completedTechs.length > 0) {
            const durations = completedTechs.map(tech => {
                const created = tech.createdAt ? new Date(tech.createdAt) : new Date('2024-01-01');
                const deadline = new Date(tech.deadline);
                return Math.ceil((deadline - created) / (1000 * 60 * 60 * 24)); // дни
            });
            avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        }

        return {
            total,
            completed,
            inProgress,
            notStarted,
            progressPercentage,
            monthlyProgress,
            categoryData,
            statusData,
            progressHistory,
            avgDuration,
        };
    };

    const stats = calculateStatistics();

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'success';
        if (percentage >= 50) return 'info';
        if (percentage >= 30) return 'warning';
        return 'error';
    };

    const handleExportChart = (chartId) => {
        const svg = document.getElementById(chartId);
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `chart-${chartId}-${new Date().toISOString().split('T')[0]}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };

            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        📊 Статистика прогресса
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')}
                    </Typography>
                </Box>

                <Box display="flex" gap={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Период</InputLabel>
                        <Select
                            value={timeRange}
                            label="Период"
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <MenuItem value="all">За всё время</MenuItem>
                            <MenuItem value="month">Последний месяц</MenuItem>
                            <MenuItem value="quarter">Квартал</MenuItem>
                            <MenuItem value="year">Год</MenuItem>
                        </Select>
                    </FormControl>

                    <Tooltip title="Обновить статистику">
                        <IconButton onClick={handleRefresh} color="primary">
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Вкладки */}
            <Paper sx={{ mb: 3, borderRadius: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                >
                    <Tab icon={<TrendingUp />} label="Обзор" />
                    <Tab icon={<CalendarMonth />} label="Временная шкала" />
                    <Tab icon={<Category />} label="По категориям" />
                </Tabs>
            </Paper>

            {/* Общая статистика */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <TrendingUp color="primary" />
                                <Typography variant="h6">Общий прогресс</Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h3" align="center" color="primary.main">
                                    {stats.progressPercentage}%
                                </Typography>
                                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
                                    выполнения
                                </Typography>
                                <Box display="flex" justifyContent="center" gap={1} flexWrap="wrap">
                                    <Chip label={`${stats.completed}/${stats.total}`} color="success" size="small" />
                                    <Chip label={`${stats.inProgress} в работе`} color="primary" size="small" />
                                    <Chip label={`${stats.notStarted} не начато`} variant="outlined" size="small" />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <CalendarMonth color="success" />
                                <Typography variant="h6">Изучено технологий</Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h3" align="center" color="success.main">
                                    {stats.completed}
                                </Typography>
                                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
                                    из {stats.total} запланированных
                                </Typography>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% от цели
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Timeline color="warning" />
                                <Typography variant="h6">Средняя продолжительность</Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h3" align="center" color="warning.main">
                                    {stats.avgDuration}
                                </Typography>
                                <Typography variant="body2" align="center" color="text.secondary">
                                    дней на технологию
                                </Typography>
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {stats.completed > 0 ? 'На основе завершенных технологий' : 'Нет завершенных технологий'}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Содержимое вкладок */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: 400, position: 'relative' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Распределение по статусам</Typography>
                                <Tooltip title="Экспортировать диаграмму">
                                    <IconButton size="small" onClick={() => handleExportChart('status-pie-chart')}>
                                        <Download fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <ResponsiveContainer width="100%" height="90%">
                                <PieChart id="status-pie-chart">
                                    <Pie
                                        data={stats.statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {stats.statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value) => [`${value} технологий`, 'Количество']}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: 400, position: 'relative' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Технологии по категориям</Typography>
                                <Tooltip title="Экспортировать диаграмму">
                                    <IconButton size="small" onClick={() => handleExportChart('category-bar-chart')}>
                                        <Download fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={stats.categoryData} id="category-bar-chart">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <RechartsTooltip />
                                    <Legend />
                                    <Bar dataKey="completed" name="Завершено" fill="#4caf50" />
                                    <Bar dataKey="inProgress" name="В процессе" fill="#2196f3" />
                                    <Bar dataKey="notStarted" name="Не начато" fill="#9e9e9e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {activeTab === 1 && (
                <Paper sx={{ p: 3, height: 500 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Прогресс по месяцам</Typography>
                        <Tooltip title="Экспортировать диаграмму">
                            <IconButton size="small" onClick={() => handleExportChart('monthly-line-chart')}>
                                <Download fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={stats.monthlyProgress} id="monthly-line-chart">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="completed"
                                stroke="#4caf50"
                                name="Завершено"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="inProgress"
                                stroke="#2196f3"
                                name="В процессе"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#ff9800"
                                name="Всего запланировано"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>
            )}

            {activeTab === 2 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, height: 500 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Процент выполнения по категориям</Typography>
                                <Tooltip title="Экспортировать диаграмму">
                                    <IconButton size="small" onClick={() => handleExportChart('completion-bar-chart')}>
                                        <Download fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart
                                    data={stats.categoryData}
                                    layout="vertical"
                                    id="completion-bar-chart"
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 100]} unit="%" />
                                    <YAxis type="category" dataKey="category" width={100} />
                                    <RechartsTooltip
                                        formatter={(value) => [`${value}%`, 'Процент выполнения']}
                                    />
                                    <Legend />
                                    <Bar dataKey="completionRate" name="Процент выполнения" fill="#1976d2">
                                        {stats.categoryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.completionRate >= 80 ? '#4caf50' :
                                                    entry.completionRate >= 50 ? '#2196f3' :
                                                        entry.completionRate >= 30 ? '#ff9800' : '#f44336'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {activeTab === 3 && (
                <Paper sx={{ p: 3, height: 500 }}>
                    <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={stats.progressHistory} id="progress-area-chart">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="index" label={{ value: 'Порядковый номер технологии', position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: 'Количество завершенных', angle: -90, position: 'insideLeft' }} />
                            <RechartsTooltip
                                formatter={(value, name, props) => {
                                    if (name === 'technology') {
                                        return [value, 'Технология'];
                                    }
                                    return [value, name === 'completed' ? 'Завершено' : 'Процент'];
                                }}
                                labelFormatter={(index) => `Технология ${index}`}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                name="Накопленное количество завершенных"
                                stroke="#1976d2"
                                fill="#1976d2"
                                fillOpacity={0.3}
                            />
                            <Area
                                type="monotone"
                                dataKey="percentage"
                                name="Процент выполнения"
                                stroke="#4caf50"
                                fill="#4caf50"
                                fillOpacity={0.3}
                                yAxisId={1}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Paper>
            )}

            {/* Подробная статистика */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Детализация по статусам
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Paper sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
                                        <Typography variant="h4" color="success.main" align="center">
                                            {stats.completed}
                                        </Typography>
                                        <Typography variant="body2" align="center">
                                            Завершено
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" align="center">
                                            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Paper sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
                                        <Typography variant="h4" color="primary.main" align="center">
                                            {stats.inProgress}
                                        </Typography>
                                        <Typography variant="body2" align="center">
                                            В процессе
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" align="center">
                                            {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Paper sx={{ p: 2, bgcolor: 'rgba(158, 158, 158, 0.1)' }}>
                                        <Typography variant="h4" color="text.secondary" align="center">
                                            {stats.notStarted}
                                        </Typography>
                                        <Typography variant="body2" align="center">
                                            Не начато
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" align="center">
                                            {stats.total > 0 ? Math.round((stats.notStarted / stats.total) * 100) : 0}%
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Прогноз завершения
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    При текущем темпе
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h5">
                                            {stats.inProgress > 0
                                                ? `${Math.round((stats.notStarted / stats.inProgress) * 30)} дней`
                                                : '∞ дней'
                                            }
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            до завершения всех технологий
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {stats.inProgress > 0
                                                ? `${Math.round(stats.notStarted / stats.inProgress)} технологий в месяц`
                                                : 'Нет активных технологий'
                                            }
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StatisticsPage;