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
}: SheltersPanelProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [search, setSearch] = useState("");
    const dq = useDebounced(search);

    const filteredShelters = useMemo(() => {
        if (!dq) return shelters;
        return shelters.filter(shelter =>
            shelter.name.toLowerCase().includes(dq.toLowerCase()) ||
            shelter.address.city.toLowerCase().includes(dq.toLowerCase()) ||
            shelter.address.state.toLowerCase().includes(dq.toLowerCase())
        );
    }, [shelters, dq]);

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
                <Typography variant="h6" fontWeight="bold" color="#000000" sx={{ mb: 2 }}>
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

            <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                {loading ? (
                    <Stack spacing={2}>
                        {[...Array(6)].map((_, index) => (
                            <Skeleton key={index} variant="rectangular" height={80} />
                        ))}
                    </Stack>
                ) : filteredShelters.length === 0 ? (
                    <EmptyState
                        icon={<SearchIcon />}
                        title="Nenhum abrigo encontrado"
                        description={search ? "Tente ajustar os filtros de busca" : "Não há abrigos cadastrados"}
                    />
                ) : (
                    <Stack spacing={1}>
                        {filteredShelters.map((shelter) => (
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
                                                    {shelter.name.charAt(0).toUpperCase()}
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
                                                    {shelter.name}
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
                                                    {shelter.address.city}, {shelter.address.state}
                                                </Typography>
                                                
                                                <Typography
                                                    variant="caption"
                                                    color="#666666"
                                                    sx={{
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {shelter.address.district}
                                                </Typography>
            </Box>

                                            <Box sx={{ textAlign: "right" }}>
                                                <Chip
                                                    label={`${shelter.teachers.length} professores`}
                    size="small"
                                                    sx={{
                                                        backgroundColor: "rgba(0, 153, 51, 0.1)",
                                                        color: "#009933",
                                                        fontWeight: 500,
                                                    }}
                                                />
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