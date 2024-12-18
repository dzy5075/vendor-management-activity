import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function EditVendor() {
  const router = useRouter();
  const { id } = router.query;

  const [vendor, setVendor] = useState({
    id: "",
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    category: "",
  });

  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch vendor data on mount
  useEffect(() => {
    if (!id) return;
    fetch(`/api/vendors/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject("Vendor not found")))
      .then((data) => setVendor(data))
      .catch((err) => {
        console.error(err);
        setSnackbar({ open: true, message: err, severity: "error" });
        router.push("/");
      });
  }, [id, router]);

  const handleChange = (e) =>
    setVendor({ ...vendor, [e.target.name]: e.target.value });

  // Validate required fields and email format
  const validateForm = () => {
    const validationErrors = {};
    ["name", "contact", "email", "phone", "address", "category"].forEach(
      (field) => {
        if (!vendor[field]?.trim()) {
          validationErrors[field] = `${
            field.charAt(0).toUpperCase() + field.slice(1)
          } is required.`;
        }
        if (field === "email" && !/^\S+@\S+\.\S+$/.test(vendor.email)) {
          validationErrors.email = "Valid email is required.";
        }
      }
    );
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Update vendor info, Enhanced Put method with validation and success/error notifications
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendor),
      });
      if (!res.ok) throw new Error("Failed to update vendor.");
      setSnackbar({
        open: true,
        message: "Vendor updated successfully!",
        severity: "success",
      });
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ backgroundColor: "#faf8ee", minHeight: "100vh", py: 4 }}
    >
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#4ad500",
          }}
        >
          Edit Vendor
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "grid", gap: 2 }}
      >
        <TextField
          name="id"
          label="ID"
          value={vendor.id}
          InputProps={{ readOnly: true }}
          fullWidth
        />
        <TextField
          name="name"
          label="Name"
          value={vendor.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
          required
        />
        <TextField
          name="contact"
          label="Contact"
          value={vendor.contact}
          onChange={handleChange}
          error={!!errors.contact}
          helperText={errors.contact}
          fullWidth
          required
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          value={vendor.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
          required
        />
        <TextField
          name="phone"
          label="Phone"
          value={vendor.phone}
          onChange={handleChange}
          error={!!errors.phone}
          helperText={errors.phone}
          fullWidth
          required
        />
        <TextField
          name="address"
          label="Address"
          value={vendor.address}
          onChange={handleChange}
          error={!!errors.address}
          helperText={errors.address}
          fullWidth
          required
        />

        <FormControl fullWidth error={!!errors.category} required>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={vendor.category}
            onChange={handleChange}
          >
            <MenuItem value="Utensils">Utensils</MenuItem>
            <MenuItem value="Packaging">Packaging</MenuItem>
            <MenuItem value="Containers">Containers</MenuItem>
          </Select>
          {errors.category && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errors.category}
            </Alert>
          )}
        </FormControl>

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Update Vendor
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={() => router.push("/")}
        >
          Cancel
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
