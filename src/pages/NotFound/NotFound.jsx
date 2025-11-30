import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaGhost } from "react-icons/fa";

const NotFound = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        textAlign: "center",
        color: "var(--text-color, #333)",
      }}
    >
      <FaGhost size={80} color="var(--primary-color, #007bff)" />
      <h1 style={{ fontSize: "4rem", margin: "20px 0 10px" }}>404</h1>
      <h2 style={{ marginBottom: "20px" }}>Page Not Found</h2>
      <p style={{ maxWidth: "400px", marginBottom: "30px", opacity: 0.8 }}>
        Oops! The page you are looking for does not exist. It might have been
        moved or deleted.
      </p>
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          backgroundColor: "var(--primary-color, #007bff)",
          color: "white",
          textDecoration: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          transition: "transform 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <FaHome />
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
