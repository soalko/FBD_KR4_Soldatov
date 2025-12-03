import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { validateDeadline } from '../../utils/validation';

const DeadlineForm = ({ technologyId, technologyTitle, onSetDeadline, addNotification }) => {
    const [deadline, setDeadline] = useState(null);
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateDeadline(deadline, notes);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            await onSetDeadline(technologyId, deadline, notes);
            addNotification(`Дедлайн установлен для "${technologyTitle}"`, 'success');
            setDeadline(null);
            setNotes('');
            setErrors({});
        } catch (error) {
            addNotification('Ошибка при установке дедлайна', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDateChange = (newDate) => {
        setDeadline(newDate);
        if (errors.deadline) {
            setErrors(prev => ({ ...prev, deadline: null }));
        }
    };

    const handleNotesChange = (e) => {
        setNotes(e.target.value);
        if (errors.notes) {
            setErrors(prev => ({ ...prev, notes: null }));
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Установить дедлайн для: {technologyTitle}
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Box mb={2}>
                        <DatePicker
                            label="Дата дедлайна"
                            value={deadline}
                            onChange={handleDateChange}
                            minDate={new Date()}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.deadline,
                                    helperText: errors.deadline,
                                    required: true,
                                    'aria-required': 'true',
                                    'aria-describedby': errors.deadline ? 'deadline-error' : undefined,
                                },
                            }}
                            aria-label="Выберите дату дедлайна"
                        />
                    </Box>

                    <Box mb={2}>
                        <TextField
                            label="Примечания (опционально)"
                            multiline
                            rows={3}
                            value={notes}
                            onChange={handleNotesChange}
                            fullWidth
                            error={!!errors.notes}
                            helperText={errors.notes}
                            aria-label="Примечания к дедлайну"
                        />
                    </Box>

                    {errors.form && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errors.form}
                        </Alert>
                    )}

                    <Box display="flex" gap={2}>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting || !deadline}
                            aria-label="Установить дедлайн"
                        >
                            {isSubmitting ? 'Установка...' : 'Установить дедлайн'}
                        </Button>

                        <Button
                            type="button"
                            variant="outlined"
                            onClick={() => {
                                setDeadline(null);
                                setNotes('');
                                setErrors({});
                            }}
                            aria-label="Очистить форму"
                        >
                            Очистить
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </LocalizationProvider>
    );
};

export default DeadlineForm;