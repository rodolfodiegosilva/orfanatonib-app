import React, { useState, useEffect, useCallback } from "react";
import {
  Box, 
  Stack, 
  TextField, 
  InputAdornment, 
  IconButton, 
  Skeleton, 
  Alert,
  Card, 
  CardActionArea, 
  Avatar, 
  Typography, 
  Chip,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import type { ShelteredDto } from "../types";
import { EmptyState } from "./common/EmptyState";
import { fmtDate, formatPhone, useDebounced } from "../utils";

function initialsFromName(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] || "";
  const last = parts[parts.length - 1][0] || "";
  return (first + last).toUpperCase();
}

interface ShelteredPanelProps {
  sheltered: ShelteredDto[];
  loading: boolean;
  error: string | null;
  onShelteredSelect: (sheltered: ShelteredDto) => void;
  selectedSheltered: ShelteredDto | null;
  shelterName: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearchChange?: (searchString: string) => void;
}

export function ShelteredPanel({
  sheltered,
  loading,
  error,
  onShelteredSelect,
  selectedSheltered,
  shelterName,
  currentPage,
  totalPages,
  onPageChange,
  onSearchChange,
}: ShelteredPanelProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const dq = useDebounced(search);

  // Chama a API quando o debounced search muda
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(dq);
    }
  }, [dq]);

  const handleSearchClear = useCallback(() => {
    setSearch("");
  }, []);

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
          Abrigados
        </Typography>
        {shelterName && (
          <Typography 
            variant="body2" 
            color="#333333" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Abrigo: {shelterName}
          </Typography>
        )}
        
      <TextField
          fullWidth
        size="small"
          placeholder="Buscar abrigados..."
        value={search}
          onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
                <SearchIcon sx={{ color: "#009933" }} />
            </InputAdornment>
          ),
            endAdornment: search && (
            <InputAdornment position="end">
                <IconButton size="small" onClick={handleSearchClear}>
                  <ClearIcon />
                </IconButton>
            </InputAdornment>
          ),
        }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
            },
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: { xs: 1.5, sm: 2 } }}>
        {loading ? (
          <Stack spacing={2}>
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={100} />
            ))}
          </Stack>
        ) : sheltered.length === 0 ? (
          <EmptyState
            icon={<SearchIcon />}
            title="Nenhum abrigado encontrado"
            description={search ? "Tente ajustar os filtros de busca" : "Não há abrigados cadastrados neste abrigo"}
          />
        ) : (
          <Stack spacing={{ xs: 1.5, sm: 1.5 }}>
            {sheltered.map((sheltered) => (
              <Card
                key={sheltered.id}
                sx={{
                  border: selectedSheltered?.id === sheltered.id 
                    ? "2px solid #009933" 
                    : "1px solid rgba(0, 153, 51, 0.2)",
                  backgroundColor: selectedSheltered?.id === sheltered.id 
                    ? "rgba(0, 153, 51, 0.1)" 
                    : "rgba(255, 255, 255, 0.8)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(0, 153, 51, 0.05)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 8px rgba(0, 153, 51, 0.2)",
                  },
                }}
              >
                <CardActionArea onClick={() => onShelteredSelect(sheltered)}>
                  <Box sx={{ p: { xs: 2, sm: 2 }, minHeight: { xs: 100, sm: 90 } }}>
                    <Stack spacing={1}>
                      {/* Primeira linha: Iniciais (esquerda) + Nome do abrigo (direita) */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: "#009933",
                            width: { xs: 32, sm: 36 },
                            height: { xs: 32, sm: 36 },
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            color="white" 
                            fontWeight="bold"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                          {initialsFromName(sheltered.name)}
                        </Typography>
                      </Avatar>
                      
                        <Typography
                          variant="caption"
                          color="#009933"
                          fontWeight="500"
                          sx={{
                            fontSize: { xs: '0.625rem', sm: '0.75rem' },
                            textAlign: 'right',
                            maxWidth: '60%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {sheltered.shelter.name}
                        </Typography>
                      </Stack>

                      {/* Segunda linha: Nome do abrigado */}
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        color="#000000"
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {sheltered.name}
                        </Typography>
                        
                      {/* Terceira linha: Responsável */}
                      {sheltered.guardianName && (
                        <Typography
                          variant="caption"
                          color="#333333"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            lineHeight: 1.3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {sheltered.guardianName}
                        </Typography>
                      )}
                        
                      {/* Quarta linha: Número do responsável */}
                      {sheltered.guardianPhone && (
                          <Typography
                            variant="caption"
                            color="#666666"
                          sx={{
                            fontSize: { xs: '0.625rem', sm: '0.75rem' },
                            lineHeight: 1.3,
                            wordBreak: 'break-all'
                          }}
                        >
                            {formatPhone(sheltered.guardianPhone)}
                          </Typography>
                        )}
                    </Stack>
                  </Box>
                </CardActionArea>
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