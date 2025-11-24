import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#f8f9fa",
            color: "#333",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <FaExclamationTriangle size={64} color="#dc3545" />
          <h1 style={{ marginTop: "20px", fontSize: "2rem" }}>
            Something went wrong.
          </h1>
          <p style={{ maxWidth: "500px", margin: "10px 0 20px" }}>
            We're sorry, but an unexpected error has occurred. Please try
            reloading the page.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Reload Page
          </button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details
              style={{
                whiteSpace: "pre-wrap",
                marginTop: "20px",
                textAlign: "left",
              }}
            >
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
