import { Component } from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';
import '../css/ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>
            
            <h1>Something went wrong</h1>
            <p>We apologize for the inconvenience. Please try refreshing the page or go back home.</p>
            
            <div className="error-details">
              <details>
                <summary>Error Details</summary>
                <div className="error-stack">
                  <strong>{this.state.error && this.state.error.toString()}</strong>
                  <br />
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            </div>

            <div className="error-actions">
              <button 
                className="btn-error btn-primary"
                onClick={this.handleRetry}
              >
                <FaRedo className="btn-icon" />
                Try Again
              </button>
              
              <button 
                className="btn-error btn-secondary"
                onClick={this.handleGoHome}
              >
                <FaHome className="btn-icon" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;