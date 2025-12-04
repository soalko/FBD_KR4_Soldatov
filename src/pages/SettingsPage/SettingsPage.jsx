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


                <Grid item xs={12} md={12}>
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