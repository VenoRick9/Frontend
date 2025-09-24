import { useEffect, useState } from "react";
import api from "../api";
import { jwtDecode } from 'jwt-decode'; 
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enGB } from "date-fns/locale";

import "../css/Profile.css"; 

export default function Profile() {
  const [user, setUser] = useState(null);
  const [cardData, setCardData] = useState({
    number: "",
    holder: "",
    expirationDate: ""
  });

  let userId = null;
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.sub ;
    }
  } catch (err) {
    console.error("Invalid token", err);
  }

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    setCardData({
      ...cardData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    try {
      await api.post("/cards", { ...cardData, userId });
      setCardData({ number: "", holder: "", expirationDate: "" });
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to add card");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="container mt-4 profile-container">
      <div className="row justify-content-between">
        
        <div className="col-md-5 user-info">
          <h2>Profile</h2>
          <p><strong>Name:</strong> {user.name} {user.surname}</p>
          <p><strong>Birth Date:</strong> {user.birthDate}</p>
          <p><strong>Email:</strong> {user.email}</p>

          <h4 className="mt-4">Cards</h4>
          {user.cards.length === 0 ? (
            <p>No cards added.</p>
          ) : (
            <table className="table table-striped cards-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Holder</th>
                  <th>Expiration</th>
                </tr>
              </thead>
              <tbody>
                {user.cards.map(card => (
                  <tr key={card.id}>
                    <td>{card.number}</td>
                    <td>{card.holder}</td>
                    <td>{card.expirationDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

    
        <div className="col-md-5 card-form" >
          <h4>Add New Card</h4>
          <form onSubmit={handleAddCard}>
            <div className="mb-4">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                className="form-control input-field"
                name="number"
                value={cardData.number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Holder Name</label>
              <input
                type="text"
                className="form-control input-field"
                name="holder"
                value={cardData.holder}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3 text-start">
              <label className="form-label">Expiration Date</label>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                <DatePicker
                  value={cardData.expirationDate ? new Date(cardData.expirationDate) : null}
                  onChange={(date) =>
                    setCardData({
                      ...cardData,
                      expirationDate: date ? date.toISOString().split("T")[0] : "",
                    })
                  }
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: { fullWidth: true, required: true, className: "input-field" },
                  }}
                />
              </LocalizationProvider>
            </div>

            <button type="submit" className="btn btn-success btn-add-card">Add Card</button>
          </form>
        </div>
      </div>
    </div>
  );
}
