import React from 'react';
import { gradients } from '@/theme';
import {
  Container,
  Typography,
  Paper,
  Divider,
  Box,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { 
  InformativeBanner,
  FofinhoButton,
  SpecialFamilyCallout, 
  IdeasSharingBanner,
  BannerSection,
  MotivationSection,
  TeacherContent,
} from './components';
import { useTeacherArea } from './hooks';
import { MOTIVATION_TEXT, CONTAINER_STYLES } from './constants';

const TeacherArea: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { loading, showWeek, showMeditation } = useTeacherArea();

  return (
    <Box sx={{ background: gradients.subtle.greenWhite, minHeight: '100vh' }}>
      <Container maxWidth={false} sx={CONTAINER_STYLES.main}>
      {/* Informative Banner */}
      <InformativeBanner />

      {/* Special Family Callout - Commented out for now */}
      {/* <SpecialFamilyCallout /> */}

      <BannerSection 
        showWeekBanner={showWeek} 
        showMeditationBanner={showMeditation} 
      />

      <FofinhoButton 
        references={['materials', 'shelteredrenArea', 'photos', 'rate', 'events', 'help']} 
      />

      <MotivationSection motivationText={MOTIVATION_TEXT} />

      <Paper elevation={4} sx={CONTAINER_STYLES.paper}>
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#000000"
          gutterBottom
          sx={{ fontSize: { xs: '1.3rem', md: '1.5rem' } }}
        >
          Área do Professor
        </Typography>

        <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

        {isAuthenticated ? (
          loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TeacherContent userName={user?.name} />
          )
        ) : (
            <Typography variant="body1" color="#333333">
            Você precisa estar logado para acessar esta área.
          </Typography>
        )}
      </Paper>
      </Container>
    </Box>
  );
};

export default TeacherArea;
