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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import TableSortLabel from "@mui/material/TableSortLabel";

export default function Home() {
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterField, setFilterField] = useState("all");
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
  const handleFilterChange = (e) => setFilterField(e.target.value);

  const handleSort = (property) => {
    const isAsc = sortColumn === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortColumn(property);
  };
  // Pagination
  const handlePageChange = (_, newPage) => setPage(newPage);
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
  // Enhanced Delete method with error handling
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
  // Filtered vendors
  const filteredVendors = vendors
    .filter((vendor) => {
      if (!searchQuery) return true;
      if (filterField === "all") {
        const fields = [
          vendor.name,
          vendor.contact,
          vendor.email,
          vendor.phone,
          vendor.category,
        ].map((val) => (val || "").toLowerCase());
        return fields.some((field) => field.startsWith(searchQuery));
      } else {
        const fieldValue = (vendor[filterField] || "").toLowerCase();
        return fieldValue.startsWith(searchQuery);
      }
    })
    .sort((a, b) => {
      const aVal = a[sortColumn] || "";
      const bVal = b[sortColumn] || "";
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

  const paginatedVendors = filteredVendors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  // Export button function
  const exportData = () => {
    const headers = ["ID", "Name", "Contact", "Email", "Phone", "Category"];
    const rows = filteredVendors.map((vendor) => [
      vendor.id,
      vendor.name,
      vendor.contact,
      vendor.email,
      vendor.phone,
      vendor.category,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((r) => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "vendors_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cellStyle = {
    py: 1,
    px: 2,
    lineHeight: "1.5",
    verticalAlign: "middle",
  };

  return (
    <Container sx={{ backgroundColor: "#faf8ee", minHeight: "100vh", py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#4ad500",
          }}
        >
          EcoWare (Vendor Management System)
        </Typography>
      </Box>

      {/* Add Vendor and Export Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Link href="/add" passHref>
          <Button variant="contained" color="primary">
            <strong>Add New Vendor</strong>
          </Button>
        </Link>
        <Button variant="outlined" onClick={exportData}>
          <strong>Export Data</strong>
        </Button>
      </Box>

      {/* Filter Dropdown and Search Bar */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
        <FormControl sx={{ width: 200 }}>
          <InputLabel>Filter By</InputLabel>
          <Select
            value={filterField}
            label="Filter By"
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="contact">Contact</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="phone">Phone</MenuItem>
            <MenuItem value="category">Category</MenuItem>
          </Select>
        </FormControl>
        <TextField
          placeholder={
            filterField === "all"
              ? "Search by All Fields"
              : `Search by ${
                  filterField.charAt(0).toUpperCase() + filterField.slice(1)
                }`
          }
          onChange={handleSearchChange}
          value={searchQuery}
          fullWidth
        />
      </Box>
      <TableContainer
        component={Paper}
        sx={{ overflowX: "auto", maxHeight: "80vh" }}
      >
        {/* Sticky table headers */}
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {["id", "name", "contact", "email", "phone", "category"].map(
                (col) => (
                  <TableCell key={col} sx={cellStyle}>
                    {["id", "name", "contact", "category"].includes(col) ? (
                      <TableSortLabel
                        active={sortColumn === col}
                        direction={sortColumn === col ? sortOrder : "asc"}
                        onClick={() => handleSort(col)}
                      >
                        <strong>
                          {col.charAt(0).toUpperCase() + col.slice(1)}
                        </strong>
                      </TableSortLabel>
                    ) : (
                      <strong>
                        {col.charAt(0).toUpperCase() + col.slice(1)}
                      </strong>
                    )}
                  </TableCell>
                )
              )}
              <TableCell sx={cellStyle}>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedVendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell sx={cellStyle}>{vendor.id}</TableCell>
                <TableCell sx={cellStyle}>{vendor.name}</TableCell>
                <TableCell sx={cellStyle}>{vendor.contact}</TableCell>
                <TableCell sx={cellStyle}>{vendor.email}</TableCell>
                <TableCell sx={cellStyle}>{vendor.phone}</TableCell>
                <TableCell sx={cellStyle}>{vendor.category}</TableCell>
                <TableCell sx={cellStyle}>
                  <Link href={`/edit/${vendor.id}`} passHref>
                    {/* Edit Button */}
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                  </Link>
                  {/* Delete Button */}
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
                <TableCell colSpan={7} align="center" sx={{ py: 2 }}>
                  No vendors available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredVendors.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Vendor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>
              {vendors.find((v) => v.id === selectedVendorId)?.name}
            </strong>
            ? This action cannot be undone once deleted.
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
