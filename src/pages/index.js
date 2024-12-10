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
  const [sortColumn, setSortColumn] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => setVendors(data))
      .catch((error) => console.error("Failed to fetch vendors:", error));
  }, []);

  const handleSearchChange = (e) =>
    setSearchQuery(e.target.value.toLowerCase());

  const handleSort = (property) => {
    const isAsc = sortColumn === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortColumn(property);
  };

  const handlePageChange = (event, newPage) => setPage(newPage);
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openDeleteDialog = (id) => {
    setSelectedVendorId(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedVendorId(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/vendors/${selectedVendorId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete vendor.");
      setVendors((prev) => prev.filter((v) => v.id !== selectedVendorId));
      closeDeleteDialog();
      setSnackbar({
        open: true,
        message: "Vendor deleted successfully.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  };

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const filteredVendors = vendors
    .filter((vendor) =>
      [vendor.name, vendor.contact, vendor.email, vendor.phone]
        .map((val) => (val || "").toLowerCase())
        .some((field) => field.includes(searchQuery))
    )
    .sort((a, b) => {
      const aValue = a[sortColumn] || "";
      const bValue = b[sortColumn] || "";
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  const paginatedVendors = filteredVendors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Vendor Management System
      </Typography>
      <Link href="/add" passHref>
        <Button variant="contained" color="primary" sx={{ mb: 2 }}>
          <strong>Add Vendor</strong>
        </Button>
      </Link>
      <TextField
        fullWidth
        placeholder="Search by Name, Contact, or Email"
        onChange={handleSearchChange}
        value={searchQuery}
        sx={{ mb: 2 }}
      />
      <TableContainer
        component={Paper}
        sx={{ overflowX: "auto", maxHeight: "80vh" }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === "id"}
                  direction={sortColumn === "id" ? sortOrder : "asc"}
                  onClick={() => handleSort("id")}
                >
                  <strong>ID</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === "name"}
                  direction={sortColumn === "name" ? sortOrder : "asc"}
                  onClick={() => handleSort("name")}
                >
                  <strong>Name</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === "contact"}
                  direction={sortColumn === "contact" ? sortOrder : "asc"}
                  onClick={() => handleSort("contact")}
                >
                  <strong>Contact</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Phone</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
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
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                  </Link>
                  <IconButton
                    color="secondary"
                    onClick={() => openDeleteDialog(vendor.id)}
                  >
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
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Vendor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>
              {vendors.find((v) => v.id === selectedVendorId)?.name}
            </strong>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
