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
      <Box sx={{ p: 2, borderBottom: "1px solid rgba(0, 153, 51, 0.1)" }}>
        <Typography variant="h6" fontWeight="bold" color="#000000" sx={{ mb: 1 }}>
          Pagelas
        </Typography>
        {shelteredName && (
          <Typography variant="body2" color="#333333" sx={{ mb: 1 }}>
            Abrigado: {shelteredName}
          </Typography>
        )}
        {shelterName && (
          <Typography variant="body2" color="#333333">
            Abrigo: {shelterName}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
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
        <Stack spacing={1}>
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
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: pagela.present ? "#009933" : "#FF0000",
                        width: 40,
                        height: 40,
                      }}
                    >
                      {pagela.present ? (
                        <CheckCircleIcon sx={{ color: "white" }} />
                      ) : (
                        <CancelIcon sx={{ color: "white" }} />
                      )}
                      </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="#000000"
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
                          }}
                      />
                    </Stack>

                      <Typography
                        variant="body2"
                        color="#333333"
                        sx={{ mb: 0.5 }}
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
                <Box sx={{ p: 2, borderTop: "1px solid rgba(0, 153, 51, 0.1)" }}>
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