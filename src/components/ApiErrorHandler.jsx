import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTimes, FaInfoCircle } from 'react-icons/fa';
import '../css/ApiErrorHandler.css';

const ApiErrorHandler = () => {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const handleApiError = (event) => {
      const errorData = event.detail;
      const errorId = Date.now();
      
      setErrors(prev => [...prev, { 
        id: errorId, 
        message: errorData.message,
        status: errorData.status,
        timestamp: new Date().toLocaleTimeString()
      }]);
      

      setTimeout(() => {
        setErrors(prev => prev.filter(err => err.id !== errorId));
      }, 10000);
    };

    window.addEventListener('apiError', handleApiError);
    
    return () => {
      window.removeEventListener('apiError', handleApiError);
    };
  }, []);

  const removeError = (id) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearAll = () => {
    setErrors([]);
  };

  const getErrorColor = (status) => {
    if (!status) return '#e53e3e';
    
    if (status >= 500) return '#d69e2e'; 
    if (status >= 400) return '#e53e3e'; 
    return '#3182ce'; 
  };

  if (errors.length === 0) return null;

  return (
    <div className="api-errors-container">
      <div className="api-errors-header">
        <span>API Errors ({errors.length})</span>
        <button className="btn-clear-all" onClick={clearAll}>
          Clear all
        </button>
      </div>
      <div className="api-errors-list">
        {errors.map((error) => (
          <div 
            key={error.id} 
            className="api-error"
            style={{ borderLeftColor: getErrorColor(error.status) }}
          >
            <div className="api-error-content">
              <FaExclamationTriangle 
                className="api-error-icon" 
                style={{ color: getErrorColor(error.status) }}
              />
              <div className="api-error-details">
                <span className="api-error-message">{error.message}</span>
                {error.status && (
                  <div className="api-error-meta">
                    <span className="api-error-status">Status: {error.status}</span>
                    <span className="api-error-time">{error.timestamp}</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              className="api-error-close"
              onClick={() => removeError(error.id)}
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


export const dispatchApiError = (errorData) => {
  const event = new CustomEvent('apiError', {
    detail: {
      message: errorData.message || 'An API error occurred',
      status: errorData.status,
      error: errorData.error,
      timestamp: new Date().toISOString()
    }
  });
  window.dispatchEvent(event);
};

export default ApiErrorHandler;