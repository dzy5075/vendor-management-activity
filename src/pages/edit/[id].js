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
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/vendors/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject("Vendor not found")))
      .then((data) => setVendor(data))
      .catch((err) => {
        setSnackbar({ open: true, message: err, severity: "error" });
        router.push("/");
      });
  }, [id, router]);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const validateForm = () => {
    const fieldErrors = {};
    Object.entries(vendor).forEach(([key, value]) => {
      if (key !== "id" && !value.trim())
        fieldErrors[key] = `${capitalize(key)} is required.`;
      if (key === "email" && !/^\S+@\S+\.\S+$/.test(value))
        fieldErrors.email = "Valid email is required.";
    });
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

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
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Edit Vendor
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "grid", gap: 2 }}
      >
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
              label={capitalize(field)}
              value={vendor[field]}
              onChange={(e) =>
                setVendor({ ...vendor, [e.target.name]: e.target.value })
              }
              error={!!errors[field]}
              helperText={errors[field]}
              fullWidth
              required
            />
          )
        )}
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
