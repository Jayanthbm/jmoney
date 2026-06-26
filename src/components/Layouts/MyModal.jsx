// src/components/Layouts/MyModal.jsx

import { AnimatePresence, motion } from "framer-motion";

import { MdClose } from "react-icons/md";
import React from "react";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const MyModal = ({ showModal, onClose, children }) => {
  return (
    <AnimatePresence mode="wait">
      {showModal && (
        <motion.div
          className="custom-modal-overlay"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="custom-modal-content"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
            transition={{ duration: 0.2 }}
          >
            <button className="custom-modal-close" onClick={onClose}>
              <MdClose />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MyModal;
