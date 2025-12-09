import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  FormControlLabel,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import ChipsListWithExpand from "./ChipsListWithExpand";
import { apiManageLeaderTeam } from "@/features/leaders/api";
import { apiManageTeacherTeam } from "@/features/teachers/api";
import { apiListLeadersSimple } from "@/features/leaders/api";
import { apiListTeachersSimple } from "@/features/teachers/api";
import { apiFetchShelter } from "../api";
import { ShelterResponseDto } from "../types";
import { LeaderSimpleListDto } from "@/features/leaders/types";
import { TeacherSimpleListDto } from "@/features/teachers/types";
import { removeLeaderFromTeam, removeTeacherFromTeam } from "@/features/teams/utils";

type Props = {
  shelterId: string | null; // null durante criação
  teamsQuantity: number;
  onTeamsChange?: (teams: any[]) => void;
};

export default function TeamManagementSection({
  shelterId,
  teamsQuantity,
  onTeamsChange,
}: Props) {
  const [shelter, setShelter] = useState<ShelterResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leaderOptions, setLeaderOptions] = useState<LeaderSimpleListDto[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<TeacherSimpleListDto[]>([]);
  
  // Estados para diálogos
  const [showAddLeaderDialog, setShowAddLeaderDialog] = useState(false);
  const [showAddTeacherDialog, setShowAddTeacherDialog] = useState(false);
  const [selectedTeamNumber, setSelectedTeamNumber] = useState<number | null>(null);
  const [selectedLeaderIds, setSelectedLeaderIds] = useState<string[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [leaderSearchTerm, setLeaderSearchTerm] = useState("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");

  const loadShelter = useCallback(async () => {
    if (!shelterId) return;
    setLoading(true);
    try {
      const data = await apiFetchShelter(shelterId);
      setShelter(data);
      if (onTeamsChange) {
        onTeamsChange(data.teams || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao carregar abrigo");
    } finally {
      setLoading(false);
    }
  }, [shelterId, onTeamsChange]);

  const loadOptions = useCallback(async () => {
    try {
      const [leaders, teachers] = await Promise.all([
        apiListLeadersSimple(),
        apiListTeachersSimple(),
      ]);
      setLeaderOptions(leaders || []);
      setTeacherOptions(teachers || []);
    } catch (err: any) {
      console.error("Erro ao carregar opções:", err);
    }
  }, []);

  // Carregar abrigo e opções
  useEffect(() => {
    if (shelterId) {
      loadShelter();
    }
    loadOptions();
  }, [shelterId, loadShelter, loadOptions]);

  // Gerar array de equipes baseado no teamsQuantity
  const teams = React.useMemo(() => {
    // Sempre começar com as equipes existentes do shelter (se houver)
    const existingTeams = shelter?.teams || [];
    const teamsMap = new Map(existingTeams.map(t => [t.numberTeam, t]));
    
    // Garantir que temos todas as equipes até teamsQuantity
    // Preservar equipes existentes e criar novas apenas se necessário
    const allTeams = [];
    for (let i = 1; i <= teamsQuantity; i++) {
      if (teamsMap.has(i)) {
        // Usar equipe existente (preserva líderes e professores)
        allTeams.push(teamsMap.get(i)!);
      } else {
        // Criar nova equipe vazia apenas se não existir
        allTeams.push({
          numberTeam: i,
          leaders: [],
          teachers: [],
        });
      }
    }
    
    return allTeams;
  }, [shelter, teamsQuantity]);

  const handleAddLeader = (teamNumber: number) => {
    if (!shelterId) {
      setError("Salve o abrigo primeiro antes de adicionar líderes");
      return;
    }
    setSelectedTeamNumber(teamNumber);
    setSelectedLeaderIds([]);
    setShowAddLeaderDialog(true);
  };

  const handleConfirmAddLeader = async () => {
    if (!shelterId || !selectedTeamNumber || !selectedLeaderIds || selectedLeaderIds.length === 0) {
      setError("Selecione pelo menos um líder");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Adicionar todos os líderes selecionados sequencialmente para evitar conflitos
      for (const leaderId of selectedLeaderIds) {
        await apiManageLeaderTeam(leaderId, {
          shelterId,
          numberTeam: selectedTeamNumber,
        });
      }
      setShowAddLeaderDialog(false);
      setSelectedTeamNumber(null);
      setSelectedLeaderIds([]);
      setLeaderSearchTerm("");
      
      // Aguardar um pouco antes de recarregar para garantir que o backend processou
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Recarregar abrigo primeiro para garantir dados atualizados
      await loadShelter();
      // Depois recarregar opções
      await loadOptions();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao adicionar líder(es)");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLeader = async (teamNumber: number, leaderId: string) => {
    if (!shelterId) {
      setError("Salve o abrigo primeiro");
      return;
    }
    
    // Buscar a equipe diretamente do shelter para garantir que temos o ID correto
    const team = shelter?.teams?.find((t) => t.numberTeam === teamNumber);
    if (!team || !team.id) {
      setError("Equipe não encontrada. Por favor, recarregue a página.");
      console.error("Equipe não encontrada:", { teamNumber, teams: shelter?.teams, team });
      return;
    }

    setLoading(true);
    setError("");
    try {
      await removeLeaderFromTeam(team.id, leaderId);
      
      // Aguardar um pouco antes de recarregar para garantir que o backend processou
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Recarregar abrigo e opções
      await loadShelter();
      await loadOptions();
    } catch (err: any) {
      console.error("Erro ao remover líder:", err);
      setError(err?.response?.data?.message || err?.message || "Erro ao remover líder");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = (teamNumber: number) => {
    if (!shelterId) {
      setError("Salve o abrigo primeiro antes de adicionar professores");
      return;
    }
    setSelectedTeamNumber(teamNumber);
    setSelectedTeacherIds([]);
    setShowAddTeacherDialog(true);
  };

  const handleConfirmAddTeacher = async () => {
    if (!shelterId || !selectedTeamNumber || !selectedTeacherIds || selectedTeacherIds.length === 0) {
      setError("Selecione pelo menos um professor");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Adicionar todos os professores selecionados sequencialmente para evitar conflitos
      for (const teacherId of selectedTeacherIds) {
        await apiManageTeacherTeam(teacherId, {
          shelterId,
          numberTeam: selectedTeamNumber,
        });
      }
      setShowAddTeacherDialog(false);
      setSelectedTeamNumber(null);
      setSelectedTeacherIds([]);
      setTeacherSearchTerm("");
      
      // Aguardar um pouco antes de recarregar para garantir que o backend processou
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Recarregar abrigo primeiro para garantir dados atualizados (incluindo líderes)
      await loadShelter();
      // Depois recarregar opções
      await loadOptions();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao adicionar professor(es)");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeacher = async (teamNumber: number, teacherId: string) => {
    if (!shelterId) {
      setError("Salve o abrigo primeiro");
      return;
    }
    
    // Buscar a equipe diretamente do shelter para garantir que temos o ID correto
    const team = shelter?.teams?.find((t) => t.numberTeam === teamNumber);
    if (!team || !team.id) {
      setError("Equipe não encontrada. Por favor, recarregue a página.");
      console.error("Equipe não encontrada:", { teamNumber, teams: shelter?.teams, team });
      return;
    }

    setLoading(true);
    setError("");
    try {
      await removeTeacherFromTeam(team.id, teacherId);
      
      // Aguardar um pouco antes de recarregar para garantir que o backend processou
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Recarregar abrigo e opções
      await loadShelter();
      await loadOptions();
    } catch (err: any) {
      console.error("Erro ao remover professor:", err);
      setError(err?.response?.data?.message || err?.message || "Erro ao remover professor");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar líderes disponíveis (podem estar em múltiplas equipes)
  const getAvailableLeaders = (teamNumber: number) => {
    const team = teams.find((t) => t.numberTeam === teamNumber);
    const teamLeaderIds = team?.leaders?.map((l) => l.id) || [];
    
    return leaderOptions.filter((l) => {
      // Líderes podem estar em múltiplas equipes, então incluímos todos
      // Mas priorizamos mostrar os que já estão nesta equipe primeiro
      return true;
    });
  };

  // Filtrar professores disponíveis (apenas 1 equipe por vez - BLOQUEAR se já está em outra)
  const getAvailableTeachers = (teamNumber: number) => {
    const team = teams.find((t) => t.numberTeam === teamNumber);
    const teamTeacherIds = team?.teachers?.map((t) => t.id) || [];
    
    // Coletar IDs de professores que já estão em outras equipes deste abrigo
    // teacher.id (do team.teachers) corresponde a teacherProfileId (do teacherOptions)
    const teachersInOtherTeams = new Set<string>();
    teams.forEach((t) => {
      if (t.numberTeam !== teamNumber && t.teachers) {
        t.teachers.forEach((teacher) => {
          // teacher.id é o ID do perfil do professor (teacherProfileId)
          teachersInOtherTeams.add(teacher.id);
        });
      }
    });
    
    return teacherOptions.filter((t) => {
      // BLOQUEAR se o professor já está em outra equipe deste abrigo
      if (teachersInOtherTeams.has(t.teacherProfileId)) {
        return false; // Professor já está em outra equipe - BLOQUEAR
      }
      
      // Incluir se:
      // 1. Não está vinculado a nenhuma equipe (disponível), OU
      // 2. Já está nesta equipe específica (pode ser movido/removido)
      return !t.vinculado || teamTeacherIds.includes(t.teacherProfileId);
    });
  };

  if (teamsQuantity < 1) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <GroupIcon color="primary" />
        <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
          Gerenciamento de Equipes ({teamsQuantity})
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {!shelterId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Salve o abrigo primeiro para poder gerenciar as equipes.
        </Alert>
      )}

      <Grid container spacing={2}>
        {Array.from({ length: teamsQuantity }, (_, i) => {
          const teamNumber = i + 1;
          const team = teams.find((t) => t.numberTeam === teamNumber);
          const teamLeaders = team?.leaders || [];
          const teamTeachers = team?.teachers || [];

          return (
            <Grid item xs={12} sm={6} key={teamNumber}>
              <Paper
                elevation={2}
                sx={{
                  p: 2.5,
                  height: "100%",
                  border: "2px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    elevation: 4,
                    borderColor: "primary.main",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    transform: "translateY(-2px)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: (t) => {
                      const opacity = teamNumber === 1 ? "FF" : teamNumber === 2 ? "CC" : teamNumber === 3 ? "99" : "66";
                      return `linear-gradient(90deg, ${t.palette.primary.main}${opacity}, ${t.palette.secondary.main}${opacity})`;
                    },
                  },
                }}
              >
                <Box 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 1.5, 
                    mb: 2,
                    pb: 1.5,
                    borderBottom: "2px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      flexShrink: 0,
                    }}
                  >
                    {teamNumber}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: "1.1rem" }}>
                    Equipe {teamNumber}
                  </Typography>
                </Box>

                {/* Líderes */}
                <Box 
                  sx={{ 
                    mb: 2.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "rgba(255, 255, 0, 0.08)",
                    border: "1px solid",
                    borderColor: "primary.light",
                  }}
                >
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    mb: 1.5,
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, sm: 0 },
                    alignItems: { xs: "flex-start", sm: "center" }
                  }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={700} 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 0.75,
                        color: "primary.dark",
                        fontSize: "0.95rem",
                      }}
                    >
                      <PersonIcon fontSize="small" color="primary" />
                      Líderes ({teamLeaders.length})
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddLeader(teamNumber)}
                      disabled={!shelterId || loading}
                      variant="outlined"
                      fullWidth={false}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      Adicionar
                    </Button>
                  </Box>
                  <ChipsListWithExpand
                    items={teamLeaders.map((leader) => ({
                      id: leader.id,
                      label: leader.user?.name || leader.user?.email || "Sem nome",
                      color: "primary" as const,
                      variant: "outlined" as const,
                      onDelete: () => handleRemoveLeader(teamNumber, leader.id),
                    }))}
                    maxVisible={5}
                    emptyMessage="Nenhum líder"
                  />
                </Box>

                {/* Professores */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    mb: 1.5,
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, sm: 0 },
                    alignItems: { xs: "flex-start", sm: "center" }
                  }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={700} 
                      sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 0.75,
                        color: "text.primary",
                        fontSize: "0.95rem",
                      }}
                    >
                      <SchoolIcon fontSize="small" color="secondary" />
                      Professores ({teamTeachers.length})
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddTeacher(teamNumber)}
                      disabled={!shelterId || loading}
                      variant="outlined"
                      fullWidth={false}
                      sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                      Adicionar
                    </Button>
                  </Box>
                  <ChipsListWithExpand
                    items={teamTeachers.map((teacher) => ({
                      id: teacher.id,
                      label: teacher.user?.name || teacher.user?.email || "Sem nome",
                      color: "secondary" as const,
                      variant: "outlined" as const,
                      onDelete: () => handleRemoveTeacher(teamNumber, teacher.id),
                    }))}
                    maxVisible={5}
                    emptyMessage="Nenhum professor"
                  />
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Dialog para adicionar líder */}
      <Dialog 
        open={showAddLeaderDialog} 
        onClose={() => {
          setShowAddLeaderDialog(false);
          setSelectedLeaderIds([]);
          setLeaderSearchTerm("");
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: "calc(100% - 16px)", sm: "auto" },
            maxHeight: { xs: "90vh", sm: "80vh" }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
          Adicionar Líderes à Equipe {selectedTeamNumber}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <TextField
              fullWidth
              placeholder="Buscar líderes..."
              value={leaderSearchTerm}
              onChange={(e) => setLeaderSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              {selectedLeaderIds.length} líder(es) selecionado(s)
            </Typography>
          </Box>
          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            <List dense>
              {selectedTeamNumber && getAvailableLeaders(selectedTeamNumber)
                .filter((leader) =>
                  leader.name.toLowerCase().includes(leaderSearchTerm.toLowerCase())
                )
                .map((leader) => {
                  const isSelected = selectedLeaderIds.includes(leader.leaderProfileId);
                  return (
                    <ListItem key={leader.leaderProfileId} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          if (isSelected) {
                            setSelectedLeaderIds(selectedLeaderIds.filter((id) => id !== leader.leaderProfileId));
                          } else {
                            setSelectedLeaderIds([...selectedLeaderIds, leader.leaderProfileId]);
                          }
                        }}
                        dense
                      >
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                        />
                        <ListItemText primary={leader.name} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              {selectedTeamNumber && getAvailableLeaders(selectedTeamNumber).filter((leader) =>
                leader.name.toLowerCase().includes(leaderSearchTerm.toLowerCase())
              ).length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary="Nenhum líder encontrado" 
                    primaryTypographyProps={{ color: "text.secondary", align: "center" }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button 
            onClick={() => {
              setShowAddLeaderDialog(false);
              setSelectedLeaderIds([]);
              setLeaderSearchTerm("");
            }} 
            sx={{ minWidth: { xs: "auto", sm: 100 } }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAddLeader}
            variant="contained"
            disabled={selectedLeaderIds.length === 0 || loading}
            sx={{ minWidth: { xs: "auto", sm: 100 } }}
          >
            {loading ? <CircularProgress size={20} /> : `Adicionar ${selectedLeaderIds.length > 0 ? `(${selectedLeaderIds.length})` : ""}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para adicionar professor */}
      <Dialog 
        open={showAddTeacherDialog} 
        onClose={() => {
          setShowAddTeacherDialog(false);
          setSelectedTeacherIds([]);
          setTeacherSearchTerm("");
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: "calc(100% - 16px)", sm: "auto" },
            maxHeight: { xs: "90vh", sm: "80vh" }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
          Adicionar Professores à Equipe {selectedTeamNumber}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <TextField
              fullWidth
              placeholder="Buscar professores..."
              value={teacherSearchTerm}
              onChange={(e) => setTeacherSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
              {selectedTeacherIds.length} professor(es) selecionado(s)
            </Typography>
            {selectedTeamNumber && getAvailableTeachers(selectedTeamNumber).length === 0 && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Todos os professores disponíveis já estão em outras equipes
              </Alert>
            )}
          </Box>
          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            <List dense>
              {selectedTeamNumber && getAvailableTeachers(selectedTeamNumber)
                .filter((teacher) =>
                  teacher.name.toLowerCase().includes(teacherSearchTerm.toLowerCase())
                )
                .map((teacher) => {
                  const isSelected = selectedTeacherIds.includes(teacher.teacherProfileId);
                  return (
                    <ListItem key={teacher.teacherProfileId} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTeacherIds(selectedTeacherIds.filter((id) => id !== teacher.teacherProfileId));
                          } else {
                            setSelectedTeacherIds([...selectedTeacherIds, teacher.teacherProfileId]);
                          }
                        }}
                        dense
                      >
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                        />
                        <ListItemText primary={teacher.name} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              {selectedTeamNumber && getAvailableTeachers(selectedTeamNumber).filter((teacher) =>
                teacher.name.toLowerCase().includes(teacherSearchTerm.toLowerCase())
              ).length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary={
                      getAvailableTeachers(selectedTeamNumber).length === 0
                        ? "Nenhum professor disponível (todos já estão em outras equipes)"
                        : "Nenhum professor encontrado"
                    }
                    primaryTypographyProps={{ color: "text.secondary", align: "center" }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button 
            onClick={() => {
              setShowAddTeacherDialog(false);
              setSelectedTeacherIds([]);
              setTeacherSearchTerm("");
            }} 
            sx={{ minWidth: { xs: "auto", sm: 100 } }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAddTeacher}
            variant="contained"
            disabled={selectedTeacherIds.length === 0 || loading}
            sx={{ minWidth: { xs: "auto", sm: 100 } }}
          >
            {loading ? <CircularProgress size={20} /> : `Adicionar ${selectedTeacherIds.length > 0 ? `(${selectedTeacherIds.length})` : ""}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

