import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import TableSortLabel from '@mui/material/TableSortLabel';

export default function Home() {
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('asc');
  // for sorting by vendor id or name


  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => setVendors(data));
  }, []);

  const handleClickOpen = (id) => {
    setSelectedVendorId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedVendorId(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/vendors/${selectedVendorId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Remove the deleted vendor from the state
        setVendors(vendors.filter((vendor) => vendor.id !== selectedVendorId));
        handleClose();
      } else {
        console.error("Failed to delete the vendor.");
        // Optionally, handle error states here
      }
    } catch (error) {
      console.error("An error occurred while deleting the vendor:", error);
      // Optionally, handle error states here
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  vendors.sort((a, b) => {
    if (order === 'asc') {
      return a[orderBy] < b[orderBy] ? -1 : 1;
    }
    return a[orderBy] > b[orderBy] ? -1 : 1;
  });
  
  // Sort vendor based on orderBy or order
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Vendor Management System
      </Typography>
      <Link href="/add" passHref>
        <Button
          variant="contained"
          color="primary"
          style={{ marginBottom: "20px" }}
        >
          Add Vendor
        </Button>
      </Link>
      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        {/* Allows table to be scrollable on smaller screens */}
        <Table>
          <TableHead>
            <TableRow>
            <TableCell>
              {/* Sort by ID */}
              <TableSortLabel
                active={orderBy === 'id'}
                direction={orderBy === 'id' ? order : 'asc'}
                onClick={() => handleSort('id')}
              >
                <strong>ID</strong>
              </TableSortLabel>
            </TableCell>
            <TableCell>
              {/* Sort by Vendor Name */}
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                onClick={() => handleSort('name')}
              >
                <strong>Name</strong>
              </TableSortLabel>
            </TableCell>
              <TableCell>
                <strong>Contact</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Phone</strong>
              </TableCell>
              <TableCell>
                <strong>Address</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow
                key={vendor.id}
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)" },
                }}
              >
                {/* Hover color added to improve visability for vendor table */}
                <TableCell>{vendor.id}</TableCell>
                <TableCell>{vendor.name}</TableCell>
                <TableCell>{vendor.contact}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.phone}</TableCell>
                <TableCell>{vendor.address}</TableCell>
                <TableCell>
                  <Link href={`/edit/${vendor.id}`} passHref>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      style={{ marginRight: "10px" }}
                    >
                      Edit
                    </Button>
                  </Link>
                  <IconButton
                    color="secondary"
                    onClick={() => handleClickOpen(vendor.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {vendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No vendors available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Vendor"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete{" "}
            <strong>
              {vendors.find((v) => v.id === selectedVendorId)?.name}
            </strong>
            ? This action cannot be undone.
          </DialogContentText>
          {/* Revised context to be more specific to vendor when delete button is clicked */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
