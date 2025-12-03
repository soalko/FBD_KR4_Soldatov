import React from 'react';
import {
    ToggleButtonGroup,
    ToggleButton,
    Box,
} from '@mui/material';
import {
    AllInbox,
    RadioButtonUnchecked,
    PlayCircle,
    CheckCircle,
} from '@mui/icons-material';

const TechnologyFilter = ({ currentFilter, onFilterChange }) => {
    const filters = [
        { value: 'all', label: 'Все', icon: <AllInbox /> },
        { value: 'not-started', label: 'Не начатые', icon: <RadioButtonUnchecked /> },
        { value: 'in-progress', label: 'В процессе', icon: <PlayCircle /> },
        { value: 'completed', label: 'Завершенные', icon: <CheckCircle /> },
    ];

    const handleFilterChange = (event, newFilter) => {
        if (newFilter !== null) {
            onFilterChange(newFilter);
        }
    };

    return (
        <Box sx={{ mb: 3 }}>
            <ToggleButtonGroup
                value={currentFilter}
                onChange={handleFilterChange}
                exclusive
                aria-label="Фильтр технологий"
                fullWidth
            >
                {filters.map(filter => (
                    <ToggleButton
                        key={filter.value}
                        value={filter.value}
                        aria-label={filter.label}
                        sx={{ textTransform: 'none' }}
                    >
                        <Box display="flex" alignItems="center" gap={1}>
                            {filter.icon}
                            <span>{filter.label}</span>
                        </Box>
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
};

export default TechnologyFilter;