// src/components/Layouts/InlineLoader.jsx
import React from "react";
import "./InlineLoader.css";

const InlineLoader = ({ text = "Loading transactions..." }) => (
  <div className="inline-loader">
    <div className="spinner" />
    <span className="loader-text">{text}</span>
  </div>
);

export default InlineLoader;
