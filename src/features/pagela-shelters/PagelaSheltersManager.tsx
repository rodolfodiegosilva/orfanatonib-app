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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
      }}
    >
      <BackHeader
        title="Gerenciar Pagelas"
      />

      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
        {isMobile ? (
          <Box>
            {/* Mobile Header */}
            <Card
              sx={{
                mb: 2,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(0, 153, 51, 0.2)",
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton onClick={handleMobileBack} size="small">
                <ArrowBackIcon />
              </IconButton>
                  <Typography variant="h6" fontWeight="bold" color="#000000">
                    {mobileStep === "shelters" && "Abrigos"}
                    {mobileStep === "sheltered" && selectedShelter ? `${selectedShelter.name} - Abrigados` : "Abrigados"}
                    {mobileStep === "pagelas" && selectedSheltered ? `${selectedSheltered.name} - Pagelas` : "Pagelas"}
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