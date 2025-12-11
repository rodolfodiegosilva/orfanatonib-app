import React, { useState, Fragment, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

import { selectVideoRoutes } from '@/store/selectors/routeSelectors';
import { RouteData } from '@/store/slices/route/routeSlice';

const TrainingVideosSection: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const videos: RouteData[] = useSelector(selectVideoRoutes);

  const filteredVideos = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return videos;
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(term) ||
        video.subtitle?.toLowerCase().includes(term)
    );
  }, [videos, search]);

  const visibleCount = isMobile ? 2 : 4;
  const videosToDisplay = expanded ? filteredVideos : filteredVideos.slice(0, visibleCount);

  const handleRedirect = (path: string) => {
    const absolutePath = `/${path.replace(/^\/+/, '')}`;
    navigate(absolutePath);
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
          background: 'linear-gradient(135deg, rgba(126, 87, 194, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
          borderRadius: 3,
          border: '1px solid rgba(126, 87, 194, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: 'linear-gradient(180deg, #7e57c2 0%, #512da8 100%)',
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
              background: 'linear-gradient(135deg, #7e57c2 0%, #512da8 100%)',
              color: 'white',
              mr: { xs: 1.5, md: 2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(126, 87, 194, 0.3)',
            }}
          >
            <VideoLibraryIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.8rem' } }} />
          </Box>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.6rem' },
              background: 'linear-gradient(135deg, #7e57c2 0%, #512da8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.3px',
            }}
          >
            Galeria de Vídeos
          </Typography>
        </Box>

        <TextField
          size="medium"
          placeholder="🔍 Buscar vídeos..."
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
                borderColor: 'rgba(126, 87, 194, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(126, 87, 194, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#7e57c2',
                borderWidth: 2,
              },
            },
            input: { 
              fontSize: { xs: '0.9rem', md: '1rem' },
              py: 1.5,
            },
          }}
        />

      {videosToDisplay.length > 0 ? (
        <Fragment>
          <Grid container spacing={3}>
            {videosToDisplay.map((video) => (
              <Grid item xs={12} sm={6} md={3} key={video.id}>
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
                      border: '1px solid rgba(126, 87, 194, 0.1)',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 24px rgba(126, 87, 194, 0.25)',
                        borderColor: '#7e57c2',
                        '& .card-image': {
                          transform: 'scale(1.1)',
                        },
                        '& .play-overlay': {
                          opacity: 1,
                        },
                      },
                    }}
                    onClick={() => handleRedirect(video.path)}
                  >
                    <Box sx={{ overflow: 'hidden', position: 'relative' }}>
                      <CardMedia
                        component="img"
                        image={video.image || 'https://via.placeholder.com/300x140?text=Vídeo'}
                        alt={video.title}
                        className="card-image"
                        sx={{
                          height: { xs: 160, md: 180 },
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                        }}
                      />
                      <Box
                        className="play-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, transparent 0%, rgba(126, 87, 194, 0.3) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        }}
                      >
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          <Box
                            sx={{
                              width: 0,
                              height: 0,
                              borderLeft: '20px solid #7e57c2',
                              borderTop: '12px solid transparent',
                              borderBottom: '12px solid transparent',
                              ml: 0.5,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          color: '#7e57c2',
                          mb: { xs: 0.75, md: 1 },
                          fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                          lineHeight: 1.3,
                        }}
                        gutterBottom
                      >
                        {video.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.5,
                          fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {video.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {filteredVideos.length > visibleCount && (
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
                    background: 'linear-gradient(135deg, #7e57c2 0%, #512da8 100%)',
                    boxShadow: '0 4px 12px rgba(126, 87, 194, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(126, 87, 194, 0.4)',
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
            Nenhum vídeo encontrado.
          </Typography>
        </Box>
      )}
      </Paper>
    </motion.div>
  );
};

export default TrainingVideosSection;
