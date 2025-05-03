import Button from "../Button/Button";
import { FiDownload } from "react-icons/fi";
import MyModal from "../Layouts/MyModal";
import React from "react";
import { useMediaQuery } from "react-responsive";

const PwaBanner = ({
  showInstallPrompt,
  showIosInstallGuide,
  handleInstallClick,
  onClose,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isMacSafari =
    typeof navigator !== "undefined" &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
    /mac/i.test(navigator.userAgent);

  const Content = ({ modal = false }) => {
    return (
      <>
        Install this app for a better experience {modal && <br />}
        {showIosInstallGuide && isMacSafari
          ? `To install this app, tap Share and choose "Add to Home Screen" in Safari.`
          : null}
        {showInstallPrompt && (
          <div style={{ marginTop: modal ? "10px" : 0 }}>
            <Button
              variant="info"
              onClick={handleInstallClick}
              text="Install"
              icon={<FiDownload />}
            />
          </div>
        )}
      </>
    );
  };
  return (
    <>
      {isMobile ? (
        <>
          <MyModal
            showModal={showInstallPrompt || showIosInstallGuide}
            onClose={onClose}
          >
            <Content modal={true} />
          </MyModal>
        </>
      ) : (
        <>
          {(showInstallPrompt || showIosInstallGuide) && (
            <div className="pwa-install-banner">
              <Content />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default PwaBanner;
