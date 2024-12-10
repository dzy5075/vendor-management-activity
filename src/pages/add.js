import { useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

// Define initial state for form fields
const initialState = { name: "", contact: "", email: "", phone: "", address: "" };

export default function AddVendor() {
  const [vendor, setVendor] = useState(initialState); // State for form data
  const [errors, setErrors] = useState({}); 
  const [loading, setLoading] = useState(false); // Loading indicator
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" }); // Snackbar for feedback
  const router = useRouter();

  // Handle input changes for all fields
  const handleChange = (e) =>
    setVendor({ ...vendor, [e.target.name]: e.target.value });

  // Validate form fields and return true if valid
  const validateForm = () => {
    const validationErrors = Object.entries(vendor).reduce((acc, [key, value]) => {
      if (!value.trim()) acc[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
      if (key === "email" && !/^\S+@\S+\.\S+$/.test(value)) acc.email = "Valid email is required.";
      return acc;
    }, {});
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Submit form data to the server
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Stop if validation fails

    setLoading(true);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendor),
      });

      if (!res.ok) throw new Error("Failed to add vendor.");

      setSnackbar({ open: true, message: "Vendor added successfully!", severity: "success" });
      setTimeout(() => router.push("/"), 2000); // Redirect after success
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Add New Vendor
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
        {/* Dynamically render input fields */}
        {Object.keys(initialState).map((field) => (
          <TextField
            key={field}
            name={field}
            label={field.charAt(0).toUpperCase() + field.slice(1)} // Capitalized label
            value={vendor[field]}
            onChange={handleChange}
            error={!!errors[field]}
            helperText={errors[field]}
            fullWidth
            required
          />
        ))}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? "Saving..." : "Add Vendor"}
        </Button>
        <Button variant="outlined" color="secondary" fullWidth onClick={() => router.push("/")}>
          Cancel
        </Button>
      </Box>
      {/* Snackbar for feedback on success or error */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
