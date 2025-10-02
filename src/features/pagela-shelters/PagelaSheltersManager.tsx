import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

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
          />
        );
      default:
        return null;
    }
  };

  const renderDesktopContent = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
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
      </Grid>
      <Grid item xs={12} md={4}>
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
      </Grid>
      <Grid item xs={12} md={4}>
        <PagelasPanel
          pagelas={pagelas.data?.items || []}
          loading={pagelas.loading}
          error={pagelas.error}
          shelteredName={selectedSheltered?.name || ""}
          shelterName={selectedShelter?.name || ""}
          currentPage={pagelas.currentPage}
          totalPages={pagelas.totalPages}
          onPageChange={pagelas.handlePageChange}
        />
      </Grid>
    </Grid>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 4,
        backgroundColor: "#f5f5f5", // Background consistente
      }}
    >
      <BackHeader
        title="Gerenciar Pagelas"
      />

      <Box sx={{ 
        px: { xs: 1, sm: 2, md: 3 }, 
        pt: { xs: 0, sm: 2 }, // Remove padding top no mobile
        backgroundColor: "#f5f5f5" // Background consistente
      }}>
        {isMobile ? (
          <Box>
            {/* Mobile Header */}
            <Card
              sx={{
                mb: { xs: 1, sm: 2 },
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(0, 153, 51, 0.2)",
              }}
            >
              <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  
                  {/* Só mostra a arrow back quando não está na primeira tela */}
                  {mobileStep !== "shelters" && (
                    <IconButton onClick={handleMobileBack} size="small">
                      <ArrowBackIcon />
                    </IconButton>
                  )}
                  
                  {/* Espaçamento quando não há arrow back */}
                  {mobileStep === "shelters" && <Box sx={{ width: 40 }} />}
                  
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    color="#000000"
                    sx={{ 
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}
                  >
                    {mobileStep === "shelters" && "Abrigos"}
                    {mobileStep === "sheltered" && "Abrigados"}
                    {mobileStep === "pagelas" && "Pagelas"}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {renderMobileContent()}
          </Box>
        ) : (
          <Box>
            {/* Desktop Breadcrumbs */}
            <Card
                sx={{
                mb: 3,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(0, 153, 51, 0.2)",
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
                      color: "#009933",
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
                          color: selectedSheltered ? "#009933" : "#000000",
                          fontWeight: selectedSheltered ? 600 : 400,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {selectedShelter.name}
                      </MuiLink>
                  )}
              {selectedSheltered && (
                        <Typography color="#000000" fontWeight={600}>
                          {selectedSheltered.name}
                        </Typography>
                      )}
                </Breadcrumbs>
                </CardContent>
              </Card>

            {renderDesktopContent()}
                  </Box>
        )}
      </Box>
    </Box>
  );
}