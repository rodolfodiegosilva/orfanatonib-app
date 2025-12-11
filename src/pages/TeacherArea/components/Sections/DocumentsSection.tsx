import React, { Fragment, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import api from '@/config/axiosConfig';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import {
  setDocumentData,
  clearDocumentData,
} from 'store/slices/documents/documentSlice';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';
import { RouteData } from 'store/slices/route/routeSlice';

const DocumentsSection: React.FC = () => {
  const dispatch = useDispatch();
  const documentData = useSelector(
    (state: RootState) => state.document.documentData
  );
  const routes = useSelector((state: RootState) => state.routes.routes);
  const [openModal, setOpenModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documentRoutes = routes.filter(
    (route) => route.entityType === 'Document'
  );

  const handleOpenModal = async (route: RouteData) => {
    try {
      const response = await api.get(`/documents/${route.idToFetch}`);
      dispatch(setDocumentData(response.data));
      setOpenModal(true);
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      setError('Não foi possível carregar o documento.');
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    dispatch(clearDocumentData());
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const truncateDescription = (
    description: string | undefined,
    maxLength: number
  ) => {
    if (!description) return 'Sem descrição';
    return description.length > maxLength
      ? `${description.substring(0, maxLength)}...`
      : description;
  };

  const displayedRoutes = isExpanded
    ? documentRoutes
    : documentRoutes.slice(0, 4);

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
          p: { xs: 2.5, md: 4 },
          mt: 0,
          background: 'linear-gradient(135deg, rgba(2, 136, 209, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%)',
          borderRadius: 3,
          border: '1px solid rgba(2, 136, 209, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: 'linear-gradient(180deg, #0288d1 0%, #01579b 100%)',
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
              background: 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              color: 'white',
              mr: { xs: 1.5, md: 2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 136, 209, 0.3)',
            }}
          >
            <DescriptionIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.8rem' } }} />
          </Box>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.6rem' },
              background: 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.3px',
            }}
          >
            Documentos Importantes
          </Typography>
        </Box>

      {error ? (
        <Typography variant="body2" color="error" textAlign="center">
          {error}
        </Typography>
      ) : documentRoutes.length > 0 ? (
        <Fragment>
          <Grid container spacing={3}>
            {displayedRoutes.map((route) => (
              <Grid item xs={12} sm={6} md={3} key={route.id}>
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
                      border: '1px solid rgba(2, 136, 209, 0.1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(2, 136, 209, 0.2)',
                        borderColor: '#0288d1',
                      },
                    }}
                    onClick={() => handleOpenModal(route)}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          color: '#0288d1',
                          mb: { xs: 1, md: 1.5 },
                          fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                          lineHeight: 1.3,
                        }}
                      >
                        {route.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                          fontSize: { xs: '0.85rem', md: '0.9rem' },
                        }}
                      >
                        {truncateDescription(route.description, 70)}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {documentRoutes.length > 4 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  endIcon={
                    isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                  }
                  onClick={handleToggleExpand}
                  sx={{
                    px: { xs: 2.5, sm: 3, md: 4 },
                    py: { xs: 1, sm: 1.25, md: 1.5 },
                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(2, 136, 209, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(2, 136, 209, 0.4)',
                    },
                  }}
                >
                  {isExpanded ? 'Ver menos' : 'Ver mais documentos'}
                </Button>
              </motion.div>
            </Box>
          )}
        </Fragment>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
        >
          Nenhum documento disponível no momento.
        </Typography>
      )}

      <MediaDocumentPreviewModal
        open={openModal}
        onClose={handleCloseModal}
        media={documentData?.media || null}
        title={documentData?.name}
      />
      </Paper>
    </motion.div>
  );
};

export default DocumentsSection;
