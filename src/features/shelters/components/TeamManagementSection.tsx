import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import ChipsListWithExpand from "./ChipsListWithExpand";
import { apiListLeadersSimple } from "@/features/leaders/api";
import { apiListTeachersSimple } from "@/features/teachers/api";
import { apiFetchShelter } from "../api";
import { ShelterResponseDto } from "../types";
import { LeaderSimpleListDto } from "@/features/leaders/types";
import { TeacherSimpleListDto } from "@/features/teachers/types";

type Props = {
  shelterId: string | null;
  teamsQuantity: number;
  onTeamsQuantityChange?: (newQuantity: number) => void;
};

export type TeamManagementRef = {
  getCurrentTeams: () => any[];
};

const TeamManagementSection = forwardRef<TeamManagementRef, Props>(
  ({ shelterId, teamsQuantity, onTeamsQuantityChange }, ref) => {
    const [shelter, setShelter] = useState<ShelterResponseDto | null>(null);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [leaderOptions, setLeaderOptions] = useState<LeaderSimpleListDto[]>([]);
    const [teacherOptions, setTeacherOptions] = useState<TeacherSimpleListDto[]>([]);
    
    // Estados para diálogos
    const [showAddLeaderDialog, setShowAddLeaderDialog] = useState(false);
    const [showAddTeacherDialog, setShowAddTeacherDialog] = useState(false);
    const [showDeleteTeamDialog, setShowDeleteTeamDialog] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState<number | null>(null);
    const [selectedTeamNumber, setSelectedTeamNumber] = useState<number | null>(null);
    const [selectedLeaderIds, setSelectedLeaderIds] = useState<string[]>([]);
    const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
    const [leaderSearchTerm, setLeaderSearchTerm] = useState("");
    const [teacherSearchTerm, setTeacherSearchTerm] = useState("");

    // Expor função para obter equipes atuais
    useImperativeHandle(ref, () => ({
      getCurrentTeams: () => {
        console.log("🟣 [getCurrentTeams] Chamado - teams:", JSON.stringify(teams, null, 2));
        console.log("🟣 [getCurrentTeams] teams.length:", teams.length);
        return teams;
      },
    }));

    // Carregar abrigo
    const loadShelter = useCallback(async () => {
      if (!shelterId) {
        console.log("🟣 [loadShelter] shelterId não fornecido");
        return;
      }
      console.log("🟣 [loadShelter] Carregando abrigo:", shelterId);
      setLoading(true);
      try {
        const data = await apiFetchShelter(shelterId);
        console.log("🟣 [loadShelter] Abrigo carregado:", data);
        setShelter(data);
        
        // Gerar array de equipes baseado no teamsQuantity
        const existingTeams = data.teams || [];
        console.log("🟣 [loadShelter] existingTeams:", JSON.stringify(existingTeams, null, 2));
        console.log("🟣 [loadShelter] teamsQuantity:", teamsQuantity);
        
        const teamsMap = new Map(existingTeams.map(t => [t.numberTeam, t]));
        const allTeams = [];
        
        for (let i = 1; i <= teamsQuantity; i++) {
          if (teamsMap.has(i)) {
            allTeams.push(teamsMap.get(i)!);
          } else {
            allTeams.push({
              numberTeam: i,
              leaders: [],
              teachers: [],
            });
          }
        }
        
        console.log("🟣 [loadShelter] allTeams gerado:", JSON.stringify(allTeams, null, 2));
        setTeams(allTeams);
        console.log("🟣 [loadShelter] Estado teams atualizado");
      } catch (err: any) {
        console.error("❌ [loadShelter] Erro:", err);
        setError(err?.response?.data?.message || "Erro ao carregar abrigo");
      } finally {
        setLoading(false);
      }
    }, [shelterId]); // Removido teamsQuantity das dependências para não recarregar quando mudar

    // Carregar opções
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

    // Carregar dados iniciais (apenas quando shelterId mudar, não quando teamsQuantity mudar)
    useEffect(() => {
      if (shelterId) {
        loadShelter();
      } else {
        // Inicializar equipes vazias quando não há shelterId (criação)
        const initialTeams = [];
        for (let i = 1; i <= teamsQuantity; i++) {
          initialTeams.push({
            numberTeam: i,
            leaders: [],
            teachers: [],
          });
        }
        setTeams(initialTeams);
      }
      loadOptions();
    }, [shelterId, loadShelter, loadOptions]);

    // Inicializar equipes quando teamsQuantity mudar (apenas no frontend, sem chamar API)
    useEffect(() => {
      // Se não há shelterId (criação), inicializar equipes vazias
      if (!shelterId) {
        const allTeams = [];
        for (let i = 1; i <= teamsQuantity; i++) {
          allTeams.push({
            numberTeam: i,
            leaders: [],
            teachers: [],
          });
        }
        setTeams(allTeams);
        return;
      }

      // Se há shelterId (edição), só ajustar se já temos equipes carregadas e não está carregando
      // Isso garante que não sobrescrevemos dados do servidor durante o carregamento
      // Usamos uma verificação de ref para evitar loops infinitos
      if (shelterId && !loading) {
        setTeams(prevTeams => {
          // Se não há equipes anteriores, não fazer nada (aguardar loadShelter)
          if (prevTeams.length === 0) {
            return prevTeams;
          }
          
          // Se já temos equipes, ajustar quantidade
          const teamsMap = new Map(prevTeams.map(t => [t.numberTeam, t]));
          const allTeams = [];
          
          for (let i = 1; i <= teamsQuantity; i++) {
            if (teamsMap.has(i)) {
              allTeams.push(teamsMap.get(i)!);
            } else {
              allTeams.push({
                numberTeam: i,
                leaders: [],
                teachers: [],
              });
            }
          }
          
          return allTeams;
        });
      }
    }, [teamsQuantity, shelterId, loading]);

    const handleAddLeader = (teamNumber: number) => {
      setSelectedTeamNumber(teamNumber);
      setSelectedLeaderIds([]);
      setShowAddLeaderDialog(true);
    };

    const handleConfirmAddLeader = () => {
      if (!selectedTeamNumber || selectedLeaderIds.length === 0) {
        setError("Selecione pelo menos um líder");
        return;
      }

      setError("");
      
      // Buscar os dados completos dos líderes selecionados
      const selectedLeaders = leaderOptions.filter(leader => 
        selectedLeaderIds.includes(leader.leaderProfileId)
      );

      // Adicionar líderes ao estado local (sem chamar API)
      setTeams(prevTeams => {
        return prevTeams.map(team => {
          if (team.numberTeam === selectedTeamNumber) {
            const existingLeaderIds = (team.leaders || []).map((l: any) => l.id);
            const newLeaders = selectedLeaders
              .filter(leader => !existingLeaderIds.includes(leader.leaderProfileId))
              .map(leader => ({
                id: leader.leaderProfileId,
                active: true,
                user: {
                  id: leader.leaderProfileId, // Usando leaderProfileId como fallback
                  name: leader.name,
                  email: "",
                  phone: "",
                  active: true,
                  completed: false,
                  commonUser: false,
                },
              }));
            
            return {
              ...team,
              leaders: [...(team.leaders || []), ...newLeaders],
            };
          }
          return team;
        });
      });

      setShowAddLeaderDialog(false);
      setSelectedTeamNumber(null);
      setSelectedLeaderIds([]);
      setLeaderSearchTerm("");
    };

    const handleRemoveLeader = (teamNumber: number, leaderId: string) => {
      console.log("🟠 [handleRemoveLeader] Removendo líder:", { teamNumber, leaderId });
      setTeams(prevTeams => {
        const updated = prevTeams.map(team => 
          team.numberTeam === teamNumber
            ? { ...team, leaders: (team.leaders || []).filter((l: any) => l.id !== leaderId) }
            : team
        );
        console.log("🟠 [handleRemoveLeader] Equipes atualizadas:", JSON.stringify(updated, null, 2));
        return updated;
      });
    };

    const handleAddTeacher = (teamNumber: number) => {
      setSelectedTeamNumber(teamNumber);
      setSelectedTeacherIds([]);
      setShowAddTeacherDialog(true);
    };

    const handleConfirmAddTeacher = () => {
      if (!selectedTeamNumber || selectedTeacherIds.length === 0) {
        setError("Selecione pelo menos um professor");
        return;
      }

      setError("");
      
      // Buscar os dados completos dos professores selecionados
      const selectedTeachers = teacherOptions.filter(teacher => 
        selectedTeacherIds.includes(teacher.teacherProfileId)
      );

      // Remover professores de outras equipes (professores só podem estar em uma equipe)
      setTeams(prevTeams => {
        // Primeiro, remover os professores selecionados de todas as equipes
        const teamsWithoutSelectedTeachers = prevTeams.map(team => ({
          ...team,
          teachers: (team.teachers || []).filter((t: any) => 
            !selectedTeacherIds.includes(t.id)
          ),
        }));

        // Depois, adicionar os professores à equipe selecionada
        return teamsWithoutSelectedTeachers.map(team => {
          if (team.numberTeam === selectedTeamNumber) {
            const existingTeacherIds = (team.teachers || []).map((t: any) => t.id);
            const newTeachers = selectedTeachers
              .filter(teacher => !existingTeacherIds.includes(teacher.teacherProfileId))
              .map(teacher => ({
                id: teacher.teacherProfileId,
                active: true,
                user: {
                  id: teacher.teacherProfileId, // Usando teacherProfileId como fallback
                  name: teacher.name,
                  email: "",
                  phone: "",
                  active: true,
                  completed: false,
                  commonUser: false,
                },
              }));
            
            return {
              ...team,
              teachers: [...(team.teachers || []), ...newTeachers],
            };
          }
          return team;
        });
      });

      setShowAddTeacherDialog(false);
      setSelectedTeamNumber(null);
      setSelectedTeacherIds([]);
      setTeacherSearchTerm("");
    };

    const handleRemoveTeacher = (teamNumber: number, teacherId: string) => {
      console.log("🟠 [handleRemoveTeacher] Removendo professor:", { teamNumber, teacherId });
      setTeams(prevTeams => {
        const updated = prevTeams.map(team => 
          team.numberTeam === teamNumber
            ? { ...team, teachers: (team.teachers || []).filter((t: any) => t.id !== teacherId) }
            : team
        );
        console.log("🟠 [handleRemoveTeacher] Equipes atualizadas:", JSON.stringify(updated, null, 2));
        return updated;
      });
    };

    const handleDeleteTeamClick = (teamNumber: number) => {
      if (teamsQuantity <= 1) {
        setError("Não é possível excluir a última equipe. O abrigo deve ter pelo menos uma equipe.");
        return;
      }
      setTeamToDelete(teamNumber);
      setShowDeleteTeamDialog(true);
    };

    const handleConfirmDeleteTeam = () => {
      if (!teamToDelete) return;

      const teamNumberToDelete = teamToDelete;
      const teamToDeleteData = teams.find(t => t.numberTeam === teamNumberToDelete);
      const leadersCount = teamToDeleteData?.leaders?.length || 0;
      const teachersCount = teamToDeleteData?.teachers?.length || 0;

      // Remover a equipe completa (incluindo todos os líderes e professores)
      setTeams(prevTeams => {
        // Filtrar a equipe a ser excluída (remove o card inteiro com todos os líderes e professores)
        const filteredTeams = prevTeams.filter(team => team.numberTeam !== teamNumberToDelete);
        
        // Renumerar as equipes subsequentes
        const renumberedTeams = filteredTeams.map(team => {
          if (team.numberTeam > teamNumberToDelete) {
            return {
              ...team,
              numberTeam: team.numberTeam - 1,
            };
          }
          return team;
        });

        // Ordenar por numberTeam
        renumberedTeams.sort((a, b) => a.numberTeam - b.numberTeam);

        console.log("🟠 [handleConfirmDeleteTeam] Equipe excluída:", teamNumberToDelete);
        console.log("🟠 [handleConfirmDeleteTeam] Líderes removidos:", leadersCount);
        console.log("🟠 [handleConfirmDeleteTeam] Professores removidos:", teachersCount);
        console.log("🟠 [handleConfirmDeleteTeam] Equipes renumeradas:", JSON.stringify(renumberedTeams, null, 2));
        
        return renumberedTeams;
      });

      // Atualizar a quantidade de equipes no formulário pai
      const newQuantity = teamsQuantity - 1;
      if (onTeamsQuantityChange) {
        onTeamsQuantityChange(newQuantity);
      }

      // Fechar diálogo
      setShowDeleteTeamDialog(false);
      setTeamToDelete(null);
    };

    // Filtrar líderes disponíveis
    const getAvailableLeaders = useCallback((teamNumber: number) => {
      return leaderOptions;
    }, [leaderOptions]);

    // Filtrar professores disponíveis
    const getAvailableTeachers = useCallback((teamNumber: number) => {
      const team = teams.find((t) => t.numberTeam === teamNumber);
      const teamTeacherIds = team?.teachers?.map((t) => t.id) || [];
      const teachersInOtherTeams = new Set<string>();
      
      teams.forEach((t) => {
        if (t.numberTeam !== teamNumber && t.teachers) {
          t.teachers.forEach((teacher) => {
            teachersInOtherTeams.add(teacher.id);
          });
        }
      });
      
      return teacherOptions.filter((t) => {
        if (teachersInOtherTeams.has(t.teacherProfileId)) {
          return false;
        }
        return !t.vinculado || teamTeacherIds.includes(t.teacherProfileId);
      });
    }, [teams, teacherOptions]);

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
                      justifyContent: "space-between",
                      gap: 1.5, 
                      mb: 2,
                      pb: 1.5,
                      borderBottom: "2px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
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
                    {teamsQuantity > 1 && (
                      <Tooltip title="Excluir equipe">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTeamClick(teamNumber)}
                          sx={{
                            "&:hover": {
                              bgcolor: "error.light",
                              color: "error.contrastText",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
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
                        disabled={loading}
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
                        disabled={loading}
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

        {/* Dialog de confirmação para excluir equipe */}
        <Dialog 
          open={showDeleteTeamDialog} 
          onClose={() => {
            setShowDeleteTeamDialog(false);
            setTeamToDelete(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
            Excluir Equipe {teamToDelete}?
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Tem certeza que deseja excluir a <strong>Equipe {teamToDelete}</strong>?
            </Typography>
            {teamToDelete && (() => {
              const teamData = teams.find(t => t.numberTeam === teamToDelete);
              const leadersCount = teamData?.leaders?.length || 0;
              const teachersCount = teamData?.teachers?.length || 0;
              
              if (leadersCount > 0 || teachersCount > 0) {
                return (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Esta ação irá excluir:
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
                      {leadersCount > 0 && <li>{leadersCount} líder(es)</li>}
                      {teachersCount > 0 && <li>{teachersCount} professor(es)</li>}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                      Todos os membros serão removidos junto com a equipe.
                    </Typography>
                  </Alert>
                );
              }
              return null;
            })()}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              As equipes subsequentes serão renumeradas automaticamente.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
            <Button 
              onClick={() => {
                setShowDeleteTeamDialog(false);
                setTeamToDelete(null);
              }} 
              sx={{ minWidth: { xs: "auto", sm: 100 } }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmDeleteTeam}
              color="error"
              variant="contained"
              sx={{ minWidth: { xs: "auto", sm: 100 } }}
            >
              Excluir Equipe
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
);

TeamManagementSection.displayName = "TeamManagementSection";

export default TeamManagementSection;

