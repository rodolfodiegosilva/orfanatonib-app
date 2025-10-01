import React, { useMemo } from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, Divider, Typography, Chip, Box, TablePagination,
  useMediaQuery, useTheme, Tooltip, IconButton
} from "@mui/material";
import {
  ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, SortingState, useReactTable
} from "@tanstack/react-table";
import { Visibility, Link as LinkIcon, WhatsApp } from "@mui/icons-material";
import type { LeaderProfile } from "../types";
import { fmtDate } from "@/utils/dates";
import { buildWhatsappLink } from "@/utils/whatsapp";
import { useSelector } from "react-redux";
import { RootState } from "@/store/slices";

type Props = {
  rows: LeaderProfile[];
  total: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (n: number) => void;
  setPageSize: (n: number) => void;
  sorting: SortingState;
  setSorting: (s: SortingState) => void;
  onView: (c: LeaderProfile) => void;
  onLink: (c: LeaderProfile) => void;
};

export default function LeaderTable({
  rows, total, pageIndex, pageSize, setPageIndex, setPageSize,
  sorting, setSorting, onView, onLink,
}: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const columns = useMemo<ColumnDef<LeaderProfile>[]>(() => [
    {
      id: "user",
      header: "Líder",
      cell: ({ row }) => {
        const u = row.original.user;
        return (
          <Box sx={{ display: "flex", flexDirection: "column", minWidth: 190 }}>
            <Typography fontWeight={600} noWrap>{u?.name || "—"}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap title={u?.email}>{u?.email}</Typography>
          </Box>
        );
      },
    },
    {
      id: "shelters",
      header: "Abrigos",
      cell: ({ row }) => {
        const shelter = row.original.shelter;
        if (!shelter) return <Chip size="small" label="—" />;
        return (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            <Chip key={shelter.id} size="small" label={shelter.name ?? shelter.id} />
          </Box>
        );
      },
    },
    {
      id: "teachers",
      header: "Professores",
      cell: ({ row }) => {
        const shelter = row.original.shelter;
        const list = shelter?.teachers ?? [];
        if (!list.length) return <Chip size="small" label="—" />;
        return (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {list.map((t) => <Chip key={t.id} size="small" label={t.user?.name || t.user?.email || t.id} />)}
          </Box>
        );
      },
    },
    ...(isMdUp ? ([
      {
        accessorKey: "createdAt",
        header: "Criado em",
        cell: ({ getValue }) => <>{fmtDate(getValue() as string)}</>,
        meta: { width: 170 },
      },
      {
        accessorKey: "updatedAt",
        header: "Atualizado em",
        cell: ({ getValue }) => <>{fmtDate(getValue() as string)}</>,
        meta: { width: 170 },
      },
    ] as ColumnDef<LeaderProfile>[]) : []),
    {
      id: "actions",
      header: "Ações",
      enableSorting: false,
      cell: ({ row }) => {
        const { user: loggedUser } = useSelector((state: RootState) => state.auth);
        const wa = buildWhatsappLink(row.original.user?.name, loggedUser?.name, row.original.user?.phone);

        return (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            <Tooltip title="Detalhes">
              <IconButton size={isXs ? "small" : "medium"} onClick={() => onView(row.original)}>
                <Visibility fontSize="inherit" />
              </IconButton>
            </Tooltip>
            {wa && (
              <Tooltip title="WhatsApp">
                <IconButton
                  size={isXs ? "small" : "medium"}
                  component="a"
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: "success.main" }}
                >
                  <WhatsApp fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Vincular/Desvincular abrigo">
              <IconButton size={isXs ? "small" : "medium"} onClick={() => onLink(row.original)}>
                <LinkIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
      meta: { width: isXs ? 180 : 240 },
    },
  ], [isMdUp, isXs, onLink, onView]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: (u) => {
      const next = typeof u === "function" ? u(sorting) : u;
      setSorting(next);
      setPageIndex(0);
    },
    onPaginationChange: (u) => {
      const next = typeof u === "function" ? u({ pageIndex, pageSize }) : u;
      setPageIndex(next.pageIndex ?? 0);
      setPageSize(next.pageSize ?? 12);
    },
    getRowId: (row) => row.id,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  });

  return (
    <Paper>
      <TableContainer>
        <Table size={isXs ? "small" : "medium"} stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(h => {
                  const sorted = h.column.getIsSorted();
                  const width = (h.column.columnDef.meta as any)?.width;
                  const isActions = h.column.id === "actions";
                  return (
                    <TableCell key={h.id} sx={{ width }}>
                      {!isActions ? (
                        <TableSortLabel
                          active={!!sorted}
                          direction={sorted === "asc" ? "asc" : sorted === "desc" ? "desc" : "asc"}
                          onClick={h.column.getToggleSortingHandler()}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </TableSortLabel>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary">Nenhum líder encontrado nesta página.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <TablePagination
        component="div"
        count={total}
        page={pageIndex}
        onPageChange={(_, p) => setPageIndex(p)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPageIndex(0); }}
        rowsPerPageOptions={isXs ? [6, 12, 24] : [12, 24, 50]}
        labelRowsPerPage={isXs ? "Linhas" : "Linhas por página"}
      />
    </Paper>
  );
}
