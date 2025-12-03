import React from 'react';
import {
    Paper,
    Box,
    Typography,
    Button,
    ButtonGroup,
    Chip,
    Divider,
    Alert,
} from '@mui/material';
import {
    CheckCircle,
    PlayCircle,
    RadioButtonUnchecked,
    Clear,
} from '@mui/icons-material';

const BulkEditPanel = ({
                           selectedTechIds,
                           technologies,
                           onBulkStatusChange,
                           onClearSelection,
                           addNotification,
                       }) => {
    const selectedCount = selectedTechIds.length;

    if (selectedCount === 0) return null;

    const selectedTechs = technologies.filter(tech => selectedTechIds.includes(tech.id));

    const handleBulkStatusChange = (status) => {
        onBulkStatusChange(selectedTechIds, status);
        const statusText = {
            'completed': 'завершены',
            'in-progress': 'отмечены как в процессе',
            'not-started': 'отмечены как не начаты',
        }[status];

        addNotification(
            `${selectedCount} технологий ${statusText}`,
            'success'
        );
    };

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'sticky',
                bottom: 20,
                zIndex: 1000,
                p: 2,
                mb: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'primary.main',
            }}
            role="region"
            aria-label="Панель массового редактирования"
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Выбрано: {selectedCount} технологий
                    </Typography>
                    <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                        {selectedTechs.slice(0, 3).map(tech => (
                            <Chip
                                key={tech.id}
                                label={tech.title}
                                size="small"
                                variant="outlined"
                            />
                        ))}
                        {selectedTechs.length > 3 && (
                            <Chip
                                label={`+${selectedTechs.length - 3} еще`}
                                size="small"
                                variant="outlined"
                            />
                        )}
                    </Box>
                </Box>

                <Button
                    onClick={onClearSelection}
                    startIcon={<Clear />}
                    size="small"
                    aria-label="Очистить выбор"
                >
                    Очистить
                </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Alert severity="info" sx={{ mb: 2 }}>
                Изменение статуса будет применено ко всем выбранным технологиям
            </Alert>

            <ButtonGroup
                variant="outlined"
                aria-label="Массовое изменение статуса"
                fullWidth
            >
                <Button
                    startIcon={<RadioButtonUnchecked />}
                    onClick={() => handleBulkStatusChange('not-started')}
                    aria-label="Отметить выбранные как не начатые"
                >
                    Не начато
                </Button>
                <Button
                    startIcon={<PlayCircle />}
                    onClick={() => handleBulkStatusChange('in-progress')}
                    aria-label="Отметить выбранные как в процессе"
                >
                    В процессе
                </Button>
                <Button
                    startIcon={<CheckCircle />}
                    onClick={() => handleBulkStatusChange('completed')}
                    aria-label="Отметить выбранные как завершенные"
                >
                    Завершено
                </Button>
            </ButtonGroup>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Используйте Ctrl+Click или Shift+Click для выбора нескольких элементов
            </Typography>
        </Paper>
    );
};

export default BulkEditPanel;