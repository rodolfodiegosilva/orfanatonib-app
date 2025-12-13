import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Avatar,
  TextField,
  Button,
  Collapse,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/slices';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from 'react-slick';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HomeIcon from '@mui/icons-material/Home';
import SendIcon from '@mui/icons-material/Send';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import api from '@/config/axiosConfig';
import { setComments } from 'store/slices/comment/commentsSlice';

const CommentsSection: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const rawComments = useSelector((state: RootState) => state.comments.comments);
  const comments = useMemo(() => rawComments?.filter((c) => c.published) || [], [rawComments]);

  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    comment: '',
    shelter: '',
    neighborhood: '',
  });

  const [errors, setErrors] = useState({
    name: false,
    comment: false,
    shelter: false,
    neighborhood: false,
  });

  const fetchComments = useCallback(async () => {
    try {
      const response = await api.get('/comments/published');
      dispatch(setComments(response.data));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    if (rawComments !== null) return;
    fetchComments();
  }, [fetchComments, rawComments]);

  const handleSubmit = async () => {
    const newErrors = {
      name: !formData.name.trim(),
      comment: !formData.comment.trim(),
      shelter: !formData.shelter.trim(),
      neighborhood: !formData.neighborhood.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await api.post('/comments', formData);
      setFormData({ name: '', comment: '', shelter: '', neighborhood: '' });
      setErrors({ name: false, comment: false, shelter: false, neighborhood: false });
      setFormOpen(false);
      setSuccessSnackbarOpen(true);
      await fetchComments();
    } catch (error) {
      console.error('Error sending comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessSnackbarOpen(false);
  };

  const sliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 4000,
      pauseOnHover: true,
      responsive: [
        { breakpoint: 960, settings: { slidesToShow: 2 } },
        { breakpoint: 600, settings: { slidesToShow: 1 } },
      ],
      arrows: !isMobile,
      appendDots: (dots: React.ReactNode) => (
        <Box 
          sx={{ 
            mt: { xs: 1, md: 2 },
            '& .slick-dots': {
              bottom: 'auto',
              position: 'relative',
              '& li': {
                width: { xs: '6px', md: '10px' },
                height: { xs: '6px', md: '10px' },
                margin: { xs: '0 3px', md: '0 5px' },
                '& button': {
                  width: { xs: '6px', md: '10px' },
                  height: { xs: '6px', md: '10px' },
                  padding: 0,
                  '&::before': {
                    fontSize: { xs: '6px', md: '10px' },
                    color: 'rgba(0, 0, 0, 0.3)',
                    opacity: 1,
                  },
                },
                '&.slick-active button::before': {
                  color: theme.palette.primary.main,
                  opacity: 1,
                },
              },
            },
          }}
        >
          <ul style={{ margin: 0, padding: 0, display: 'flex', justifyContent: 'center' }}>{dots}</ul>
        </Box>
      ),
    }),
    [isMobile, theme]
  );

  const labels: Record<string, string> = {
    name: 'Nome (obrigatório)',
    comment: 'Comentário (obrigatório)',
    shelter: 'Abrigo (obrigatório)',
    neighborhood: 'Bairro (obrigatório)',
  };

  const placeholders: Record<string, string> = {
    name: 'Seu nome',
    comment: 'Escreva seu comentário aqui...',
    shelter: 'Ex: Abrigo do Amor',
    neighborhood: 'Ex: Jardim das Flores',
  };

  const fieldIcons: Record<string, React.ReactNode> = {
    name: <PersonIcon />,
    comment: <CommentIcon />,
    shelter: <HomeIcon />,
    neighborhood: <LocationOnIcon />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 2.5, md: 4 },
          mt: 0,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
          border: '1px solid rgba(25, 118, 210, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: 'linear-gradient(180deg, #1976d2 0%, #1565c0 100%)',
            borderRadius: '0 4px 4px 0',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(25, 118, 210, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: { xs: 2.5, md: 4 },
            }}
          >
            <Box
              sx={{
                p: { xs: 1, md: 1.5 },
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: { xs: 1.5, md: 2 },
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              }}
            >
              <CommentIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.8rem' } }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.6rem' },
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.3px',
              }}
            >
              Comentários dos Professores
            </Typography>
          </Box>

          <Box sx={{ mb: { xs: 2, md: 4 } }}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="contained"
                size="medium"
                startIcon={<ExpandMoreIcon sx={{ transform: formOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />}
                onClick={() => setFormOpen(!formOpen)}
                sx={{
                  mb: { xs: 2, md: 3 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  px: { xs: 2, sm: 2.5, md: 3 },
                  py: { xs: 1, sm: 1.1, md: 1.5 },
                  minWidth: { xs: 'auto', md: 'auto' },
                  width: { xs: '100%', md: 'auto' },
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 0.5, md: 1 },
                    '& svg': {
                      fontSize: { xs: '1rem', md: '1.25rem' },
                    },
                  },
                }}
              >
                {formOpen ? 'Fechar' : 'Adicionar Comentário'}
              </Button>
            </motion.div>

            <Collapse in={formOpen}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                    border: `1px solid ${theme.palette.primary.main}20`,
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary.main"
                      sx={{ mb: { xs: 2, md: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}
                    >
                      Compartilhe sua experiência
                    </Typography>

                    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
                      {['name', 'comment', 'shelter', 'neighborhood'].map((field) => (
                        <Grid item xs={12} md={field === 'comment' ? 8 : 4} key={field}>
                          <Box sx={{ position: 'relative' }}>
                            <TextField
                              fullWidth
                              required
                              label={labels[field]}
                              placeholder={placeholders[field]}
                              variant="outlined"
                              size="medium"
                              multiline={field === 'comment'}
                              rows={field === 'comment' ? 4 : 1}
                              value={formData[field as keyof typeof formData]}
                              onChange={(e) =>
                                setFormData({ ...formData, [field]: e.target.value })
                              }
                              error={errors[field as keyof typeof errors]}
                              helperText={
                                errors[field as keyof typeof errors]
                                  ? `${labels[field].split(' ')[0]} é obrigatório`
                                  : ''
                              }
                              InputProps={{
                                startAdornment: (
                                  <Box sx={{ mr: 1, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                                    {fieldIcons[field]}
                                  </Box>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                  },
                                },
                                '& .MuiInputLabel-root': {
                                  fontSize: { xs: '0.875rem', md: '1rem' },
                                },
                                '& .MuiOutlinedInput-input': {
                                  fontSize: { xs: '0.875rem', md: '1rem' },
                                  padding: { xs: '12px 14px', md: '16px 14px' },
                                },
                              }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    <Box sx={{ textAlign: 'center' }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          size="medium"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          endIcon={
                            isSubmitting ? (
                              <CircularProgress color="inherit" size={16} />
                            ) : (
                              <SendIcon sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }} />
                            )
                          }
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                            px: { xs: 2, sm: 2.5, md: 4 },
                            py: { xs: 0.9, sm: 1, md: 1.5 },
                            minWidth: { xs: 'auto', md: 'auto' },
                            boxShadow: 2,
                            '&:hover': {
                              boxShadow: 4,
                            },
                            '&:disabled': {
                              opacity: 0.7,
                            },
                          }}
                        >
                          {isSubmitting ? 'Enviando...' : 'Enviar Comentário'}
                        </Button>
                      </motion.div>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Collapse>
          </Box>

          {/* Comentários */}
          <AnimatePresence>
            {comments.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box sx={{
                  position: 'relative',
                  px: { xs: 0, md: 1 },
                  '& .slick-prev:before, & .slick-next:before': {
                    color: theme.palette.primary.main,
                    fontSize: { xs: '20px', md: '28px' }
                  },
                  '& .slick-prev': {
                    left: { xs: -10, md: -30 },
                    zIndex: 2,
                  },
                  '& .slick-next': {
                    right: { xs: -10, md: -30 },
                    zIndex: 2,
                  },
                  '& .slick-arrow': {
                    width: { xs: 28, md: 40 },
                    height: { xs: 28, md: 40 },
                    backgroundColor: { xs: 'rgba(255,255,255,0.95)', md: 'transparent' },
                    borderRadius: { xs: '50%', md: 0 },
                    boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.15)', md: 'none' },
                    '&:before': {
                      fontSize: { xs: '18px', md: '28px' },
                      color: theme.palette.primary.main,
                    },
                    '&:hover': {
                      backgroundColor: { xs: 'rgba(255,255,255,1)', md: 'transparent' },
                    },
                  },
                }}>
                  <Slider {...sliderSettings}>
                    {comments.map((comment, index) => (
                      <Box
                        key={comment.id}
                        sx={{
                          p: { xs: 0.25, sm: 0.5, md: 2 },
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ y: { xs: 0, md: -8 } }}
                          style={{ width: '100%' }}
                        >
                          <Card
                            elevation={4}
                            sx={{
                              width: '100%',
                              maxWidth: { xs: '100%', md: 400 },
                              minHeight: { xs: 'auto', md: 320 },
                              borderRadius: { xs: 2, md: 3 },
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                              border: `2px solid ${theme.palette.primary.main}15`,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                elevation: { xs: 4, md: 12 },
                                transform: { xs: 'none', md: 'translateY(-4px)' },
                                borderColor: theme.palette.primary.main,
                                boxShadow: { xs: 'none', md: `0 20px 40px ${theme.palette.primary.main}20` },
                              },
                            }}
                          >
                            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, md: 2 } }}>
                                <Avatar
                                  sx={{
                                    bgcolor: 'primary.main',
                                    mr: { xs: 1, md: 2 },
                                    width: { xs: 32, sm: 36, md: 48 },
                                    height: { xs: 32, sm: 36, md: 48 },
                                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.2rem' },
                                  }}
                                >
                                  {comment.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color="primary.main"
                                    sx={{
                                      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1.1rem' },
                                      mb: { xs: 0.25, md: 0.5 },
                                    }}
                                  >
                                    {comment.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}
                                  >
                                    {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                                  </Typography>
                                </Box>
                              </Box>

                              {/* Conteúdo do Comentário */}
                              <Box sx={{ flexGrow: 1, mb: { xs: 1, md: 2 } }}>
                                <Paper
                                  elevation={1}
                                  sx={{
                                    p: { xs: 1.25, sm: 1.5, md: 2 },
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
                                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{
                                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '1rem' },
                                      lineHeight: { xs: 1.4, md: 1.6 },
                                      color: 'text.primary',
                                      fontStyle: 'italic',
                                    }}
                                  >
                                    "{comment.comment}"
                                  </Typography>
                                </Paper>
                              </Box>

                              {/* Footer com informações */}
                              <Box sx={{ mt: 'auto' }}>
                                <Stack direction="row" spacing={{ xs: 0.5, md: 1 }} flexWrap="wrap" useFlexGap>
                                  <Chip
                                    icon={<HomeIcon sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }} />}
                                    label={comment.shelter}
                                    size="small"
                                    sx={{
                                      bgcolor: 'primary.light',
                                      color: 'white',
                                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                                      height: { xs: 22, sm: 24, md: 28 },
                                      '& .MuiChip-label': {
                                        px: { xs: 0.75, md: 1 },
                                      },
                                    }}
                                  />
                                  <Chip
                                    icon={<LocationOnIcon sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }} />}
                                    label={comment.neighborhood}
                                    size="small"
                                    sx={{
                                      bgcolor: 'secondary.light',
                                      color: 'white',
                                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                                      height: { xs: 22, sm: 24, md: 28 },
                                      '& .MuiChip-label': {
                                        px: { xs: 0.75, md: 1 },
                                      },
                                    }}
                                  />
                                </Stack>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Box>
                    ))}
                  </Slider>
                </Box>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
                  }}
                >
                  <CommentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Nenhum comentário publicado ainda
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Envie o seu e ele aparecerá após avaliação.
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Paper>

      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={8000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: 6,
          }}
        >
          ✅ Comentário enviado com sucesso! Ele será avaliado antes de ser publicado.
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default CommentsSection;
