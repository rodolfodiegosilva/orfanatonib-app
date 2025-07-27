import React from 'react';
import { Box, Typography, IconButton, Link, Stack, useTheme, useMediaQuery } from '@mui/material';
import {
  FaFacebook as FacebookIcon,
  FaInstagram as InstagramIcon,
  FaYoutube as YoutubeIcon,
} from 'react-icons/fa6';

const Footer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#e3ce1d',
        color: 'white',
        px: 3,
        py: 4,
        textAlign: 'center',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        position: 'relative',
        width: '100%',
      }}
    >
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={isMobile ? 3 : 6}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        textAlign="center"
      >
        {/* Navegação */}
        <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
          <Link href="/" underline="hover" color="inherit" fontWeight="medium">
            Início
          </Link>
          <Link href="/sobre" underline="hover" color="inherit" fontWeight="medium">
            Sobre
          </Link>
          <Link href="/eventos" underline="hover" color="inherit" fontWeight="medium">
            Eventos
          </Link>
          <Link href="/contato" underline="hover" color="inherit" fontWeight="medium">
            Contato
          </Link>
        </Stack>

        {/* Redes sociais */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <IconButton
            component="a"
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <FacebookIcon size={20} />
          </IconButton>
          <IconButton
            component="a"
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <InstagramIcon size={20} />
          </IconButton>
          <IconButton
            component="a"
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            color="inherit"
          >
            <YoutubeIcon size={20} />
          </IconButton>
        </Stack>

        {/* Direitos + Créditos */}
        <Stack spacing={0.5} alignItems="center">
          <Typography variant="body2" sx={{ fontSize: '0.85rem', textAlign: 'center' }}>
            © 2025 NIB - Nova Igreja Batista. Todos os direitos reservados.
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.85rem', textAlign: 'center' }}>
            Desenvolvido por{' '}
            <Link
              href="https://rodolfo-silva.com"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              fontWeight="bold"
              underline="hover"
            >
              Diego Seven System
            </Link>
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Footer;
