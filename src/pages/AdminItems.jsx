import { useState, useEffect } from "react";
import api from "../api";
import "../css/AdminItems.css";

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", price: "" });

  
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  
  const fetchItems = async (pageNumber = 0) => {
    try {
      const response = await api.get(`/items?page=${pageNumber}&size=6`);
      setItems(response.data.content);
      setPage(response.data.page);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, price: item.price });
    } else {
      setEditingItem(null);
      setFormData({ name: "", price: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleSave = async () => {
    try {
      if (!formData.name.trim() || !formData.price) {
        alert("Please fill in all fields");
        return;
      }

      if (editingItem) {
        await api.patch(`/items/${editingItem.id}`, formData);
      } else {
        await api.post("/items", formData);
      }

      
      fetchItems(page);
      closeModal();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item");
    }
  };

  
  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/items/${itemId}`);
      fetchItems(page);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  
  const handlePrevPage = () => {
    if (page > 0) fetchItems(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) fetchItems(page + 1);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Admin — Products</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Add New Item
        </button>
      </div>

      <div className="row">
        {items.map((item) => (
          <div key={item.id} className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">${item.price.toFixed(2)}</p>

                <div className="mt-auto d-flex gap-2">
                  <button
                    className="btn btn-warning w-50"
                    onClick={() => openModal(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger w-50"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-muted text-center">No items available</p>
        )}
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


      
      {isModalOpen && (
        <div className="modal-overlay-item">
          <div className="modal-content-item">
            <h4>{editingItem ? "Edit Item" : "Add New Item"}</h4>

            <div className="form-group mt-3">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter item name"
              />
            </div>

            <div className="form-group mt-3">
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
              />
            </div>

            <div className="mt-4 d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
