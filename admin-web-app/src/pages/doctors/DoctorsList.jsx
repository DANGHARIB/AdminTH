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
  InputAdornment 
} from '@mui/material';

// Données simulées
const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Martin Dupont', specialty: 'Cardiologue', email: 'martin.dupont@example.com' },
  { id: 2, name: 'Dr. Sophie Laurent', specialty: 'Pédiatre', email: 'sophie.laurent@example.com' },
  { id: 3, name: 'Dr. Thomas Petit', specialty: 'Généraliste', email: 'thomas.petit@example.com' },
  { id: 4, name: 'Dr. Julie Robert', specialty: 'Dermatologue', email: 'julie.robert@example.com' },
  { id: 5, name: 'Dr. Paul Michel', specialty: 'Ophtalmologue', email: 'paul.michel@example.com' },
];

const DoctorsList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtrage des médecins selon la recherche
  const filteredDoctors = MOCK_DOCTORS.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestion de la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Liste des Médecins
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
          Ajouter un médecin
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Spécialité</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDoctors
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>{doctor.name}</TableCell>
                  <TableCell>{doctor.specialty}</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell align="right">
                    <Button 
                      component={Link} 
                      to={`/doctors/${doctor.id}`}
                      size="small"
                    >
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {filteredDoctors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucun médecin trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredDoctors.length}
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

export default DoctorsList;