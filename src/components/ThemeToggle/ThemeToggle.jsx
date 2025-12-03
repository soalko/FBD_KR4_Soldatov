import React from 'react';
import {
    IconButton,
    Tooltip,
    Box,
    Grid,
} from '@mui/material';
import {
    LightMode,
    DarkMode,
} from '@mui/icons-material';

const ThemeToggle = ({ themeMode, onThemeChange }) => {
    const isDarkMode = themeMode === 'dark';

    const handleToggle = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        onThemeChange(newTheme);
    };

    return (
        <Tooltip title={isDarkMode ? 'Светлая тема' : 'Темная тема'}>
            <IconButton
                onClick={handleToggle}
                color="inherit"
                aria-label={isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
                size="large"
            >
                <Box sx={{ position: 'relative', width: 24, height: 24 }}>
                    {isDarkMode ? (
                        <LightMode sx={{ fontSize: 24 }} />
                    ) : (
                        <DarkMode sx={{ fontSize: 24 }} />
                    )}
                </Box>
            </IconButton>
        </Tooltip>
    );
};

export default ThemeToggle;