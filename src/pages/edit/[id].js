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
  CircularProgress,
} from "@mui/material";

export default function EditVendor() {
  const router = useRouter();
  const { id } = router.query;

  const [vendor, setVendor] = useState({ id: "", name: "", contact: "", email: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });

  // Fetch vendor data when component loads
  useEffect(() => {
    if (!id) return;
    fetch(`/api/vendors/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject("Vendor not found")))
      .then((data) => setVendor(data))
      .catch((err) => {
        setSnackbar({ open: true, message: err, severity: "error" });
        router.push("/");
      })
      .finally(() => setIsLoading(false));
  }, [id, router]);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    Object.entries(vendor).forEach(([key, value]) => {
      if (key !== "id" && !value.trim()) newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required.`;
      if (key === "email" && !/^\S+@\S+\.\S+$/.test(value)) newErrors.email = "Valid email is required.";
    });
    setErrors(newErrors);
    return !Object.keys(newErrors).length;
  };

  // Submit updated vendor data
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendor),
      });
      if (!res.ok) throw new Error("Failed to update vendor.");
      setSnackbar({ open: true, message: "Vendor updated successfully!", severity: "success" });
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Container sx={{ display: "flex", justifyContent: "center", height: "80vh" }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>Edit Vendor</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
        {Object.keys(vendor).map((field) =>
          field === "id" ? (
            <TextField
              key={field}
              name={field}
              label="ID"
              value={vendor[field]}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          ) : (
            <TextField
              key={field}
              name={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={vendor[field]}
              onChange={(e) => setVendor({ ...vendor, [e.target.name]: e.target.value })}
              error={!!errors[field]}
              helperText={errors[field]}
              fullWidth
              required
            />
          )
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSaving}
          startIcon={isSaving && <CircularProgress size={20} />}
        >
          {isSaving ? "Saving..." : "Update Vendor"}
        </Button>
        <Button variant="outlined" color="secondary" fullWidth onClick={() => router.push("/")}>
          Cancel
        </Button>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
