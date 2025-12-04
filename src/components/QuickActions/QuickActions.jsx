import React, { useState } from 'react';
import {
    Box,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    CheckCircle,
    RestartAlt,
    Shuffle,
    FileDownload,
    FileUpload,
} from '@mui/icons-material';

const QuickActions = ({
                          technologies,
                          onUpdateAllStatuses,
                          onRandomSelect,
                          onExportData,
                          onImportData,
                          addNotification,
                      }) => {
    const [openConfirm, setOpenConfirm] = useState(false);
    const [actionType, setActionType] = useState('');
    const [importFile, setImportFile] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const handleMarkAllCompleted = () => {
        setActionType('completeAll');
        setOpenConfirm(true);
    };

    const handleResetAll = () => {
        setActionType('resetAll');
        setOpenConfirm(true);
    };

    const handleConfirmAction = () => {
        if (actionType === 'completeAll') {
            onUpdateAllStatuses('completed');
            addNotification('Все технологии отмечены как завершенные', 'success');
        } else if (actionType === 'resetAll') {
            onUpdateAllStatuses('not-started');
            addNotification('Все статусы сброшены', 'info');
        }
        setOpenConfirm(false);
        setActionType('');
    };

    const handleRandomSelect = () => {
        const notStarted = technologies.filter(t => t.status === 'not-started');
        if (notStarted.length === 0) {
            setSnackbar({
                open: true,
                message: 'Нет не начатых технологий для выбора',
                severity: 'warning',
            });
            return;
        }

        const randomTech = notStarted[Math.floor(Math.random() * notStarted.length)];
        onRandomSelect(randomTech.id);
        addNotification(`Следующая технология: ${randomTech.title}`, 'info');
    };

    const handleExport = () => {
        onExportData();
        addNotification('Данные успешно экспортированы', 'success');
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                onImportData(data);
                addNotification('Данные успешно импортированы', 'success');
            } catch (error) {
                addNotification('Ошибка при импорте данных', 'error');
            }
        };
        reader.readAsText(file);
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Быстрые действия
                </Typography>

                <ButtonGroup
                    variant="outlined"
                    aria-label="quick actions"
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    <Button
                        startIcon={<CheckCircle />}
                        onClick={handleMarkAllCompleted}
                        aria-label="Отметить все как выполненные"
                    >
                        Все выполнено
                    </Button>
                    <Button
                        startIcon={<RestartAlt />}
                        onClick={handleResetAll}
                        aria-label="Сбросить все статусы"
                    >
                        Сбросить все
                    </Button>
                </ButtonGroup>

                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        startIcon={<FileDownload />}
                        onClick={handleExport}
                        fullWidth
                    >
                        Экспорт данных
                    </Button>

                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<FileUpload />}
                        fullWidth
                    >
                        Импорт данных
                        <input
                            type="file"
                            hidden
                            accept=".json"
                            onChange={handleImport}
                            aria-label="Выберите файл для импорта"
                        />
                    </Button>
                </Box>
            </CardContent>

            <Dialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                aria-labelledby="confirm-dialog-title"
            >
                <DialogTitle id="confirm-dialog-title">
                    Подтверждение действия
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {actionType === 'completeAll'
                            ? 'Вы уверены, что хотите отметить все технологии как завершенные?'
                            : 'Вы уверены, что хотите сбросить все статусы?'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)}>Отмена</Button>
                    <Button onClick={handleConfirmAction} variant="contained" autoFocus>
                        Подтвердить
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Card>
    );
};

export default QuickActions;