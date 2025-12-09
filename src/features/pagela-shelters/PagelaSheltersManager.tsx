import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
  Grid,
  Container,
  Paper,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { motion } from "framer-motion";

import { SectionHeader } from "./components/SectionHeader";
import { SheltersPanel } from "./components/SheltersPanel";
import { PagelasPanel } from "./components/PagelasPanel";
import { ShelteredPanel } from "./components/ShelteredPanel";
import { usePagelaSheltersManager } from "./hooks";

import type { ShelterDto } from "./types";
import BackHeader from "@/components/common/header/BackHeader";

type MobileStep = "shelters" | "sheltered" | "pagelas";

export default function PagelaSheltersManager() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [mobileStep, setMobileStep] = useState<MobileStep>("shelters");

  const {
    selectedShelter,
    selectedSheltered,
    shelters,
    sheltered,
    pagelas,
    handleShelterSelect,
    handleShelteredSelect,
    handleBack,
    handleSheltersSearchChange,
    handleShelteredSearchChange,
    handlePagelasSearchChange,
  } = usePagelaSheltersManager();

  useEffect(() => {
    if (!isMobile) return;
    if (!selectedShelter) setMobileStep("shelters");
    else if (!selectedSheltered) setMobileStep("sheltered");
    else setMobileStep("pagelas");
  }, [isMobile, selectedShelter, selectedSheltered]);

  const handleMobileBack = () => {
    if (!isMobile) return;
    if (mobileStep === "pagelas") {
      handleShelteredSelect(null as any);
      setMobileStep("sheltered");
    } else if (mobileStep === "sheltered") {
      handleShelterSelect(null as any);
      setMobileStep("shelters");
    }
  };

  const renderMobileContent = () => {
    switch (mobileStep) {
      case "shelters":
        return (
          <SheltersPanel
            shelters={shelters.data?.items || []}
            loading={shelters.loading}
            error={shelters.error}
            onShelterSelect={handleShelterSelect}
            selectedShelter={selectedShelter}
            currentPage={shelters.currentPage}
            totalPages={shelters.totalPages}
            onPageChange={shelters.handlePageChange}
            onSearchChange={handleSheltersSearchChange}
          />
        );
      case "sheltered":
        return (
          <ShelteredPanel
            sheltered={sheltered.data?.data || []}
            loading={sheltered.loading}
            error={sheltered.error}
            onShelteredSelect={handleShelteredSelect}
            selectedSheltered={selectedSheltered}
            shelterName={selectedShelter?.name || ""}
            currentPage={sheltered.currentPage}
            totalPages={sheltered.totalPages}
            onPageChange={sheltered.handlePageChange}
            onSearchChange={handleShelteredSearchChange}
          />
        );
      case "pagelas":
        return (
          <PagelasPanel
            pagelas={pagelas.data?.items || []}
            loading={pagelas.loading}
            error={pagelas.error}
            shelteredName={selectedSheltered?.name || ""}
            shelterName={selectedShelter?.name || ""}
            currentPage={pagelas.currentPage}
            totalPages={pagelas.totalPages}
            onPageChange={pagelas.handlePageChange}
            onSearchChange={handlePagelasSearchChange}
          />
        );
      default:
        return null;
    }
  };

  const renderDesktopContent = () => (
    <Grid container spacing={2} alignItems="stretch">
      <Grid item xs={12} md={4}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SheltersPanel
            shelters={shelters.data?.items || []}
            loading={shelters.loading}
            error={shelters.error}
            onShelterSelect={handleShelterSelect}
            selectedShelter={selectedShelter}
            currentPage={shelters.currentPage}
            totalPages={shelters.totalPages}
            onPageChange={shelters.handlePageChange}
            onSearchChange={handleSheltersSearchChange}
          />
        </motion.div>
      </Grid>
      <Grid item xs={12} md={4}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ShelteredPanel
            sheltered={sheltered.data?.data || []}
            loading={sheltered.loading}
            error={sheltered.error}
            onShelteredSelect={handleShelteredSelect}
            selectedSheltered={selectedSheltered}
            shelterName={selectedShelter?.name || ""}
            currentPage={sheltered.currentPage}
            totalPages={sheltered.totalPages}
            onPageChange={sheltered.handlePageChange}
            onSearchChange={handleShelteredSearchChange}
          />
        </motion.div>
      </Grid>
      <Grid item xs={12} md={4}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <PagelasPanel
            pagelas={pagelas.data?.items || []}
            loading={pagelas.loading}
            error={pagelas.error}
            shelteredName={selectedSheltered?.name || ""}
            shelterName={selectedShelter?.name || ""}
            currentPage={pagelas.currentPage}
            totalPages={pagelas.totalPages}
            onPageChange={pagelas.handlePageChange}
            onSearchChange={handlePagelasSearchChange}
          />
        </motion.div>
      </Grid>
    </Grid>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 4,
        bgcolor: "background.default",
        py: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <BackHeader title="📋 Gerenciar Pagelas" />
        </motion.div>

        <Box sx={{ mt: { xs: 2, md: 3 } }}>
        {isMobile ? (
          <Box>
            {/* Mobile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper
                elevation={2}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                }}
              >
                <CardContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 } }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {mobileStep !== "shelters" && (
                      <IconButton
                        onClick={handleMobileBack}
                        size="small"
                        sx={{
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                    )}
                    {mobileStep === "shelters" && <Box sx={{ width: 40 }} />}
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        fontSize: { xs: "1.1rem", sm: "1.25rem" },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {mobileStep === "shelters" && "Abrigos"}
                      {mobileStep === "sheltered" && "Abrigados"}
                      {mobileStep === "pagelas" && "Pagelas"}
                    </Typography>
                  </Stack>
                </CardContent>
              </Paper>
            </motion.div>

            {renderMobileContent()}
          </Box>
        ) : (
          <Box>
            {/* Desktop Breadcrumbs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper
                elevation={2}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                }}
              >
                <CardContent sx={{ py: 2 }}>
                  <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
                    <MuiLink
                      component="button"
                      onClick={() => {
                        handleShelterSelect(null as any);
                        handleShelteredSelect(null as any);
                      }}
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Abrigos
                    </MuiLink>
                    {selectedShelter && (
                      <MuiLink
                        component="button"
                        onClick={() => handleShelteredSelect(null as any)}
                        sx={{
                          color: selectedSheltered ? "primary.main" : "text.primary",
                          fontWeight: selectedSheltered ? 600 : 400,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {selectedShelter.name}
                      </MuiLink>
                    )}
                    {selectedSheltered && (
                      <Typography color="text.primary" fontWeight={600}>
                        {selectedSheltered.name}
                      </Typography>
                    )}
                  </Breadcrumbs>
                </CardContent>
              </Paper>
            </motion.div>

            {renderDesktopContent()}
          </Box>
        )}
      </Box>
      </Container>
    </Box>
  );
}