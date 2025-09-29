import { useState, useEffect, useContext } from "react";
import api from "../api";
import { CartContext } from "../context/CartContext";
import "../css/Items.css";

export default function Items() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { addToCart } = useContext(CartContext);
  const [clickedId, setClickedId] = useState(null);

  const fetchItems = async (pageNumber = 0) => {
    try {
      const response = await api.get(`/items?page=${pageNumber}&size=6`);
      setItems(response.data.content);
      setPage(response.data.page);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      handleApiError(error, "Error fetching items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddToCart = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    addToCart(item);
    setClickedId(itemId);
    setTimeout(() => setClickedId(null), 300);
  };

  const handlePrevPage = () => {
    if (page > 0) fetchItems(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) fetchItems(page + 1);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Products</h2>

      <div className="row">
        {items.map((item) => (
          <div key={item.id} className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">${item.price.toFixed(2)}</p>
                <button
                  className={`btn-add-green mt-auto ${
                    clickedId === item.id ? "clicked" : ""
                  }`}
                  onClick={() => handleAddToCart(item.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      
      {totalPages > 1 && (
        <div className="pagination-container mt-4 d-flex justify-content-center align-items-center gap-3">
          <button
            className="btn btn-page"
            onClick={handlePrevPage}
            disabled={page === 0}
          >
            ⬅ Previous
          </button>

          <span className="page-indicator">
            Page {page + 1} of {totalPages}
          </span>

          <button
            className="btn btn-page"
            onClick={handleNextPage}
            disabled={page === totalPages - 1}
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
}
