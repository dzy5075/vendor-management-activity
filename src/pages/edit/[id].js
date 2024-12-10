// pages/edit/[id].js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Typography, TextField, Button, Box } from "@mui/material";

export default function EditVendor() {
  const router = useRouter();
  const { id } = router.query;
  const [vendor, setVendor] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetch(`/api/vendors/${id}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Vendor not found");
        })
        .then((data) => setVendor(data))
        .catch((error) => {
          console.error(error);
          router.push("/");
        });
    }
  }, [id]);

  const handleChange = (e) => {
    setVendor({ ...vendor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/vendors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendor),
    });
    if (res.ok) {
      router.push("/");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Vendor
      </Typography>
      {/* Changed to grid layout for better responsiveness */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ mt: 1, display: "grid", gap: 2 }}
      >
        <TextField
          required
          label="Name"
          name="name"
          value={vendor.name}
          onChange={handleChange}
          error={!!validationErrors.name}
          helperText={validationErrors.name}
        />
        <TextField
          required
          label="Contact"
          name="contact"
          value={vendor.contact}
          onChange={handleChange}
        />
        <TextField
          required
          label="Email"
          name="email"
          type="email"
          value={vendor.email}
          onChange={handleChange}
          error={!!validationErrors.email}
          helperText={validationErrors.email}
        />
        <TextField
          required
          label="Phone"
          name="phone"
          value={vendor.phone}
          onChange={handleChange}
          error={!!validationErrors.phone}
          helperText={validationErrors.phone}
        />
        <TextField
          required
          label="Address"
          name="address"
          value={vendor.address}
          onChange={handleChange}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
        >
          Update Vendor
        </Button>
        {/* Added cancel button to return back to home page */}
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          sx={{ mt: 1 }}
          onClick={() => router.push("/")}
        >
          Cancel
        </Button>
      </Box>
    </Container>
  );
}
