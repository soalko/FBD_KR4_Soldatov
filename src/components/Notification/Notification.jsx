import React, { useEffect, useState } from 'react';
import {
    Snackbar,
    Alert,
    IconButton,
    Box,
    Typography,
} from '@mui/material';
import {
    Close,
    CheckCircle,
    Error,
    Warning,
    Info,
} from '@mui/icons-material';

const Notification = ({
                          message,
                          type = 'info',
                          onClose,
                          autoHideDuration = 6000,
                          showCloseButton = true
                      }) => {
    const [open, setOpen] = useState(true);

    useEffect(() => {
        if (autoHideDuration) {
            const timer = setTimeout(() => {
                handleClose();
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [autoHideDuration]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300);
    };

    const handleActionClick = (event) => {
        event.stopPropagation();
        handleClose(event, 'actionClick');
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle fontSize="inherit" />;
            case 'error':
                return <Error fontSize="inherit" />;
            case 'warning':
                return <Warning fontSize="inherit" />;
            case 'info':
            default:
                return <Info fontSize="inherit" />;
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'success':
                return 'Успешно';
            case 'error':
                return 'Ошибка';
            case 'warning':
                return 'Внимание';
            case 'info':
            default:
                return 'Информация';
        }
    };

    return (
        <Snackbar
            open={open}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            onClose={handleClose}
            sx={{
                '& .MuiAlert-root': {
                    minWidth: 300,
                    maxWidth: 500,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                },
            }}
        >
            <Alert
                severity={type}
                variant="filled"
                icon={getIcon()}
                onClose={showCloseButton ? handleClose : null}
                sx={{
                    width: '100%',
                    alignItems: 'center',
                    '& .MuiAlert-icon': {
                        fontSize: '1.5rem',
                        mr: 1.5,
                    },
                    '& .MuiAlert-message': {
                        flex: 1,
                        py: 0.5,
                    },
                    '& .MuiAlert-action': {
                        padding: 0,
                        marginRight: 0,
                        marginLeft: 1,
                    },
                }}
                role="alert"
                aria-live="assertive"
            >
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {getTitle()}
                    </Typography>
                    <Typography variant="body2">{message}</Typography>
                </Box>
            </Alert>
        </Snackbar>
    );
};

export default Notification;