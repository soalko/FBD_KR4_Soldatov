import React from 'react';
import {
    Box,
    Typography,
    LinearProgress,
    Card,
    CardContent,
    Grid,
    Chip,
} from '@mui/material';
import {
    CheckCircle,
    PlayCircle,
    RadioButtonUnchecked,
} from '@mui/icons-material';

const ProgressHeader = ({ technologies }) => {
    const total = technologies.length;
    const completed = technologies.filter(t => t.status === 'completed').length;
    const inProgress = technologies.filter(t => t.status === 'in-progress').length;
    const notStarted = technologies.filter(t => t.status === 'not-started').length;

    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Прогресс изучения
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                            Общий прогресс
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {progressPercentage}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progressPercentage}
                        sx={{ height: 10, borderRadius: 5 }}
                    />
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <CheckCircle color="success" />
                            <Typography variant="body2">Завершено:</Typography>
                            <Chip label={completed} size="small" color="success" />
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <PlayCircle color="primary" />
                            <Typography variant="body2">В процессе:</Typography>
                            <Chip label={inProgress} size="small" color="primary" />
                        </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <RadioButtonUnchecked color="action" />
                            <Typography variant="body2">Не начато:</Typography>
                            <Chip label={notStarted} size="small" variant="outlined" />
                        </Box>
                    </Grid>
                </Grid>

                <Box mt={2}>
                    <Typography variant="caption" color="text.secondary">
                        Всего технологий: {total}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProgressHeader;