import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { gradients } from '@/theme';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Alert,
  Tooltip,
  Fab,
  Skeleton,
  Paper,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import api from '@/config/axiosConfig';
import { RootState, AppDispatch } from '@/store/slices';
import { fetchRoutes } from '@/store/slices/route/routeSlice';
import { UserRole } from 'store/slices/auth/authSlice';
import ShelterSectionImageView from './ShelterSectionImageView';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ButtonSection from './../../TeacherArea/components/Buttons/FofinhoButton';
import {
  setSectionData,
  appendSections,
  updatePagination,
  PaginatedSectionResponse,
} from '@/store/slices/image-section-pagination/imageSectionPaginationSlice';

interface ShelterFeedViewProps {
  idToFetch?: string;
  feed?: boolean;
}

function SectionSkeleton() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mb: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={2}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width="20%" height={20} />
          </Stack>
        </Stack>
      </Paper>
    </motion.div>
  );
}

export default function ShelterFeedView({ feed = true }: ShelterFeedViewProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { section } = useSelector(
    (state: RootState) => state.imageSectionPagination
  );
  
  const sections = section?.sections || [];
  const loading = false; // Add loading state management if needed
  const error = null; // Add error state management if needed
  const hasMore = section ? section.sections.length < section.total : false;
  const currentPage = 1; // Add pagination state management if needed
  const totalPages = section ? Math.ceil(section.total / section.limit) : 0;

  const [initialLoading, setInitialLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const feedId = import.meta.env.VITE_FEED_MINISTERIO_ID;

  const loadSections = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      try {
        const endpoint = feed ? `/image-sections/feed/${feedId}` : '/image-sections';
        const response = await api.get<PaginatedSectionResponse>(endpoint, {
          params: {
            page,
            limit: 10,
          },
        });

        const responseData = response.data;

        if (reset || page === 1) {
          dispatch(setSectionData(responseData));
        } else {
          dispatch(appendSections(responseData.sections));
        }
      } catch (err) {
        console.error('Erro ao carregar seções:', err);
      } finally {
        if (page === 1) {
          setInitialLoading(false);
        }
      }
    },
    [dispatch, feed, feedId]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore && currentPage < totalPages) {
      loadSections(currentPage + 1, false);
    }
  }, [loading, hasMore, currentPage, totalPages, loadSections]);

  useEffect(() => {
    loadSections(1, true);
  }, [loadSections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  if (initialLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <IconButton onClick={handleGoBack} sx={{ color: 'primary.main' }}>
              <ArrowBackIcon />
            </IconButton>
            <Skeleton variant="text" width={200} height={40} />
          </Stack>
        </Box>
        
        {Array.from({ length: 3 }).map((_, index) => (
          <SectionSkeleton key={index} />
        ))}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ background: gradients.subtle.greenWhite, minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <IconButton
              onClick={handleGoBack}
              sx={{
                color: 'primary.main',
                bgcolor: 'primary.50',
                '&:hover': { bgcolor: 'primary.100' },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Box
              sx={{
                background: gradients.primary.main,
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                color: 'white',
                flex: 1,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                📰 Feed Orfanato
              </Typography>
            </Box>
          </Stack>

          {isAuthenticated && user?.role === UserRole.TEACHER && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <ButtonSection references={['photos']} />
            </motion.div>
          )}
        </Box>
      </motion.div>

      {/* Content */}
      {sections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 4 },
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'background.paper',
            }}
          >
            <PhotoLibraryIcon
              sx={{
                fontSize: { xs: 48, md: 64 },
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              fontWeight="600"
              sx={{ mb: 2, color: 'text.primary' }}
            >
              Nenhum conteúdo encontrado
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              O feed de notícias do Abrigo ainda não possui conteúdo.
            </Typography>
          </Paper>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {sections.map((sectionItem) => (
              <motion.div
                key={sectionItem.id}
                variants={itemVariants}
                layout
              >
                <ShelterSectionImageView
                  caption={sectionItem.caption}
                  description={sectionItem.description}
                  mediaItems={sectionItem.mediaItems}
                  createdAt={sectionItem.createdAt ? new Date(sectionItem.createdAt) : undefined}
                  updatedAt={sectionItem.updatedAt ? new Date(sectionItem.updatedAt) : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator for infinite scroll */}
          <div ref={loadingRef} style={{ height: '20px', margin: '20px 0' }}>
            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Carregando mais conteúdo...
                </Typography>
              </Box>
            )}
          </div>

          {!hasMore && sections.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Box textAlign="center" sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Você chegou ao final do feed! 🎉
                </Typography>
              </Box>
            </motion.div>
          )}
        </motion.div>
      )}
      </Container>
    </Box>
  );
}


