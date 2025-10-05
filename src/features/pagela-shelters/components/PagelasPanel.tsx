import React, { useMemo } from "react";
import {
  Box, 
  Stack, 
  Typography, 
  Chip, 
  Skeleton, 
  Alert, 
  Card, 
  CardContent, 
  Avatar,
  Divider,
  Pagination,
} from "@mui/material";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { PagelaDto } from "../types";
import { EmptyState } from "./common/EmptyState";
import { fmtDate } from "../utils";

interface PagelasPanelProps {
  pagelas: PagelaDto[];
  loading: boolean;
  error: string | null;
  shelteredName: string;
  shelterName: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PagelasPanel({
  pagelas,
  loading,
  error,
  shelteredName,
  shelterName,
  currentPage,
  totalPages,
  onPageChange,
}: PagelasPanelProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const sortedPagelas = useMemo(() => {
    return [...pagelas].sort((a, b) => {
      // Ordenar por ano DESC, depois por visita DESC
      if (a.year !== b.year) return b.year - a.year;
      return b.visit - a.visit;
    });
  }, [pagelas]);

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 153, 51, 0.2)",
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: "1px solid rgba(0, 153, 51, 0.1)" }}>
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          color="#000000" 
          sx={{ 
            mb: { xs: 1, sm: 1.5 },
            fontSize: { xs: '1rem', sm: '1.25rem' },
            display: { xs: 'none', sm: 'block' } // Esconde no mobile
          }}
        >
          Pagelas
        </Typography>
        {shelteredName && (
          <Typography 
            variant="body2" 
            color="#333333" 
            sx={{ 
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Abrigado: {shelteredName}
          </Typography>
        )}
        {shelterName && (
          <Typography 
            variant="body2" 
            color="#333333"
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Abrigo: {shelterName}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: { xs: 1.5, sm: 2 } }}>
        {loading ? (
          <Stack spacing={2}>
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={80} />
            ))}
          </Stack>
        ) : sortedPagelas.length === 0 ? (
          <EmptyState
            icon={<BookmarksIcon />}
            title="Nenhuma pagela encontrada"
            description="Não há registros de pagelas para este abrigado"
          />
        ) : (
        <Stack spacing={{ xs: 1, sm: 1.5 }}>
            {sortedPagelas.map((pagela) => (
            <Card
                key={pagela.id}
              sx={{
                  border: "1px solid rgba(0, 153, 51, 0.2)",
                  backgroundColor: pagela.present 
                    ? "rgba(0, 153, 51, 0.05)" 
                    : "rgba(255, 0, 0, 0.05)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: pagela.present 
                      ? "rgba(0, 153, 51, 0.1)" 
                      : "rgba(255, 0, 0, 0.1)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: pagela.present ? "#009933" : "#FF0000",
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                      }}
                    >
                      {pagela.present ? (
                        <CheckCircleIcon sx={{ color: "white", fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      ) : (
                        <CancelIcon sx={{ color: "white", fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                      )}
                      </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="#000000"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          Ano {pagela.year} - Visita {pagela.visit}
                      </Typography>
                      <Chip
                          label={pagela.present ? "Presente" : "Ausente"}
                        size="small"
                          sx={{
                            backgroundColor: pagela.present 
                              ? "rgba(0, 153, 51, 0.1)" 
                              : "rgba(255, 0, 0, 0.1)",
                            color: pagela.present ? "#009933" : "#FF0000",
                            fontWeight: 500,
                            fontSize: { xs: '0.625rem', sm: '0.75rem' },
                            height: { xs: 18, sm: 20 }
                          }}
                      />
                    </Stack>

                      <Typography
                        variant="body2"
                        color="#333333"
                        sx={{ 
                          mb: 0.5,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        Data: {fmtDate(pagela.referenceDate)}
                        </Typography>
                      
                      {pagela.notes && (
                        <Typography
                          variant="caption"
                          color="#666666"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            fontSize: { xs: '0.625rem', sm: '0.75rem' }
                          }}
                        >
                          {pagela.notes}
                        </Typography>
                      )}
                      </Box>
                  </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
                )}
      </Box>

            {/* Paginação no rodapé */}
            {totalPages > 1 && (
                <Box sx={{ p: { xs: 1.5, sm: 2 }, borderTop: "1px solid rgba(0, 153, 51, 0.1)" }}>
        <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={(_, page) => onPageChange(page)}
                        color="primary"
          size="small"
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            "& .MuiPaginationItem-root": {
                                color: "#009933",
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                minWidth: { xs: 28, sm: 32 },
                                height: { xs: 28, sm: 32 },
                                "&.Mui-selected": {
                                    backgroundColor: "#009933",
                                    color: "white",
                                },
                            },
                        }}
                    />
                </Box>
            )}
        </Card>
  );
}