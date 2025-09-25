import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaReceipt, FaShoppingBag, FaCalendarAlt, FaTag, FaRubleSign, FaTimes } from "react-icons/fa";
import "../css/Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(savedOrders);
  }, []);

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setEditedItems([...order.items]); 
    setIsModalOpen(true);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm("Вы уверены, что хотите удалить этот заказ?")) {
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem("orders", JSON.stringify(updatedOrders));
    }
  };

  const handlePayOrder = (orderId) => {
    alert(`Оплата заказа #${orderId}`);
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
      alert("Заказ должен содержать хотя бы один товар");
      return;
    }
    
    setEditedItems(prevItems => prevItems.filter(item => item.itemId !== itemId));
  };

  const calculateOrderAmount = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSaveOrder = () => {
    if (editedItems.length === 0) {
      alert("Заказ должен содержать хотя бы один товар");
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
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    
    setIsModalOpen(false);
    setEditingOrder(null);
    setEditedItems([]);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    setEditedItems([]);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "NEW": { class: "status-new", text: "Новый" },
      "PAID": { class: "status-paid", text: "Оплачен" },
      "PROCESSING": { class: "status-processing", text: "В обработке" },
      "COMPLETED": { class: "status-completed", text: "Завершен" },
      "CANCELLED": { class: "status-cancelled", text: "Отменен" }
    };
    
    const config = statusConfig[status] || { class: "status-default", text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
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
        <h1><FaShoppingBag className="me-2" />Мои заказы</h1>
        <p className="orders-subtitle">История ваших покупок</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <FaReceipt size={64} className="empty-icon" />
          <h3>Заказов пока нет</h3>
          <p>Совершите первую покупку, чтобы увидеть здесь свои заказы</p>
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
                  <h3 className="order-number">Заказ #{order.id}</h3>
                  <div className="order-meta">
                    <span className="order-date">
                      <FaCalendarAlt className="me-1" />
                      {formatDate(order.createdAt)}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                <div className="order-amount">
                  <span className="amount">{order.amount.toFixed(2)}</span>
                  <FaRubleSign className="currency" />
                </div>
              </div>

              <div className="order-items">
                <h4>Товары ({order.items.length}):</h4>
                <div className="items-list">
                  {order.items.map((item) => (
                    <div key={item.itemId} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-total">{(item.price * item.quantity).toFixed(2)} ₽</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-footer">
                <div className="order-actions">
                  {order.status === "NEW" && (
                    <button 
                      className="btn btn-pay"
                      onClick={() => handlePayOrder(order.id)}
                    >
                      Оплатить
                    </button>
                  )}
                  <button 
                    className="btn btn-edit"
                    onClick={() => handleEditOrder(order)}
                    title="Редактировать заказ"
                  >
                    <FaEdit size={16} />
                  </button>
                  <button 
                    className="btn btn-delete"
                    onClick={() => handleDeleteOrder(order.id)}
                    title="Удалить заказ"
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
        <h3>Редактирование заказа #{editingOrder.id}</h3>
        {/* Убрали кнопку закрытия */}
      </div>

      <div className="modal-body">
        <div className="edit-order-info">
          <div className="info-row">
            <span className="info-label">Дата создания:</span>
            <span>{formatDate(editingOrder.createdAt)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Статус:</span>
            {getStatusBadge(editingOrder.status)}
          </div>
        </div>

        <div className="edit-items-section">
          <h4>Товары в заказе:</h4>
          <div className="edit-items-list">
            {editedItems.map((item) => (
              <div key={item.itemId} className="edit-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">{item.price.toFixed(2)} ₽/шт</span>
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
                    {(item.price * item.quantity).toFixed(2)} ₽
                  </span>
                  
                  <button
                    className="btn btn-remove-item"
                    onClick={() => handleRemoveItem(item.itemId)}
                    title="Удалить товар"
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
            <span>Итого:</span>
            <span className="total-amount">
              {calculateOrderAmount(editedItems).toFixed(2)} ₽
            </span>
          </div>
          <div className="summary-row">
            <span>Изменение:</span>
            <span className={`amount-change ${calculateOrderAmount(editedItems) > editingOrder.amount ? 'positive' : calculateOrderAmount(editedItems) < editingOrder.amount ? 'negative' : ''}`}>
              {calculateOrderAmount(editedItems) - editingOrder.amount > 0 ? '+' : ''}
              {(calculateOrderAmount(editedItems) - editingOrder.amount).toFixed(2)} ₽
            </span>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="btn btn-cancel" onClick={handleCancelEdit}>
          Отмена
        </button>
        <button className="btn btn-save" onClick={handleSaveOrder}>
          Сохранить изменения
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}