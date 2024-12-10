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
} from "@mui/material";

const initialState = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  address: "",
};

export default function AddVendor() {
  const [vendor, setVendor] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const router = useRouter();

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleChange = (e) =>
    setVendor({ ...vendor, [e.target.name]: e.target.value });

  const validateForm = () => {
    const validationErrors = Object.entries(vendor).reduce(
      (acc, [key, value]) => {
        if (!value.trim()) acc[key] = `${capitalize(key)} is required.`;
        if (key === "email" && !/^\S+@\S+\.\S+$/.test(value))
          acc.email = "Valid email is required.";
        return acc;
      },
      {}
    );
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    //  Enhanced POST method with valiadation and notification for successfull/failure submission
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendor),
      });
      if (!res.ok) throw new Error("Failed to add vendor.");
      setSnackbar({
        open: true,
        message: "Vendor added successfully!",
        severity: "success",
      });
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Add New Vendor
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "grid", gap: 2 }}
      >
        {Object.keys(initialState).map((field) => (
          <TextField
            key={field}
            name={field}
            label={capitalize(field)}
            value={vendor[field]}
            onChange={handleChange}
            error={!!errors[field]}
            helperText={errors[field]}
            fullWidth
            required
          />
        ))}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Add Vendor
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
