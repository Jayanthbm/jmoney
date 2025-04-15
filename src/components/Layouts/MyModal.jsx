import React from "react";
import { MdClose } from "react-icons/md";

const MyModal = ({ showModal, modalFadeOut = false, onClose, children }) => {
  return (
    <>
      {showModal && (
        <div
          className={`custom-modal-overlay ${modalFadeOut ? "fade-out" : ""}`}
        >
          <div className="custom-modal-content">
            <button className="custom-modal-close" onClick={onClose}>
              <MdClose />
            </button>
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default MyModal;
