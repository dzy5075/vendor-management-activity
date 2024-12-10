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
  TextField,
  Snackbar,
  Alert,
  TablePagination,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import TableSortLabel from "@mui/material/TableSortLabel";

export default function Home() {
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("id");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch vendors from the API
  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => setVendors(data))
      .catch((error) => console.error("Failed to fetch vendors:", error));
  }, []);

  // Handle search input
  const handleSearch = (e) => setSearchQuery(e.target.value.toLowerCase());

  // Handle column sorting
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle pagination changes
  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  // Open delete confirmation dialog
  const handleClickOpen = (id) => {
    setSelectedVendorId(id);
    setOpen(true);
  };

  // Close delete confirmation dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedVendorId(null);
  };

  // Handle vendor deletion 
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/vendors/${selectedVendorId}`, { method: "DELETE" });
      if (res.ok) {
        setVendors(vendors.filter((vendor) => vendor.id !== selectedVendorId));
        handleClose();
        setSnackbar({ open: true, message: "Vendor deleted successfully.", severity: "success" });
      } else {
        throw new Error("Failed to delete vendor.");
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  };

  // Close snackbar notifications
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Filter and sort vendors
  const filteredVendors = vendors
    .filter((vendor) =>
      [vendor.name, vendor.contact, vendor.email, vendor.phone]
        .map((field) => (field || "").toLowerCase())
        .some((field) => field.includes(searchQuery))
    )
    .sort((a, b) => {
      const aValue = a[orderBy] || "";
      const bValue = b[orderBy] || "";
      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return order === "asc" ? aValue - bValue : bValue - aValue;
    });

  // Paginate vendors
  const paginatedVendors = filteredVendors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Vendor Management System
      </Typography>
      <Link href="/add" passHref>
        <Button variant="contained" color="primary" sx={{ mb: 2 }}>
          Add Vendor
        </Button>
      </Link>
      <TextField
        fullWidth
        placeholder="Search by Name, Contact, or Email"
        onChange={handleSearch}
        value={searchQuery}
        sx={{ mb: 2 }}
      />
      <TableContainer component={Paper} sx={{ overflowX: "auto", maxHeight: "80vh" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "id"}
                  direction={orderBy === "id" ? order : "asc"}
                  onClick={() => handleSort("id")}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleSort("name")}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "contact"}
                  direction={orderBy === "contact" ? order : "asc"}
                  onClick={() => handleSort("contact")}
                >
                  Contact
                </TableSortLabel>
              </TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedVendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>{vendor.id}</TableCell>
                <TableCell>{vendor.name}</TableCell>
                <TableCell>{vendor.contact}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.phone}</TableCell>
                <TableCell>
                  <Link href={`/edit/${vendor.id}`} passHref>
                    <Button variant="outlined" color="primary" size="small">
                      Edit
                    </Button>
                  </Link>
                  <IconButton color="secondary" onClick={() => handleClickOpen(vendor.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedVendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No vendors available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredVendors.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Vendor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{vendors.find((v) => v.id === selectedVendorId)?.name}</strong>? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
