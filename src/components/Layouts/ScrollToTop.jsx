import React, { useEffect, useRef, useState } from "react";

import { MdArrowUpward } from "react-icons/md";

const ScrollToTop = ({ scrollContainerSelector = ".content" }) => {
   const [visible, setVisible] = useState(false);
   const scrollContainerRef = useRef(null);

   useEffect(() => {
      const container = document.querySelector(scrollContainerSelector);
      if (!container) return;

      scrollContainerRef.current = container;

      const handleScroll = () => {
         setVisible(container.scrollTop > 350);
      };

      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
   }, [scrollContainerSelector]);

   const scrollToTop = () => {
      if (scrollContainerRef.current) {
         scrollContainerRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
         });
      }
   };

   return (
      <div
         onClick={scrollToTop}
         title="Scroll to Top"
         style={{
            position: "fixed",
            bottom: "70px",
            right: "10px",
            cursor: "pointer",
            zIndex: 1000,
            display: visible ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--primary-color, #2684ff)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            color: "white",
            transition: "opacity 0.3s",
         }}
      >
         <MdArrowUpward size={24} />
      </div>
   );
};

export default ScrollToTop;
