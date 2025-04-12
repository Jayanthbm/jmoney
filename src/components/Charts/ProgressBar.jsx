// src/components/Charts/ProgressBar.jsx

import React, { useRef, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import "./ProgressBar.css";

const ProgressBar = ({ value = 0, color = "#3ecf8e" }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true });
  const fillRef = useRef(null);

  useEffect(() => {
    if (inView && !hasAnimated && fillRef.current) {
      const width = `${Math.min(value, 100)}%`;
      fillRef.current.style.width = width;
      fillRef.current.classList.add("animate");
      setHasAnimated(true);
    }
  }, [inView, hasAnimated, value]);

  return (
    <div className="progress-bar-container" ref={ref}>
      <div
        className="progress-bar-fill"
        ref={fillRef}
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default ProgressBar;
