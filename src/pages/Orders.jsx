import api from "../api";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaReceipt, FaShoppingBag, FaCalendarAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import "../css/Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  let userId = null;
  try {
  const token = localStorage.getItem("accessToken");
  if (token) {
    const decodedToken = jwtDecode(token);
    userId = decodedToken.sub;
  }
  } catch (err) {
    handleApiError(err, "Invalid token");
  }

  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
      setOrders(savedOrders);
    } catch (err) {
      handleApiError(err, "Error loading orders from storage");
    }
  }, []);

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setEditedItems([...order.items]); 
    setIsModalOpen(true);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      try {
        localStorage.setItem("orders", JSON.stringify(updatedOrders));
      } catch (err) {
        handleApiError(err, "Error saving orders to storage");
      }
    }
  };

  const handlePayOrder = async (orderId) => {
    try {
      const userResponse = await api.get(`/users/${userId}`);
      if (userResponse.data.cards && userResponse.data.cards.length > 0) {
        const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
        const orderToPay = savedOrders.find((order) => order.id === orderId);

        const requestBody = {
          orderItems: orderToPay.items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity.toString(),
          })),
        };

        await api.post("/orders", requestBody);

        const updatedOrders = savedOrders.filter((order) => order.id !== orderId);
        try {
          localStorage.setItem("orders", JSON.stringify(updatedOrders));
        } catch (err) {
          handleApiError(err, "Error updating orders in storage");
        }
        setOrders(updatedOrders);
      } else {
        alert("The user must have at least one card");
      }
    } catch (error) {
      handleApiError(error, "Error creating order");
    }
  };

  const handleItemQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setEditedItems(prevItems => 
      prevItems.map(item => 
        item.itemId === itemId 
          ? { ...item, quantity: parseInt(newQuantity) }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    if (editedItems.length <= 1) {
      alert("The order must contain at least one item");
      return;
    }
    
    setEditedItems(prevItems => prevItems.filter(item => item.itemId !== itemId));
  };

  const calculateOrderAmount = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSaveOrder = () => {
    if (editedItems.length === 0) {
      alert("The order must contain at least one item");
      return;
    }

    const updatedOrder = {
      ...editingOrder,
      items: editedItems,
      amount: calculateOrderAmount(editedItems)
    };

    const updatedOrders = orders.map(order => 
      order.id === editingOrder.id ? updatedOrder : order
    );

    setOrders(updatedOrders);
    try {
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
    } catch (err) {
      handleApiError(err, "Error saving order changes");
    }
    
    setIsModalOpen(false);
    setEditingOrder(null);
    setEditedItems([]);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    setEditedItems([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getCardHeight = (itemsCount) => {
    const baseHeight = 200;
    const itemHeight = 50;
    return baseHeight + (itemsCount * itemHeight);
  };

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1><FaShoppingBag className="me-2" />My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <FaReceipt size={64} className="empty-icon" />
          <h3>No orders yet</h3>order
          <p>Make your first purchase to see your orders here</p>
        </div>
      ) : (
        <div className="orders-column">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="order-card"
              style={{ 
                minHeight: `${getCardHeight(order.items.length)}px`,
                height: 'auto' 
              }}
            >
              <div className="order-header">
                <div className="order-info">
                  <h3 className="order-number">Order #{order.id}</h3>
                  <div className="order-meta">
                    <span className="order-date">
                      <FaCalendarAlt className="me-1" />
                      {formatDate(order.createdAt)}
                    </span>
                    
                  </div>
                </div>
                <div className="order-amount">
                  <span className="amount">{order.amount.toFixed(2)}$</span>
                </div>
              </div>

              <div className="order-items">
                <h4>Items ({order.items.length}):</h4>
                <div className="items-list">
                  {order.items.map((item) => (
                    <div key={item.itemId} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-total">{(item.price * item.quantity).toFixed(2)} $</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-footer">
                <div className="order-actions">
                  {order.status === "NEW" && (
                    <button 
                      className="btn-pay"
                      onClick={() => handlePayOrder(order.id)}
                    >
                      Pay
                    </button>
                  )}
                  <button 
                    className="btn btn-edit"
                    onClick={() => handleEditOrder(order)}
                    title="Edit order"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button 
                    className="btn btn-delete"
                    onClick={() => handleDeleteOrder(order.id)}
                    title="Delete order"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editing Order #{editingOrder.id}</h3>
            </div>

            <div className="modal-body">
              <div className="edit-order-info">
                <div className="info-row">
                  <span className="info-label">Created at:</span>
                  <span>{formatDate(editingOrder.createdAt)}</span>
                </div>
                <div className="info-row">
                  
                </div>
              </div>

              <div className="edit-items-section">
                <h4>Order Items:</h4>
                <div className="edit-items-list">
                  {editedItems.map((item) => (
                    <div key={item.itemId} className="edit-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">{item.price.toFixed(2)} $/unit</span>
                      </div>
                      
                      <div className="item-controls">
                        <div className="quantity-controls">
                          <button
                            className="btn btn-quantity btn-minus"
                            onClick={() => handleItemQuantityChange(item.itemId, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="quantity-display">
                            {item.quantity}
                          </span>
                          <button
                            className="btn btn-quantity btn-plus"
                            onClick={() => handleItemQuantityChange(item.itemId, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        
                        <span className="item-total">
                          {(item.price * item.quantity).toFixed(2)} $
                        </span>
                        
                        <button
                          className="btn btn-remove-item"
                          onClick={() => handleRemoveItem(item.itemId)}
                          title="Remove item"
                          disabled={editedItems.length <= 1}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-summary">
                <div className="summary-row">
                  <span>Total:</span>
                  <span className="total-amount-order">
                    {calculateOrderAmount(editedItems).toFixed(2)} $
                  </span>
                </div>
                <div className="summary-row">
                  <span>Change:</span>
                  <span className={`amount-change ${calculateOrderAmount(editedItems) > editingOrder.amount ? 'positive' : calculateOrderAmount(editedItems) < editingOrder.amount ? 'negative' : ''}`}>
                    {calculateOrderAmount(editedItems) - editingOrder.amount > 0 ? '+' : ''}
                    {(calculateOrderAmount(editedItems) - editingOrder.amount).toFixed(2)} $
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className="btn btn-save" onClick={handleSaveOrder}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


