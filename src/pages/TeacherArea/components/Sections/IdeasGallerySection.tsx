import React, { Fragment, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { useSelector } from 'react-redux';
import { RootState } from 'store/slices';
import { MediaTargetType } from 'store/slices/types';

const IdeasGallerySection: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { routes, loading } = useSelector((state: RootState) => state.routes);

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const filteredIdeas = routes.filter((route) => route.entityType === MediaTargetType.IdeasPage)
    .filter((idea) =>
      idea.title.toLowerCase().includes(search.toLowerCase()) ||
      idea.subtitle.toLowerCase().includes(search.toLowerCase())
    );

  const visibleCount = isMobile ? 2 : 4;
  const ideasToDisplay = expanded ? filteredIdeas : filteredIdeas.slice(0, visibleCount);

  const handleRedirect = (path: string) => {
    navigate(`/${path}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 2, sm: 2.5, md: 4 },
          mt: 0,
          background: 'linear-gradient(135deg, rgba(171, 71, 188, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
          borderRadius: 3,
          border: '1px solid rgba(171, 71, 188, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: 'linear-gradient(180deg, #ab47bc 0%, #7b1fa2 100%)',
            borderRadius: '0 4px 4px 0',
          },
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: { xs: 2.5, md: 4 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              p: { xs: 1, md: 1.5 },
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)',
              color: 'white',
              mr: { xs: 1.5, md: 2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(171, 71, 188, 0.3)',
            }}
          >
            <LightbulbOutlinedIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.8rem' } }} />
          </Box>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.6rem' },
              background: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.3px',
            }}
          >
            Galeria de Ideias
          </Typography>
        </Box>

        <TextField
          size="medium"
          placeholder="🔍 Buscar ideias..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{
            mb: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(171, 71, 188, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(171, 71, 188, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ab47bc',
                borderWidth: 2,
              },
            },
            input: { 
              fontSize: { xs: '0.9rem', md: '1rem' },
              py: 1.5,
            },
          }}
        />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredIdeas.length > 0 ? (
        <Fragment>
          <Grid container spacing={3}>
            {ideasToDisplay.map((idea) => (
              <Grid item xs={12} sm={6} md={3} key={idea.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      cursor: 'pointer',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(171, 71, 188, 0.1)',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 24px rgba(171, 71, 188, 0.25)',
                        borderColor: '#ab47bc',
                        '& .card-image': {
                          transform: 'scale(1.1)',
                        },
                      },
                    }}
                    onClick={() => handleRedirect(idea.path)}
                  >
                    <Box sx={{ overflow: 'hidden', position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={idea.image || ''}
                        alt={idea.title}
                        className="card-image"
                        sx={{
                          height: { xs: 160, md: 180 },
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, transparent 0%, rgba(171, 71, 188, 0.1) 100%)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          '&:hover': {
                            opacity: 1,
                          },
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          color: '#ab47bc',
                          mb: { xs: 0.75, md: 1 },
                          fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                          lineHeight: 1.3,
                        }}
                        gutterBottom
                      >
                        {idea.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.5,
                          fontSize: { xs: '0.85rem', md: '0.9rem' },
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {idea.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {filteredIdeas.length > visibleCount && (
            <Box textAlign="center" mt={4}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => setExpanded((prev) => !prev)}
                  sx={{
                    px: { xs: 2.5, sm: 3, md: 4 },
                    py: { xs: 1, sm: 1.25, md: 1.5 },
                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)',
                    boxShadow: '0 4px 12px rgba(171, 71, 188, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(171, 71, 188, 0.4)',
                    },
                  }}
                >
                  {expanded ? 'Ver menos' : 'Ver mais'}
                </Button>
              </motion.div>
            </Box>
          )}
        </Fragment>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              fontWeight: 500,
            }}
          >
            Nenhuma galeria de ideias encontrada.
          </Typography>
        </Box>
      )}
      </Paper>
    </motion.div>
  );
};

export default IdeasGallerySection;
