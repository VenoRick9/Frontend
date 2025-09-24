import { useState, useEffect, useContext } from "react";
import api from "../api";
import { CartContext } from "../context/CartContext";
import "../css/Items.css";


export default function Items() {
  const [items, setItems] = useState([]);
  const { addToCart } = useContext(CartContext);

    const [clickedId, setClickedId] = useState(null);

  const handleAddToCart = (itemId) => {
    const item = items.find(i => i.id === itemId);
    addToCart(item);
    setClickedId(itemId);
    setTimeout(() => setClickedId(null), 300);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("/items");
        setItems(response.data.content);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Products</h2>
      <div className="row">
        {items.map((item) => (
          <div key={item.id} className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">${item.price.toFixed(2)}</p>
                <button
                    className={`btn-add-green mt-auto ${clickedId === item.id ? "clicked" : ""}`}
                    onClick={() => handleAddToCart(item.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
