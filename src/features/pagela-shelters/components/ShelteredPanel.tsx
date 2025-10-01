import React, { useMemo, useState } from "react";
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
}: ShelteredPanelProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [search, setSearch] = useState("");
  const dq = useDebounced(search);

  const filteredSheltered = useMemo(() => {
    if (!dq) return sheltered;
    return sheltered.filter(sheltered =>
      sheltered.name.toLowerCase().includes(dq.toLowerCase()) ||
      (sheltered.guardianName && sheltered.guardianName.toLowerCase().includes(dq.toLowerCase())) ||
      (sheltered.guardianPhone && sheltered.guardianPhone.includes(dq))
    );
  }, [sheltered, dq]);

  const handleSearchClear = () => {
    setSearch("");
  };

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
          Abrigados
        </Typography>
        {shelterName && (
          <Typography variant="body2" color="#333333" sx={{ mb: 2 }}>
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

      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {loading ? (
          <Stack spacing={2}>
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={100} />
            ))}
          </Stack>
        ) : filteredSheltered.length === 0 ? (
          <EmptyState
            icon={<SearchIcon />}
            title="Nenhum abrigado encontrado"
            description={search ? "Tente ajustar os filtros de busca" : "Não há abrigados cadastrados neste abrigo"}
          />
        ) : (
          <Stack spacing={1}>
            {filteredSheltered.map((sheltered) => (
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
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: "#009933",
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Typography variant="h6" color="white" fontWeight="bold">
                          {initialsFromName(sheltered.name)}
                        </Typography>
                      </Avatar>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color="#000000"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sheltered.name}
                        </Typography>
                        
                        <Typography
                          variant="body2"
                          color="#333333"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {sheltered.gender} • {fmtDate(sheltered.birthDate)}
                        </Typography>
                        
                        {sheltered.guardianName && (
                          <Typography
                            variant="caption"
                            color="#666666"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Responsável: {sheltered.guardianName}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ textAlign: "right" }}>
                          <Chip
                          label={sheltered.shelter.name}
                            size="small"
                          sx={{
                            backgroundColor: "rgba(0, 153, 51, 0.1)",
                            color: "#009933",
                            fontWeight: 500,
                            mb: 1,
                          }}
                        />
                        {sheltered.guardianPhone && (
                          <Typography variant="caption" color="#666666" display="block">
                            {formatPhone(sheltered.guardianPhone)}
                          </Typography>
                        )}
                      </Box>
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