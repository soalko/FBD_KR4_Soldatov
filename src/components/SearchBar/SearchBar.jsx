import React, { useState, useCallback } from 'react';
import {
    TextField,
    InputAdornment,
    Box,
    Typography,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { debounce } from '../../utils/debounce';

const SearchBar = ({ onSearch, technologies }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [resultsCount, setResultsCount] = useState(technologies.length);

    const debouncedSearch = useCallback(
        debounce((term) => {
            const filtered = technologies.filter(tech =>
                tech.title.toLowerCase().includes(term.toLowerCase()) ||
                tech.description.toLowerCase().includes(term.toLowerCase())
            );
            setResultsCount(filtered.length);
            onSearch(filtered);
        }, 300),
        [technologies, onSearch]
    );

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setResultsCount(technologies.length);
        onSearch(technologies);
    };

    return (
        <Box sx={{ mb: 3 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Поиск технологий по названию или описанию..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                        <InputAdornment position="end">
                            <Clear
                                onClick={handleClearSearch}
                                sx={{ cursor: 'pointer' }}
                                role="button"
                                aria-label="Очистить поиск"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleClearSearch();
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </InputAdornment>
                    ),
                }}
                aria-label="Поиск технологий"
            />

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: 'block' }}
            >
                Найдено: {resultsCount} из {technologies.length} технологий
            </Typography>
        </Box>
    );
};

export default SearchBar;