import React, { useState, memo, useMemo } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Chip,
    IconButton,
    LinearProgress,
    Collapse,
    Box,
    Menu,
    MenuItem,
    Tooltip,
    TextField,
    Badge,
    Divider,
} from '@mui/material';
import {
    CheckCircle,
    PlayCircle,
    RadioButtonUnchecked,
    ExpandMore,
    MoreVert,
    AccessTime,
    Download,
    Edit,
    Save,
    Cancel,
    Star,
    StarBorder,
} from '@mui/icons-material';

const TechnologyCard = memo(({
                                 id,
                                 title,
                                 description,
                                 status,
                                 deadline,
                                 tags = [],
                                 notes = '',
                                 priority = 0,
                                 onStatusChange,
                                 onResourceLoad,
                                 isSelected,
                                 onSelect,
                                 onUpdate,
                                 onTogglePriority,
                             }) => {
    const [expanded, setExpanded] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [resources, setResources] = useState([]);
    const [loadingResources, setLoadingResources] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(title);
    const [editDescription, setEditDescription] = useState(description);
    const [editTags, setEditTags] = useState(tags.join(', '));

    // Динамически вычисляем стили в зависимости от статуса
    const statusConfig = useMemo(() => {
        const configs = {
            'completed': {
                icon: <CheckCircle color="success" />,
                label: 'Завершено',
                color: 'success',
                bgColor: 'rgba(76, 175, 80, 0.12)',
                borderColor: '#4caf50',
                textColor: '#2e7d32',
                progressColor: 'success',
                progressValue: 100,
            },
            'in-progress': {
                icon: <PlayCircle color="primary" />,
                label: 'В процессе',
                color: 'primary',
                bgColor: 'rgba(33, 150, 243, 0.12)',
                borderColor: '#2196f3',
                textColor: '#1976d2',
                progressColor: 'primary',
                progressValue: 50,
            },
            'not-started': {
                icon: <RadioButtonUnchecked color="action" />,
                label: 'Не начато',
                color: 'default',
                bgColor: 'rgba(158, 158, 158, 0.12)',
                borderColor: '#9e9e9e',
                textColor: '#616161',
                progressColor: 'inherit',
                progressValue: 0,
            },
        };
        return configs[status] || configs['not-started'];
    }, [status]);

    // Добавляем анимацию при изменении статуса
    const [animation, setAnimation] = useState(false);

    React.useEffect(() => {
        setAnimation(true);
        const timer = setTimeout(() => setAnimation(false), 500);
        return () => clearTimeout(timer);
    }, [status]);

    const handleMenuClick = (event) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleStatusChange = (newStatus) => {
        if (onStatusChange) {
            onStatusChange(id, newStatus);
        }
        handleMenuClose();
    };

    const handleLoadResources = async () => {
        if (onResourceLoad) {
            setLoadingResources(true);
            try {
                const loadedResources = await onResourceLoad(id);
                setResources(loadedResources);
                setExpanded(true);
            } catch (error) {
                console.error('Error loading resources:', error);
            }
            setLoadingResources(false);
        }
        handleMenuClose();
    };

    const handleCardClick = (event) => {
        if (onSelect) {
            onSelect(id, event);
        }
    };

    const handleEditClick = () => {
        setEditing(true);
        handleMenuClose();
    };

    const handleSaveEdit = () => {
        if (onUpdate) {
            const updatedTags = editTags.split(',').map(tag => tag.trim()).filter(tag => tag);
            onUpdate(id, {
                title: editTitle,
                description: editDescription,
                tags: updatedTags,
            });
        }
        setEditing(false);
    };

    const handleCancelEdit = () => {
        setEditTitle(title);
        setEditDescription(description);
        setEditTags(tags.join(', '));
        setEditing(false);
    };

    const handleTogglePriority = (event) => {
        event.stopPropagation();
        if (onTogglePriority) {
            onTogglePriority(id, !priority);
        }
    };

    return (
        <Card
            className={`technology-card ${animation ? 'status-change' : ''}`}
            sx={{
                borderLeft: `4px solid ${statusConfig.borderColor}`,
                backgroundColor: statusConfig.bgColor,
                mb: 2,
                cursor: onSelect ? 'pointer' : 'default',
                position: 'relative',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    boxShadow: `0 8px 25px ${statusConfig.borderColor}40`,
                    transform: 'translateY(-2px)',
                },
                '&.status-change': {
                    animation: 'statusPulse 0.5s ease-in-out',
                },
                '@keyframes statusPulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.02)' },
                    '100%': { transform: 'scale(1)' },
                },
            }}
            onClick={handleCardClick}
            role="article"
            aria-labelledby={`tech-title-${id}`}
            aria-describedby={`tech-desc-${id}`}
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick(e);
                    e.preventDefault();
                }
            }}
        >
            {isSelected && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        border: '2px solid white',
                        boxShadow: 2,
                        zIndex: 1,
                    }}
                />
            )}

            {priority > 0 && (
                <Badge
                    badgeContent={priority}
                    color="warning"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        '& .MuiBadge-badge': {
                            fontSize: '0.7rem',
                            height: 20,
                            minWidth: 20,
                        },
                    }}
                />
            )}

            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                    {editing ? (
                        <Box flex={1}>
                            <TextField
                                fullWidth
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                variant="outlined"
                                size="small"
                                sx={{ mb: 1 }}
                            />
                            <TextField
                                fullWidth
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                variant="outlined"
                                size="small"
                                multiline
                                rows={2}
                            />
                            <TextField
                                fullWidth
                                value={editTags}
                                onChange={(e) => setEditTags(e.target.value)}
                                variant="outlined"
                                size="small"
                                placeholder="Введите теги через запятую"
                                sx={{ mt: 1 }}
                            />
                        </Box>
                    ) : (
                        <Box flex={1}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Typography
                                    id={`tech-title-${id}`}
                                    variant="h6"
                                    component="h3"
                                    gutterBottom
                                    sx={{ color: statusConfig.textColor, fontWeight: 600 }}
                                >
                                    {title}
                                </Typography>

                                <Tooltip title={priority > 0 ? "Снять приоритет" : "Высокий приоритет"}>
                                    <IconButton
                                        size="small"
                                        onClick={handleTogglePriority}
                                        sx={{ ml: 1 }}
                                    >
                                        {priority > 0 ? (
                                            <Star color="warning" />
                                        ) : (
                                            <StarBorder />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <Chip
                                    icon={statusConfig.icon}
                                    label={statusConfig.label}
                                    color={statusConfig.color}
                                    size="small"
                                    sx={{
                                        fontWeight: 500,
                                        backgroundColor: `${statusConfig.borderColor}20`,
                                        color: statusConfig.textColor,
                                    }}
                                />

                                {tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        label={tag}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                            fontSize: '0.7rem',
                                            borderColor: statusConfig.borderColor,
                                            color: statusConfig.textColor,
                                        }}
                                    />
                                ))}
                            </Box>

                            <Typography
                                id={`tech-desc-${id}`}
                                variant="body2"
                                color="text.secondary"
                                paragraph
                                sx={{ color: statusConfig.textColor + 'CC' }}
                            >
                                {description}
                            </Typography>
                        </Box>
                    )}

                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                        {editing ? (
                            <Box display="flex" gap={1}>
                                <IconButton onClick={handleSaveEdit} size="small" color="primary">
                                    <Save fontSize="small" />
                                </IconButton>
                                <IconButton onClick={handleCancelEdit} size="small" color="inherit">
                                    <Cancel fontSize="small" />
                                </IconButton>
                            </Box>
                        ) : (
                            <IconButton
                                aria-label="more actions"
                                aria-controls={`menu-${id}`}
                                aria-haspopup="true"
                                onClick={handleMenuClick}
                                size="small"
                                sx={{ color: statusConfig.textColor }}
                            >
                                <MoreVert />
                            </IconButton>
                        )}

                        {deadline && (
                            <Tooltip title="Дедлайн">
                                <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                                    <AccessTime fontSize="small" sx={{ color: statusConfig.textColor }} />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: statusConfig.textColor,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {new Date(deadline).toLocaleDateString('ru-RU')}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                <LinearProgress
                    variant="determinate"
                    value={statusConfig.progressValue}
                    color={statusConfig.progressColor}
                    sx={{
                        mb: 1,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: `${statusConfig.borderColor}20`,
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            backgroundColor: statusConfig.borderColor,
                        },
                    }}
                />
            </CardContent>

            <CardActions disableSpacing sx={{ pt: 0 }}>
                <IconButton
                    aria-expanded={expanded}
                    aria-label="show more"
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpanded(!expanded);
                    }}
                    size="small"
                    sx={{ color: statusConfig.textColor }}
                >
                    <ExpandMore sx={{
                        transform: expanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s',
                    }} />
                </IconButton>
                <Typography variant="caption" sx={{ ml: 1, color: statusConfig.textColor }}>
                    {expanded ? 'Скрыть' : 'Подробнее'}
                </Typography>
            </CardActions>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent sx={{ pt: 0 }}>
                    {loadingResources ? (
                        <Box textAlign="center" py={2}>
                            <Typography variant="body2" color="text.secondary">
                                Загрузка ресурсов...
                            </Typography>
                        </Box>
                    ) : resources.length > 0 ? (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight="500" sx={{ color: statusConfig.textColor }}>
                                📚 Дополнительные ресурсы:
                            </Typography>
                            {resources.map((resource, index) => (
                                <Typography key={index} variant="body2" sx={{ mb: 0.5, color: statusConfig.textColor + 'CC' }}>
                                    • {resource}
                                </Typography>
                            ))}
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight="500" sx={{ color: statusConfig.textColor }}>
                                📝 Примечания:
                            </Typography>
                            <Typography variant="body2" sx={{ color: statusConfig.textColor + 'CC' }}>
                                {notes || 'Нет примечаний'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 2, fontSize: '0.8rem', color: statusConfig.textColor + '99' }}>
                                Нажмите на три точки (⋮) для загрузки ресурсов или редактирования
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Collapse>

            <Menu
                id={`menu-${id}`}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
                MenuListProps={{
                    'aria-labelledby': `menu-${id}`,
                }}
            >
                <MenuItem onClick={handleEditClick}>
                    <Edit fontSize="small" sx={{ mr: 1 }} />
                    Редактировать
                </MenuItem>
                <MenuItem onClick={handleTogglePriority}>
                    {priority > 0 ? (
                        <>
                            <Star fontSize="small" sx={{ mr: 1, color: '#ff9800' }} />
                            Снять приоритет
                        </>
                    ) : (
                        <>
                            <StarBorder fontSize="small" sx={{ mr: 1 }} />
                            Высокий приоритет
                        </>
                    )}
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleStatusChange('not-started')}>
                    <RadioButtonUnchecked fontSize="small" sx={{ mr: 1, color: '#9e9e9e' }} />
                    Отметить как "Не начато"
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange('in-progress')}>
                    <PlayCircle fontSize="small" sx={{ mr: 1, color: '#2196f3' }} />
                    Отметить как "В процессе"
                </MenuItem>
                <MenuItem onClick={() => handleStatusChange('completed')}>
                    <CheckCircle fontSize="small" sx={{ mr: 1, color: '#4caf50' }} />
                    Отметить как "Завершено"
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLoadResources}>
                    <Download fontSize="small" sx={{ mr: 1 }} />
                    Загрузить ресурсы
                </MenuItem>
            </Menu>
        </Card>
    );
});

TechnologyCard.displayName = 'TechnologyCard';

export default TechnologyCard;