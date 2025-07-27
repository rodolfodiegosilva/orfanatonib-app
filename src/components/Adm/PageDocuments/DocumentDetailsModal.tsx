import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

interface DocumentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  document: any | null;
}

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <>
    <Box display="flex" alignItems="center" py={1.2}>
      <Typography
        variant="body2"
        fontWeight={600}
        color="grey.600"
        sx={{ mr: 1, whiteSpace: 'nowrap' }}
      >
        {label}:
      </Typography>
      <Typography
        variant="body1"
        fontWeight={500}
        color="text.primary"
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {value || 'N/A'}
      </Typography>
    </Box>
    <Divider />
  </>
);

const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({ open, onClose, document }) => {
  const handleCopyUrl = () => {
    if (document?.media?.url) {
      navigator.clipboard.writeText(document.media.url);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box display="flex" justifyContent="space-between" alignItems="center" px={3} pt={2}>
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            flexGrow: 1,
            p: 0,
            textAlign: 'center',
          }}
        >
          Detalhes do Documento
        </DialogTitle>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent dividers sx={{ px: 4, py: 3 }}>
        {/* Detalhes do Documento */}
        <Typography variant="h6" gutterBottom color="primary.main" sx={{ textAlign: 'center' }}>
          Detalhes do Documento
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <DetailField label="Nome" value={document?.name} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Descrição" value={document?.description} />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Mídia Vinculada */}
        <Typography variant="h6" gutterBottom color="primary.main" sx={{ textAlign: 'center' }}>
          Mídia Vinculada
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <DetailField label="Título da Mídia" value={document?.media?.title} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Descrição da Mídia" value={document?.media?.description} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Plataforma" value={document?.media?.platform} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailField label="Tipo de Upload" value={document?.media?.type} />
          </Grid>

          {/* URL em linha separada */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" py={1.2}>
              <Typography
                variant="body2"
                fontWeight={600}
                color="grey.600"
                sx={{ mr: 1, whiteSpace: 'nowrap' }}
              >
                URL:
              </Typography>
              <Typography
                variant="body1"
                fontWeight={500}
                color="text.primary"
                sx={{
                  wordBreak: 'break-all',
                  flex: 1,
                }}
              >
                {document?.media?.url || 'N/A'}
              </Typography>
              {document?.media?.url && (
                <Tooltip title="Copiar URL">
                  <IconButton onClick={handleCopyUrl} size="small" sx={{ ml: 1 }}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Divider />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDetailsModal;
