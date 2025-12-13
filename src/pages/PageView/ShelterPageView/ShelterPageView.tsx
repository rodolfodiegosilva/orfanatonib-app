import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Avatar,
  Stack,
  IconButton,
} from '@mui/material';
import {
  PlaceOutlined,
  LocationCityOutlined,
  MapOutlined,
  LocalPostOfficeOutlined,
  PersonOutline,
  SchoolOutlined,
  GroupOutlined,
  HomeOutlined,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { apiFetchShelter } from '@/features/shelters/api';
import { ShelterResponseDto } from '@/features/shelters/types';
import { fmtDate } from '@/utils/dates';

interface ShelterPageViewProps {
  idToFetch: string;
}

export default function ShelterPageView({ idToFetch }: ShelterPageViewProps) {
  const navigate = useNavigate();
  const [shelter, setShelter] = useState<ShelterResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShelter = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetchShelter(idToFetch);
        setShelter(data);
      } catch (err: any) {
        console.error('Erro ao carregar abrigo:', err);
        setError(err?.response?.data?.message || 'Erro ao carregar o abrigo. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (idToFetch) {
      fetchShelter();
    }
  }, [idToFetch]);

  // ⚠️ IMPORTANTE: Todos os hooks devem ser chamados ANTES de qualquer early return
  // Remover líderes duplicados (um líder pode estar em múltiplas equipes)
  const uniqueLeaders = useMemo(() => {
    if (!shelter?.leaders || shelter.leaders.length === 0) return [];
    const leadersMap = new Map<string, (typeof shelter.leaders)[0]>();
    shelter.leaders.forEach((leader) => {
      if (!leadersMap.has(leader.id)) {
        leadersMap.set(leader.id, leader);
      }
    });
    return Array.from(leadersMap.values());
  }, [shelter?.leaders]);

  // Remover professores duplicados (um professor só pode estar em uma equipe, mas por segurança)
  const uniqueTeachers = useMemo(() => {
    if (!shelter?.teachers || shelter.teachers.length === 0) return [];
    const teachersMap = new Map<string, (typeof shelter.teachers)[0]>();
    shelter.teachers.forEach((teacher) => {
      if (!teachersMap.has(teacher.id)) {
        teachersMap.set(teacher.id, teacher);
      }
    });
    return Array.from(teachersMap.values());
  }, [shelter?.teachers]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!shelter) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Abrigo não encontrado.
        </Alert>
      </Container>
    );
  }

  const address = shelter.address;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box 
            sx={{ 
              mb: 4, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(66, 165, 245, 0.05) 100%)',
            }}
          >
            <IconButton 
              onClick={handleBack} 
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              }}
            >
              <HomeOutlined sx={{ fontSize: 28 }} />
            </Box>
            <Typography 
              variant="h4" 
              fontWeight={800}
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              Detalhes do Abrigo
            </Typography>
          </Box>
        </motion.div>

        {/* Imagem do Abrigo */}
        {shelter.mediaItem?.url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Paper
              elevation={4}
              sx={{
                mb: 4,
                borderRadius: 4,
                overflow: 'hidden',
                height: { xs: 280, md: 450 },
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <Box
                component="img"
                src={shelter.mediaItem.url}
                alt={shelter.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Paper>
          </motion.div>
        )}

        {/* Informações Principais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper 
            elevation={4} 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: 4, 
              mb: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              border: '2px solid',
              borderColor: 'primary.light',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)',
              },
            }}
          >
            <Typography 
              variant="h3" 
              fontWeight={900} 
              gutterBottom 
              sx={{ 
                mb: 2.5,
                fontSize: { xs: '1.9rem', md: '2.8rem' },
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {shelter.name}
            </Typography>

          {shelter.description && (
            <Box
              sx={{
                mb: 4,
                p: 2.5,
                borderRadius: 2,
                bgcolor: 'rgba(25, 118, 210, 0.03)',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
              }}
            >
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  lineHeight: 1.8,
                  fontStyle: 'italic',
                }}
              >
                {shelter.description}
              </Typography>
            </Box>
          )}

          {/* Endereço */}
          {address && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Box 
                sx={{ 
                  mb: 3,
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                  border: '2px solid',
                  borderColor: 'primary.light',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.15)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2.5,
                    pb: 2,
                    borderBottom: '2px solid',
                    borderColor: 'primary.light',
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlaceOutlined sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={800} 
                    sx={{ 
                      color: 'primary.main',
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                    }}
                  >
                    Endereço
                  </Typography>
                </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                    <MapOutlined fontSize="small" color="primary" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Rua
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {address.street}
                        {address.number && `, ${address.number}`}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                    <LocationCityOutlined fontSize="small" color="primary" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Bairro
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {address.district}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                    <LocationCityOutlined fontSize="small" color="primary" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Cidade
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {address.city} - {address.state}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocalPostOfficeOutlined fontSize="small" color="primary" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        CEP
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {address.postalCode}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {address.complement && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Complemento
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {address.complement}
                    </Typography>
                  </Grid>
                )}
              </Grid>
              </Box>
            </motion.div>
          )}

          {/* Equipes */}
          {shelter.teamsQuantity && shelter.teamsQuantity > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Box 
                sx={{ 
                  mb: 3,
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(156, 39, 176, 0.08)',
                  border: '2px solid',
                  borderColor: 'secondary.light',
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(156, 39, 176, 0.15)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'secondary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GroupOutlined sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={800} 
                    sx={{ 
                      color: 'secondary.main',
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                    }}
                  >
                    Equipes ({shelter.teamsQuantity})
                  </Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    fontWeight: 500,
                    pl: 5.5,
                  }}
                >
                  Este abrigo possui {shelter.teamsQuantity} equipe{shelter.teamsQuantity > 1 ? 's' : ''} de trabalho.
                </Typography>
              </Box>
            </motion.div>
          )}

          {/* Líderes */}
          {uniqueLeaders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Box 
                sx={{ 
                  mb: 3,
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(25, 118, 210, 0.04)',
                  border: '1px solid',
                  borderColor: 'primary.light',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PersonOutline sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={800} 
                    sx={{ 
                      color: 'primary.main',
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                    }}
                  >
                    Líderes ({uniqueLeaders.length})
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1.5}>
                  {uniqueLeaders.map((leader, index) => (
                    <motion.div
                      key={leader.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    >
                      <Chip
                        avatar={
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.main', 
                              fontWeight: 700,
                              fontSize: '1rem',
                            }}
                          >
                            {leader.user?.name?.charAt(0)?.toUpperCase() || 'L'}
                          </Avatar>
                        }
                        label={leader.user?.name || 'Sem nome'}
                        variant="outlined"
                        color="primary"
                        sx={{
                          fontSize: '1rem',
                          height: 40,
                          px: 1,
                          borderWidth: 2,
                          '& .MuiChip-label': {
                            fontWeight: 600,
                            px: 1.5,
                          },
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </motion.div>
                  ))}
                </Stack>
              </Box>
            </motion.div>
          )}

          {/* Professores */}
          {uniqueTeachers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Box 
                sx={{ 
                  mb: 3,
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'rgba(156, 39, 176, 0.04)',
                  border: '1px solid',
                  borderColor: 'secondary.light',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'secondary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SchoolOutlined sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    fontWeight={800} 
                    sx={{ 
                      color: 'secondary.main',
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                    }}
                  >
                    Professores ({uniqueTeachers.length})
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1.5}>
                  {uniqueTeachers.map((teacher, index) => (
                    <motion.div
                      key={teacher.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    >
                      <Chip
                        avatar={
                          <Avatar 
                            sx={{ 
                              bgcolor: 'secondary.main', 
                              fontWeight: 700,
                              fontSize: '1rem',
                            }}
                          >
                            {teacher.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                          </Avatar>
                        }
                        label={teacher.user?.name || 'Sem nome'}
                        variant="outlined"
                        color="secondary"
                        sx={{
                          fontSize: '1rem',
                          height: 40,
                          px: 1,
                          borderWidth: 2,
                          '& .MuiChip-label': {
                            fontWeight: 600,
                            px: 1.5,
                          },
                          '&:hover': {
                            bgcolor: 'secondary.main',
                            color: 'white',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </motion.div>
                  ))}
                </Stack>
              </Box>
            </motion.div>
          )}

          {/* Informações de Data */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Box 
              sx={{ 
                mt: 4, 
                pt: 3, 
                borderTop: '2px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                  Criado em
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                  {fmtDate(shelter.createdAt)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                  Atualizado em
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                  {fmtDate(shelter.updatedAt)}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
}

