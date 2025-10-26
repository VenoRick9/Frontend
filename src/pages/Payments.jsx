import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { 
  FaCreditCard, FaReceipt, FaCalendarAlt, FaMoneyCheckAlt, 
  FaSearch, FaExclamationTriangle, FaCheckCircle, FaClock, 
  FaFilter, FaTimes, FaUser, FaEnvelope, FaIdCard, FaBox 
} from 'react-icons/fa';
import api, { handleApiError } from '../api';
import '../css/Payments.css';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [userId, setUserId] = useState(null);
  

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalSpent, setTotalSpent] = useState(null);




  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.sub || decodedToken.userId);
      } else {
        setError('No access token found');
        setIsLoading(false);
      }
    } catch (error) {
      handleApiError(error, 'Error decoding token');
      setError('Invalid token');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchPayments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/payments?userId=${userId}`);
        setPayments(response.data);
        setFilteredPayments(response.data);
      } catch (error) {
        handleApiError(error, 'Error fetching payments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [userId]);

  const viewDetails = async (payment) => {
    setSelectedPayment(payment);
    setIsLoadingDetails(true);
    setIsModalOpen(true);
    
    try {
      const orderResponse = await api.get(`/orders/${payment.orderId}`);
      setOrderDetails(orderResponse.data);
      
      const paymentResponse = await api.get(`/payments?orderId=${payment.orderId}`);
      setPaymentDetails(paymentResponse.data[0]); 
    } catch (error) {
      handleApiError(error, 'Error fetching payment details');
      setError('Failed to load details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    setOrderDetails(null);
    setPaymentDetails(null);
  };

  useEffect(() => {
    let result = payments;

    if (searchTerm) {
      result = result.filter(payment => 
        payment.orderId.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(result);
  }, [payments, searchTerm, statusFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <FaCheckCircle className="status-icon success" />;
      case 'FAILED': return <FaExclamationTriangle className="status-icon failed" />;
      default: return <FaClock className="status-icon pending" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'SUCCESS': return 'Completed';
      case 'FAILED': return 'Failed';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const fetchTotalSpent = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    try {
      const response = await api.get(`/payments?start=${startDate}&end=${endDate}`);
      setTotalSpent(response.data);
    } catch (error) {
      handleApiError(error, 'Error fetching total spent');
      setTotalSpent(null);
    }
  };

  if (isLoading) {
    return (
      <div className="payments-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payments-container">
        <div className="error-state">
          <FaExclamationTriangle size={64} className="error-icon" />
          <h3>Error Loading Payments</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  } 

  return (
    <div className="payments-container">
      <div className="payments-header">
        <div className="header-content">
          <h1><FaMoneyCheckAlt className="header-icon" />Payment History</h1>
          <p className="subtitle">View and manage your payment transactions</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{payments.length}</span>
            <span className="stat-label">Total Payments</span>
          </div>
        </div>
      </div>

      
      
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      
      <div className="date-filter-section">
        <FaCalendarAlt className="filter-icon" />
        <label>From:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="date-input"
        />
        <label>To:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="date-input"
        />
        <button className="btn btn-green" onClick={fetchTotalSpent}>
          Show Total
        </button>

        {totalSpent !== null && (
          <div className="total-spent">
            <strong>Total Spent:</strong>{" "}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(totalSpent)}
          </div>
        )}
      </div>

      
      <div className="payments-content">
        {filteredPayments.length === 0 ? (
          <div className="empty-state">
            <FaReceipt size={64} className="empty-icon" />
            <h3>No payments found</h3>
            <p>
              {payments.length === 0 
                ? "You haven't made any payments yet." 
                : "No payments match your current filters."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="payments-grid">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="payment-card">
                  <div className="payment-header">
                    <div className="payment-info">
                      <h3 className="order-id">Order #{payment.orderId}</h3>
                      <div className="payment-meta">
                        <span className="payment-date">
                          <FaCalendarAlt className="date-icon" />
                          {formatDate(payment.timestamp)}
                        </span>
                        <div className={`status-badge ${payment.status.toLowerCase()}`}>
                          {getStatusIcon(payment.status)}
                          {getStatusText(payment.status)}
                        </div>
                      </div>
                    </div>
                    <div className="payment-amount">
                      {formatAmount(payment.paymentAmount)}
                    </div>
                  </div>

                  <div className="payment-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => viewDetails(payment)}
                    >
                      <FaReceipt className="btn-icon" />
                      View Details
                    </button>
                    
                  </div>
                </div>
              ))}
            </div>

            <div className="payments-summary">
              <p>Showing {filteredPayments.length} of {payments.length} payments</p>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FaReceipt className="modal-icon" />
                Payment Details - Order #{selectedPayment?.orderId}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {isLoadingDetails ? (
                <div className="modal-loading">
                  <div className="spinner"></div>
                  <p>Loading details...</p>
                </div>
              ) : (
                <>
  
                  <section className="details-section">
                    <h3><FaMoneyCheckAlt className="section-icon" />Payment Information</h3>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Payment ID:</span>
                        <span className="detail-value">{paymentDetails?.id}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className={`detail-value status-${paymentDetails?.status.toLowerCase()}`}>
                          {getStatusIcon(paymentDetails?.status)}
                          {getStatusText(paymentDetails?.status)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Amount:</span>
                        <span className="detail-value amount">{formatAmount(paymentDetails?.paymentAmount)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Date & Time:</span>
                        <span className="detail-value">{formatDate(paymentDetails?.timestamp)}</span>
                      </div>
                    </div>
                  </section>

 
                  <section className="details-section">
                    <h3><FaBox className="section-icon" />Order Information</h3>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Order ID:</span>
                        <span className="detail-value">{orderDetails?.id}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Order Status:</span>
                        <span className={`detail-value status-${orderDetails?.status.toLowerCase()}`}>
                          {getStatusIcon(orderDetails?.status)}
                          {orderDetails?.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Creation Date:</span>
                        <span className="detail-value">{formatDate(orderDetails?.creationDate)}</span>
                      </div>
                    </div>
                  </section>
                  
                  <section className="details-section">
                    <h3><FaUser className="section-icon" />User Information</h3>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{orderDetails?.user?.name} {orderDetails?.user?.surname}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">
                          
                          {orderDetails?.user?.email}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Birth Date:</span>
                        <span className="detail-value">{orderDetails?.user?.birthDate}</span>
                      </div>
                    </div>
                  </section>

                          <section className="details-section">
                    <h3><FaBox className="section-icon" />Order Items ({orderDetails?.orderItems?.length || 0})</h3>
                    <div className="order-items-list">
                      {orderDetails?.orderItems?.map((item) => (
                        <div key={item.id} className="order-item">
                          <div className="item-info-view">
                            <span className="item-name">{item.itemName}</span>
                            <span className="item-price">{formatAmount(item.itemPrice)} each</span>
                          </div>
                          <div className="item-quantity">Quantity: {item.quantity}</div>
                          <div className="item-total">{formatAmount(item.itemPrice * item.quantity)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="order-total">
                      <span>Total Amount:</span>
                      <span className="total-amount">
                        {formatAmount(orderDetails?.orderItems?.reduce((sum, item) => sum + (item.itemPrice * item.quantity), 0) || 0)}
                      </span>
                    </div>
                  </section>

            
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}