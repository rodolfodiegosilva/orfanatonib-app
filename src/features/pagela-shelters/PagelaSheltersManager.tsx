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

import type { ShelterResponseDto } from "@/features/shelters/types";
import type { ShelteredResponseDto } from "@/features/shelteredren/types";
import BackHeader from "@/components/common/header/BackHeader";

type MobileStep = "shelters" | "shelteredren" | "pagelas";

export default function PagelaSheltersManager() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [selectedShelter, setSelectedShelter] = useState<ShelterResponseDto | null>(null);
  const [selectedSheltered, setSelectedSheltered] = useState<ShelteredResponseDto | null>(null);
  const [mobileStep, setMobileStep] = useState<MobileStep>("shelters");

  useEffect(() => {
    if (!isMobile) return;
    if (!selectedShelter) setMobileStep("shelters");
    else if (!selectedSheltered) setMobileStep("shelteredren");
    else setMobileStep("pagelas");
  }, [isMobile, selectedShelter, selectedSheltered]);

  const handleBack = () => {
    if (!isMobile) return;
    if (mobileStep === "pagelas") {
      setSelectedSheltered(null);
      setMobileStep("shelteredren");
    } else if (mobileStep === "shelteredren") {
      setSelectedShelter(null);
      setMobileStep("shelters");
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          {isMobile && mobileStep !== "shelters" ? (
            <>
              <IconButton aria-label="voltar" onClick={handleBack} edge="start">
                <ArrowBackIcon />
              </IconButton>

              <Typography
                component="h1"
                sx={{
                  flexGrow: 1,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
                  letterSpacing: { xs: 0.2, md: 0.3 },
                }}
              >
                Abrigos ▸ Crianças ▸ Pagelas
              </Typography>
            </>
          ) : (
            <>
              {isMobile && (
                <BackHeader title="Abrigos▸Crianças▸Pagelas" mobileFontSize="1rem" />
              )}
            </>
          )}

          {!isMobile && (
            <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />} aria-label="breadcrumb" maxItems={3}>
              <MuiLink
                component="button"
                onClick={() => {
                  setSelectedShelter(null);
                  setSelectedSheltered(null);
                }}
              >
                Abrigos
              </MuiLink>
              {selectedShelter && (
                <MuiLink component="button" onClick={() => setSelectedSheltered(null)}>
                  Abrigo #{selectedShelter.number}
                </MuiLink>
              )}
              {selectedSheltered && <Typography color="text.primary">{selectedSheltered.name}</Typography>}
            </Breadcrumbs>
          )}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          p: 2,
        }}
      >
        {!isMobile && (
          <Grid
            container
            spacing={2}
            sx={{
              height: "100%",
              minHeight: 0,
            }}
          >
            <Grid item xs={12} md={4} sx={{ height: "100%", minHeight: 0 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: 2,
                    minHeight: 0,
                  }}
                >
                  <SectionHeader context="shelters" title="Abrigos" subtitle="Selecione um abrigo para ver as crianças" />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <SheltersPanel
                      onSelect={(shelter) => {
                        setSelectedShelter(shelter);
                        setSelectedSheltered(null);
                      }}
                      selectedId={selectedShelter?.id || null}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4} sx={{ height: "100%", minHeight: 0 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: 2,
                    minHeight: 0,
                  }}
                >
                  <SectionHeader
                    context="shelteredren"
                    title="Crianças"
                    subtitle={selectedShelter ? `Abrigo #${selectedShelter.number}` : "Escolha um Abrigo"}
                  />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ShelteredPanel
                      shelter={selectedShelter}
                      onSelect={(sheltered) => setSelectedSheltered(sheltered)}
                      selectedId={selectedSheltered?.id || null}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4} sx={{ height: "100%", minHeight: 0 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    p: 2,
                    minHeight: 0,
                  }}
                >
                  <SectionHeader
                    context="pagelas"
                    title="Pagelas"
                    subtitle={selectedSheltered ? selectedSheltered.name : "Escolha uma criança"}
                  />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <PagelasPanel sheltered={selectedSheltered} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {isMobile && (
          <Stack spacing={2} sx={{ height: "100%", minHeight: 0 }}>
            {mobileStep === "shelters" && (
              <Card sx={{ flex: 1, overflow: "hidden", minHeight: 0, display: "flex" }}>
                <CardContent sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
                  <SectionHeader context="shelters" title="Abrigos" subtitle="Toque em um abrigo para avançar" />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <SheltersPanel
                      onSelect={(shelter) => {
                        setSelectedShelter(shelter);
                        setSelectedSheltered(null);
                        setMobileStep("shelteredren");
                      }}
                      selectedId={selectedShelter?.id || null}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            {mobileStep === "shelteredren" && (
              <Card sx={{ flex: 1, overflow: "hidden", minHeight: 0, display: "flex" }}>
                <CardContent sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
                  <SectionHeader
                    context="shelteredren"
                    title="Crianças"
                    subtitle={selectedShelter ? `Abrigo #${selectedShelter.number}` : undefined}
                  />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ShelteredPanel
                      shelter={selectedShelter}
                      onSelect={(sheltered) => {
                        setSelectedSheltered(sheltered);
                        setMobileStep("pagelas");
                      }}
                      selectedId={selectedSheltered?.id || null}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}

            {mobileStep === "pagelas" && (
              <Card sx={{ flex: 1, overflow: "hidden", minHeight: 0, display: "flex" }}>
                <CardContent sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
                  <SectionHeader context="pagelas" title="Pagelas" subtitle={selectedSheltered ? selectedSheltered.name : undefined} />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <PagelasPanel sheltered={selectedSheltered} />
                  </Box>
                </CardContent>
              </Card>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
