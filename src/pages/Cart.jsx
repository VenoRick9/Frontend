import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { FaPlus, FaMinus, FaTrash, FaShoppingCart } from "react-icons/fa";
import "../css/Cart.css";



export default function Cart() {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } =
    useContext(CartContext);

  const createOrder = () => {
    if (!cart || cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const newOrder = {
      id: Date.now(),
      items: cart.map((item) => ({
        itemId: item.id,
        name: item.name,
        price: item.price ?? 0,
        quantity: item.quantity,
      })),
      createdAt: new Date().toISOString(),
      status: "NEW",
      amount: cart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    };

    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    localStorage.setItem("orders", JSON.stringify([...existingOrders, newOrder]));

  
    clearCart();
    localStorage.setItem("cart", JSON.stringify([])); 
    
  };



  return (
    <div className="container mt-4 cart-container">
      <div className="cart-header">
        <h2><FaShoppingCart className="me-2" />Your Cart</h2>
        {cart.length > 0 && (
          <button className="btn btn-clear" onClick={clearCart}>
            Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <FaShoppingCart size={64} className="empty-cart-icon" />
          <h3>Your cart is empty</h3>
          <p>Add some items to get started</p>
        </div>
      ) : (
        <>
          <div className="cart-table-container">
            <table className="cart-table">
              <thead>
                <tr>
                  <th className="item-col">Item</th>
                  <th className="price-col">Price</th>
                  <th className="quantity-col">Quantity</th>
                  <th className="total-col">Total</th>
                  <th className="action-col"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="cart-item">
                    <td className="item-name">{item.name}</td>
                    <td className="item-price">${item.price.toFixed(2)}</td>
                    <td className="quantity-controls">
                      <div className="quantity-wrapper">
                        <button
                          className="btn btn-quantity btn-minus"
                          onClick={() => decreaseQuantity(item.id)}
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="quantity-display">
                          {item.quantity}
                        </span>
                        <button
                          className="btn btn-quantity btn-plus"
                          onClick={() => increaseQuantity(item.id)}
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="item-actions">
                      <button
                        className="btn btn-remove"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove item"
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-footer">
            <div className="total-section">
              <h3>
                Total: $
                {cart
                  .reduce((acc, item) => acc + item.price * item.quantity, 0)
                  .toFixed(2)}
              </h3>
              <p className="items-count">{cart.length} item(s) in cart</p>
            </div>
            <button className="btn btn-checkout" onClick={createOrder}>
              Create Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}
