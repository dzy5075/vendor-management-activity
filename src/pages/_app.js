import * as React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Revised to be more responsive between different deveices
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    fontSize: 14,
    h1: { fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.2 },
    h2: { fontWeight: 600, fontSize: "2rem", lineHeight: 1.3 },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f5f5f5",
          animation: "fadeIn 0.3s ease-in-out",
        },
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Rounded buttons
          textTransform: "none", // Disable uppercase text
          padding: "8px 16px",
        },
      },
    },
  },
});

export default function MyApp(props) {
  const { Component, pageProps } = props;

  return (
    <React.Fragment>
      <Head>
        <title>Vendor Management System</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta name="theme-color" content="#1976d2" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </React.Fragment>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
