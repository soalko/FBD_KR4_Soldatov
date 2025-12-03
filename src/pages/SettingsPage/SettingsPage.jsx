import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Button,
    Switch,
    Slider,
    Divider,
    Alert,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Delete,
    Backup,
    Restore,
    Storage,
    Info,
    CloudDownload,
    CloudUpload,
} from '@mui/icons-material';
import StorageService from '../../services/storage';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        theme: 'light',
        notifications: true,
        autoSave: true,
        defaultStatus: 'not-started',
        itemsPerPage: 10,
        exportFormat: 'json',
        language: 'ru',
        backupInterval: 7, // дни
    });

    const [saved, setSaved] = useState(false);
    const [storageInfo, setStorageInfo] = useState(null);
    const [backupDialog, setBackupDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);
    const [importData, setImportData] = useState('');

    // Загрузка настроек и информации о хранилище
    useEffect(() => {
        const savedSettings = StorageService.loadSettings();
        if (savedSettings) {
            setSettings(prev => ({ ...prev, ...savedSettings }));
        }

        // Получение информации о хранилище
        const info = StorageService.getStorageInfo();
        setStorageInfo(info);

        // Очистка старых резервных копий
        StorageService.cleanOldBackups(settings.backupInterval);
    }, []);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
        }));
        setSaved(false);
    };

    const handleSaveSettings = () => {
        StorageService.saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleResetSettings = () => {
        if (window.confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
            const defaultSettings = {
                theme: 'light',
                notifications: true,
                autoSave: true,
                defaultStatus: 'not-started',
                itemsPerPage: 10,
                exportFormat: 'json',
                language: 'ru',
                backupInterval: 7,
            };
            setSettings(defaultSettings);
            StorageService.saveSettings(defaultSettings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const handleCreateBackup = () => {
        const backupKey = StorageService.createBackup();
        const info = StorageService.getStorageInfo();
        setStorageInfo(info);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleClearStorage = () => {
        if (window.confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
            StorageService.clear();
            window.location.reload(); // Перезагрузка для применения изменений
        }
    };

    const handleExportAllData = () => {
        const allData = StorageService.exportAllData();
        const dataStr = JSON.stringify(allData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `roadmap-backup-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleImportData = () => {
        try {
            const data = JSON.parse(importData);
            if (StorageService.importData(data)) {
                setImportDialog(false);
                setImportData('');
                window.location.reload(); // Перезагрузка для применения изменений
            }
        } catch (error) {
            alert('Ошибка при импорте данных: неверный формат JSON');
        }
    };

    const handleDeleteBackup = (key) => {
        if (window.confirm(`Удалить резервную копию ${key}?`)) {
            StorageService.remove(key);
            const info = StorageService.getStorageInfo();
            setStorageInfo(info);
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const backupKeys = storageInfo?.keys.filter(key => key.startsWith('backup_')) || [];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Настройки приложения
            </Typography>

            {saved && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Изменения успешно сохранены
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Внешний вид
                            </Typography>

                            <FormControl component="fieldset" sx={{ mb: 3 }}>
                                <FormLabel component="legend">Тема</FormLabel>
                                <RadioGroup
                                    value={settings.theme}
                                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                                >
                                    <FormControlLabel value="light" control={<Radio />} label="Светлая" />
                                    <FormControlLabel value="dark" control={<Radio />} label="Темная" />
                                    <FormControlLabel value="auto" control={<Radio />} label="Авто" />
                                </RadioGroup>
                            </FormControl>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography gutterBottom>
                                    Количество элементов на странице: {settings.itemsPerPage}
                                </Typography>
                                <Slider
                                    value={settings.itemsPerPage}
                                    onChange={(e, value) => handleSettingChange('itemsPerPage', value)}
                                    min={5}
                                    max={50}
                                    step={5}
                                    marks
                                    valueLabelDisplay="auto"
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Поведение
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.notifications}
                                            onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                        />
                                    }
                                    label="Показывать уведомления"
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.autoSave}
                                            onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                                        />
                                    }
                                    label="Автосохранение изменений"
                                />
                            </Box>

                            <FormControl component="fieldset" sx={{ mb: 3 }}>
                                <FormLabel component="legend">Статус по умолчанию для новых технологий</FormLabel>
                                <RadioGroup
                                    value={settings.defaultStatus}
                                    onChange={(e) => handleSettingChange('defaultStatus', e.target.value)}
                                >
                                    <FormControlLabel value="not-started" control={<Radio />} label="Не начато" />
                                    <FormControlLabel value="in-progress" control={<Radio />} label="В процессе" />
                                </RadioGroup>
                            </FormControl>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Управление данными
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                {storageInfo && (
                                    <Paper sx={{ p: 2, mb: 2 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Storage />
                                            <Typography variant="subtitle1">Использование хранилища</Typography>
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Всего занято: {formatBytes(storageInfo.totalBytes)} из 5MB
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(storageInfo.totalBytes / (5 * 1024 * 1024)) * 100}
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                        </Box>

                                        <Typography variant="body2">
                                            Ключей в хранилище: {storageInfo.totalKeys}
                                        </Typography>
                                    </Paper>
                                )}
                            </Box>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Backup />}
                                        onClick={handleCreateBackup}
                                        fullWidth
                                    >
                                        Создать бэкап
                                    </Button>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CloudDownload />}
                                        onClick={handleExportAllData}
                                        fullWidth
                                    >
                                        Экспорт всех данных
                                    </Button>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CloudUpload />}
                                        onClick={() => setImportDialog(true)}
                                        fullWidth
                                    >
                                        Импорт данных
                                    </Button>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={handleClearStorage}
                                        fullWidth
                                    >
                                        Очистить всё
                                    </Button>
                                </Grid>
                            </Grid>

                            {backupKeys.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Резервные копии
                                    </Typography>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Имя копии</TableCell>
                                                    <TableCell>Дата создания</TableCell>
                                                    <TableCell>Размер</TableCell>
                                                    <TableCell align="right">Действия</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {backupKeys.map((key) => {
                                                    const backup = StorageService.load(key);
                                                    const size = backup ? JSON.stringify(backup).length * 2 : 0;
                                                    return (
                                                        <TableRow key={key}>
                                                            <TableCell>
                                                                <Typography variant="body2">{key}</Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {backup?.timestamp ? new Date(backup.timestamp).toLocaleString() : 'Неизвестно'}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip label={formatBytes(size)} size="small" />
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => {
                                                                        if (window.confirm('Восстановить из этой резервной копии?')) {
                                                                            StorageService.restoreFromBackup(key);
                                                                            window.location.reload();
                                                                        }
                                                                    }}
                                                                >
                                                                    <Restore fontSize="small" />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleDeleteBackup(key)}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                    variant="outlined"
                    onClick={handleResetSettings}
                >
                    Сбросить настройки
                </Button>

                <Button
                    variant="contained"
                    onClick={handleSaveSettings}
                >
                    Сохранить настройки
                </Button>
            </Box>

            {/* Диалог импорта данных */}
            <Dialog
                open={importDialog}
                onClose={() => setImportDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Импорт данных</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Внимание: импорт данных перезапишет все текущие данные
                    </Alert>
                    <TextField
                        multiline
                        rows={10}
                        fullWidth
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="Вставьте JSON данные..."
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setImportDialog(false)}>Отмена</Button>
                    <Button
                        onClick={handleImportData}
                        variant="contained"
                        disabled={!importData.trim()}
                    >
                        Импортировать
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SettingsPage;