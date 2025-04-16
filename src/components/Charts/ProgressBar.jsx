// src/components/Charts/ProgressBar.jsx

import React, { useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import "./ProgressBar.css";

const ProgressBar = ({ value = 0, color = "#3ecf8e", height = "10px" }) => {
  const fillRef = useRef(null);
  const { ref, inView } = useInView(); // removed triggerOnce

  useEffect(() => {
    if (inView && fillRef.current) {
      const width = `${Math.min(value, 100)}%`;
      fillRef.current.style.width = width;
      fillRef.current.classList.add("animate");
    }
  }, [inView, value]);

  useEffect(() => {
    // Reset when not in view
    if (fillRef.current && !inView) {
      fillRef.current.style.width = "0%";
      fillRef.current.classList.remove("animate");
    }
  }, [inView]);

  return (
    <div className="progress-bar-container" ref={ref} style={{ height }}>
      <div
        className="progress-bar-fill"
        ref={fillRef}
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default ProgressBar;
