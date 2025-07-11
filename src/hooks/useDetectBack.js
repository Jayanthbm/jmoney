import { useEffect } from "react";

export default function useDetectBack(shouldBlock, onBack) {
  useEffect(() => {
    if (!shouldBlock) return;

    let blocked = false;

    // Push dummy state once when entering transactions
    window.history.pushState({ dummy: true }, "", window.location.href);

    const handlePopState = (e) => {
      if (blocked) return; // prevent multiple triggers
      blocked = true;

      onBack(); // switch to summary
      // IMPORTANT: do NOT push dummy state again
      // so user can now navigate back normally
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // Clean up: go back one step if we're still on dummy state
      if (blocked === false) {
        window.history.back();
      }
    };
  }, [shouldBlock, onBack]);
}
