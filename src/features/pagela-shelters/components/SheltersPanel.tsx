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

import type { ShelterDto } from "../types";
import { EmptyState } from "./common/EmptyState";
import { useDebounced } from "../utils";

interface SheltersPanelProps {
    shelters: ShelterDto[];
    loading: boolean;
    error: string | null;
    onShelterSelect: (shelter: ShelterDto) => void;
    selectedShelter: ShelterDto | null;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSearchChange?: (searchString: string) => void;
}

export function SheltersPanel({
    shelters,
    loading,
    error,
    onShelterSelect,
    selectedShelter,
    currentPage,
    totalPages,
    onPageChange,
    onSearchChange,
}: SheltersPanelProps) {
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
                        mb: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        display: { xs: 'none', sm: 'block' } // Esconde no mobile
                    }}
                >
                    Abrigos
                </Typography>
                
                <TextField
                    fullWidth
                size="small"
                    placeholder="Buscar abrigos..."
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
                            <Skeleton key={index} variant="rectangular" height={80} />
                        ))}
                    </Stack>
                ) : shelters.length === 0 ? (
                    <EmptyState
                        icon={<SearchIcon />}
                        title="Nenhum abrigo encontrado"
                        description={search ? "Tente ajustar os filtros de busca" : "Não há abrigos cadastrados"}
                    />
                ) : (
                    <Stack spacing={{ xs: 1, sm: 1.5 }}>
                        {shelters.map((shelter) => (
                                <Card
                                key={shelter.id}
                                    sx={{
                                    border: selectedShelter?.id === shelter.id 
                                        ? "2px solid #009933" 
                                        : "1px solid rgba(0, 153, 51, 0.2)",
                                    backgroundColor: selectedShelter?.id === shelter.id 
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
                                <CardActionArea onClick={() => onShelterSelect(shelter)}>
                                    <Box sx={{ p: { xs: 2, sm: 2 }, minHeight: { xs: 120, sm: 110 } }}>
                                        <Stack spacing={1}>
                                            {/* Primeira linha: Iniciais (esquerda) + Quantidade de professores (direita) */}
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
                                                        {shelter.name.charAt(0).toUpperCase()}
                                                    </Typography>
                                                </Avatar>
                                                
                                                <Typography
                                                    variant="caption"
                                                    color="#009933"
                                                    fontWeight="500"
                                                    sx={{
                                                        fontSize: { xs: '0.625rem', sm: '0.75rem' },
                                                        textAlign: 'right'
                                                    }}
                                                >
                                                    {shelter.teachers.length} professores
                                                </Typography>
                                            </Stack>

                                            {/* Segunda linha: Nome do abrigo */}
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
                                                {shelter.name}
                                            </Typography>

                                            {/* Terceira linha: Cidade, Estado */}
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
                                                {shelter.address.city}, {shelter.address.state}
                                            </Typography>

                                            {/* Quarta linha: Bairro */}
                                            <Typography
                                                variant="caption"
                                                color="#666666"
                                                sx={{
                                                    fontSize: { xs: '0.625rem', sm: '0.75rem' },
                                                    lineHeight: 1.3,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {shelter.address.district}
                                            </Typography>

                                            {/* Quinta linha: Líderes */}
                                            {shelter.leaders && shelter.leaders.length > 0 && (
                                                <Typography
                                                    variant="caption"
                                                    color="#666666"
                                                    sx={{
                                                        fontSize: { xs: '0.625rem', sm: '0.75rem' },
                                                        lineHeight: 1.3,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    Líderes: {shelter.leaders.map(leader => leader.user.name).join(', ')}
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