import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  Toolbar,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import './DataTable.css';

const DataTable = ({
  title = '',
  data = [],
  columns = [],
  searchable = true,
  selectable = false,
  actionButton = null,
  onRowClick = null,
  pagination = true,
  initialRowsPerPage = 10,
  filters = [],
  exportable = false,
//   loading = false
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
//   const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilters, ] = useState({});

  // Filter data based on search term and active filters
  const filteredData = data.filter(row => {
    // Search filter
    const searchMatch = !searchTerm || 
      columns.some(column => {
        const value = row[column.field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });

    // Active filters
    const filterMatch = Object.keys(activeFilters).every(filterKey => {
      if (!activeFilters[filterKey]) return true;
      return row[filterKey] === activeFilters[filterKey];
    });

    return searchMatch && filterMatch;
  });

  // Pagination
  const paginatedData = pagination 
    ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : filteredData;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedData.map(row => row.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const renderCellContent = (row, column) => {
    const value = row[column.field];
    
    if (column.renderCell) {
      return column.renderCell(value, row);
    }

    if (column.type === 'chip') {
      const chipColor = column.chipColor ? column.chipColor(value) : 'default';
      return <Chip label={value} color={chipColor} size="small" />;
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString('fr-FR');
    }

    if (column.type === 'avatar') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {column.avatar && column.avatar(row)}
          <Typography variant="body2">{value}</Typography>
        </Box>
      );
    }

    // Gérer les valeurs qui sont des objets pour éviter l'erreur "Objects are not valid as React child"
    if (typeof value === 'object' && value !== null) {
      // Convertir l'objet en chaîne JSON
      return JSON.stringify(value);
    }

    return value;
  };

  return (
    <Box className="data-table-container">
      {/* Header */}
      <Box className="data-table-header">
        <Box>
          {title && (
            <Typography variant="h6" className="table-title">
              {title}
            </Typography>
          )}
          {selected.length > 0 && (
            <Typography variant="body2" color="primary">
              {selected.length} élément(s) sélectionné(s)
            </Typography>
          )}
        </Box>
        
        <Box className="table-actions">
          {searchable && (
            <TextField
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              className="search-field"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#6b7280', fontSize: '20px' }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
          
          {filters.length > 0 && (
            <IconButton
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              size="small"
              className="action-button"
            >
              <FilterIcon />
            </IconButton>
          )}
          
          {exportable && (
            <IconButton size="small" className="action-button">
              <DownloadIcon />
            </IconButton>
          )}
          
          {actionButton}
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} className="table-container">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox" className="table-head-cell">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < paginatedData.length}
                    checked={paginatedData.length > 0 && selected.length === paginatedData.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell 
                  key={column.field} 
                  className="table-head-cell"
                  align={column.align || 'left'}
                  sx={{ 
                    minWidth: column.minWidth,
                    width: column.width 
                  }}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => {
              const isItemSelected = isSelected(row.id);
              
              return (
                <TableRow 
                  key={row.id} 
                  hover
                  onClick={() => onRowClick && onRowClick(row)}
                  selected={isItemSelected}
                  className={`table-row ${onRowClick ? 'clickable' : ''}`}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={() => handleSelectRow(row.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell 
                      key={column.field} 
                      align={column.align || 'left'}
                      className="table-cell"
                    >
                      {renderCellContent(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="empty-row"
                >
                  <Typography variant="body2" color="text.secondary">
                    Aucune donnée à afficher
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
          className="table-pagination"
        />
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        {filters.map((filter) => (
          <MenuItem key={filter.field} onClick={() => setFilterAnchorEl(null)}>
            {filter.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default DataTable;