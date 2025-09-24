import { Box, Typography, useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import ImageIcon from '@mui/icons-material/Image';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { MediaItem, MediaUploadType, MediaPlatform } from 'store/slices/types';
import DownloadButton from './DownloadButton';
import { getMediaPreviewUrl } from 'utils/getMediaPreviewUrl';
import { useState } from 'react';

interface Props {
  image: MediaItem;
}

export default function IdeasImageGalleryView({ image }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [imageError, setImageError] = useState(false);

  const canVisualize =
    image.isLocalFile ||
    image.uploadType === MediaUploadType.UPLOAD ||
    image.platformType === MediaPlatform.GOOGLE_DRIVE;

  const finalUrl = getMediaPreviewUrl(image);

  const handleImageClick = () => {
    if (canVisualize && finalUrl && !imageError) {
      window.open(finalUrl, '_blank');
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      p: { xs: 1.5, sm: 2, md: 3 },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header com ícone */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, mb: { xs: 1.5, sm: 2 } }}>
          <ImageIcon sx={{ color: theme.palette.warning.main, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          <Typography 
            variant="subtitle1" 
            fontWeight="bold" 
            color={theme.palette.warning.main}
            sx={{ 
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
              lineHeight: 1.3,
            }}
          >
            {image.title}
          </Typography>
        </Box>

        {/* Imagem */}
        <Box 
          sx={{ 
            position: 'relative',
            borderRadius: { xs: 1.5, sm: 2 },
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            mb: { xs: 1.5, sm: 2 },
            flex: 1,
            minHeight: { xs: 150, sm: 200 },
            maxHeight: { xs: 250, sm: 300 },
            cursor: canVisualize && finalUrl && !imageError ? 'pointer' : 'default',
            '&:hover': canVisualize && finalUrl && !imageError ? {
              transform: 'scale(1.02)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            } : {},
            transition: 'all 0.3s ease',
          }}
          onClick={handleImageClick}
        >
          {canVisualize && finalUrl && !imageError ? (
            <>
              <img
                src={finalUrl}
                alt={image.title || 'Imagem'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
                onError={() => setImageError(true)}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  p: 0.5,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  '&:hover': {
                    opacity: 1,
                  },
                }}
              >
                <ZoomInIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
              </Box>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              backgroundColor: 'grey.100',
            }}>
              <Box textAlign="center">
                <ImageIcon sx={{ fontSize: '3rem', color: 'grey.400', mb: 1 }} />
                <Typography color="error" variant="body2">
                  {imageError ? 'Erro ao carregar imagem' : 'Visualização não disponível'}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Descrição */}
        {image.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            mb={{ xs: 1.5, sm: 2 }}
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
              lineHeight: 1.4,
            }}
          >
            {image.description}
          </Typography>
        )}

        {/* Botão de download */}
        <Box sx={{ mt: 'auto' }}>
          <DownloadButton 
            url={image.url} 
            filename={image.originalName || image.title || 'imagem'} 
            size="small"
            fullWidth={isMobile}
          />
        </Box>
      </motion.div>
    </Box>
  );
}
