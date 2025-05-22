import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  TextField,
  Chip
} from '@mui/material';

// Données simulées
const MOCK_PATIENTS = [
  { id: 1, name: 'Jean Dupont', age: 45, email: 'jean.dupont@example.com', status: 'Actif' },
  { id: 2, name: 'Marie Martin', age: 32, email: 'marie.martin@example.com', status: 'Actif' },
  { id: 3, name: 'Pierre Durand', age: 58, email: 'pierre.durand@example.com', status: 'Inactif' },
  { id: 4, name: 'Sophie Leroy', age: 29, email: 'sophie.leroy@example.com', status: 'Actif' },
  { id: 5, name: 'Lucas Moreau', age: 41, email: 'lucas.moreau@example.com', status: 'Actif' },
  { id: 6, name: 'Emma Bernard', age: 27, email: 'emma.bernard@example.com', status: 'Inactif' },
];

const PatientsList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrage des patients selon la recherche
  const filteredPatients = MOCK_PATIENTS.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.age.toString().includes(searchTerm)
  );

  // Gestion de la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Rendu du statut avec une couleur différente
  const renderStatus = (status) => {
    const color = status === 'Actif' ? 'success' : 'error';
    return <Chip label={status} color={color} size="small" />;
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Liste des Patients
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          label="Rechercher"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        
        <Button variant="contained" color="primary">
          Ajouter un patient
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Âge</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age} ans</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{renderStatus(patient.status)}</TableCell>
                  <TableCell align="right">
                    <Button 
                      component={Link} 
                      to={`/patients/${patient.id}`}
                      size="small"
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {filteredPatients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Aucun patient trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredPatients.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes par page:"
        />
      </TableContainer>
    </Box>
  );
};

export default PatientsList; 