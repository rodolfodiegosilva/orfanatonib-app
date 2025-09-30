import React, { useState } from 'react';
import { Drawer, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NavLinks from './NavLinks';

const MobileNavigation: React.FC = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen(s => !s);
  const closeDrawer = () => setOpen(false);

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <IconButton
        onClick={toggleDrawer}
        sx={{ 
          color: '#FFFF00',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 0, 0.1)',
            color: '#FFFFFF'
          }
        }}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
      >
        {open ? <CloseIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: { xs: '100dvw', sm: 360 },
            maxWidth: '100dvw',
            height: { xs: '100dvh', sm: '100vh' },
            bgcolor: '#000000',
            boxSizing: 'border-box',
            pt: 'max(env(safe-area-inset-top), 16px)',
            pb: 'max(env(safe-area-inset-bottom), 16px)',
            px: 2,
            overflowX: 'hidden',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          },
        }}
      >
        <NavLinks closeMenu={closeDrawer} isMobile />
      </Drawer>
    </Box>
  );
};

export default MobileNavigation;
