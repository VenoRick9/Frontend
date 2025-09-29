import { useEffect, useState } from "react";
import api from "../api";
import { jwtDecode } from "jwt-decode";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enGB } from "date-fns/locale";
import { FaTrash, FaCreditCard } from "react-icons/fa";
import "../css/Profile.css";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [cardData, setCardData] = useState({
        number: "",
        holder: "",
        expirationDate: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateData, setUpdateData] = useState({
        name: "",
        surname: "",
        email: "",
        birthDate: ""
    });

    let userId = null;
    try {
        const token = localStorage.getItem("accessToken");
        if (token) {
            const decodedToken = jwtDecode(token);
            userId = decodedToken.sub;
        }
    } catch (err) {
        handleApiError(error, "Invalid token");
    }

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const response = await api.get(`/users/${userId}`);
                setUser(response.data);
                setUpdateData({
                    name: response.data.name || "",
                    surname: response.data.surname || "",
                    email: response.data.email || "",
                    birthDate: response.data.birthDate || ""
                });
            } catch (err) {
                handleApiError(error, "Error fetching user");
            }
        };

        fetchUser();
    }, [userId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
        });
    };

    const handleChange = (e) => {
        let value = e.target.value;
        if (e.target.name === "number") {
            value = value.replace(/\D/g, "");
            value = value.replace(/(\d{4})/g, "$1 ").trim();
            value = value.substring(0, 19);
        }
        setCardData({
            ...cardData,
            [e.target.name]: value,
        });
    };

    const handleAddCard = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const cardDataToSend = {
                ...cardData,
                number: cardData.number.replace(/\s/g, "")
            };
            await api.post("/cards", cardDataToSend);
            setCardData({ number: "", holder: "", expirationDate: "" });
            const response = await api.get(`/users/${userId}`);
            setUser(response.data);
        } catch (err) {
            handleApiError(error, "Error adding card");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm("Are you sure you want to delete this card?")) {
            return;
        }

        try {
            await api.delete(`/cards/${cardId}`);
            const response = await api.get(`/users/${userId}`);
            setUser(response.data);
        } catch (err) {
            handleApiError(error, "Error deleting card");
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account?")) {
            return;
        }

        try {
            await api.delete(`/users/${userId}`);
            localStorage.clear();
            window.location.href = "/login";
        } catch (err) {
            handleApiError(error, "Error deleting account");
        }
    };

    const handleUpdateProfile = async () => {
        try {
            await api.patch(`/users/${userId}`, updateData);
            const response = await api.get(`/users/${userId}`);
            setUser(response.data);
            setIsModalOpen(false);
        } catch (err) {
            handleApiError(error, "Error updating profile");

        }
    };

    const formatCardNumber = (number) => {
        return number.replace(/(\d{4})/g, '$1 ').trim();
    };

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    if (!user) return <div className="loading">Loading...</div>;

    return (
        <div className="container mt-4 profile-container">
            <div className="row justify-content-between">
                <div className="col-md-5 user-info">
                    <h2><FaCreditCard className="me-2"/>Profile</h2>
                    <div className="user-details">
                        <p><strong>Name:</strong> {user.name} {user.surname}</p>
                        <p><strong>Birth Date:</strong> {formatDate(user.birthDate)}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                    </div>

                    <h4 className="mt-2">My Cards</h4>

                    {user.cards && user.cards.length === 0 ? (
                        <div className="no-cards">
                            <p>No cards added.</p>
                        </div>
                    ) : (
                        <div className="cards-container">
                            <div className="cards-list">
                                {user.cards && user.cards.map(card => (
                                    <div key={card.id} className="card-item">
                                        <div className="card-info">
                                            <div className="card-number">
                                                {formatCardNumber(card.number)}
                                            </div>
                                            <div className="card-details">
                                                <span className="card-holder">{card.holder}</span>
                                                <span className="card-expiry">
                                                    {formatDateForDisplay(card.expirationDate)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className="btn-delete-card"
                                            onClick={() => handleDeleteCard(card.id)}
                                            title="Delete card"
                                        >
                                            <FaTrash/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-md-5 card-form">
                    <h4>Add New Card</h4>
                    <form onSubmit={handleAddCard}>
                        <div className="mb-3">
                            <label className="form-label">Card Number</label>
                            <input
                                type="text"
                                className="form-control input-field"
                                name="number"
                                placeholder="1234 5678 9012 3456"
                                value={cardData.number}
                                onChange={handleChange}
                                maxLength={19}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Holder Name</label>
                            <input
                                type="text"
                                className="form-control input-field"
                                name="holder"
                                placeholder="JOHN DOE"
                                value={cardData.holder}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
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
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            className: "input-field",
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-add-card"
                            disabled={isLoading}
                        >
                            {isLoading ? "Adding..." : "Add Card"}
                        </button>
                    </form>
                </div>
            </div>

            
            <div className="d-flex justify-content-center mt-4 gap-3">
                <button className="btn btn-success" onClick={() => setIsModalOpen(true)}>
                    Update Profile
                </button>
                <button className="btn btn-danger" onClick={handleDeleteAccount}>
                    <FaTrash /> Delete Account
                </button>
            </div>

            
            {isModalOpen && (
                <div className="modal-backdrop-profile">
                    <div className="modal-content-profile">
                        <h4>Update Profile</h4>
                        <div className="mt-2">
                            <label>Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={updateData.name}
                                onChange={(e) => setUpdateData({...updateData, name: e.target.value})}
                            />
                        </div>

                        <div className="mt-2">
                            <label>Surname</label>
                            <input
                                type="text"
                                className="form-control"
                                value={updateData.surname}
                                onChange={(e) => setUpdateData({...updateData, surname: e.target.value})}
                            />
                        </div>

                        <div className="mt-2">
                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={updateData.email}
                                onChange={(e) => setUpdateData({...updateData, email: e.target.value})}
                            />
                        </div>

                        <div className="mt-2">
                            <label>Birth Date</label>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                                <DatePicker
                                    value={updateData.birthDate ? new Date(updateData.birthDate) : null}
                                    onChange={(date) =>
                                        setUpdateData({
                                            ...updateData,
                                            birthDate: date ? date.toISOString().split("T")[0] : "",
                                        })
                                    }
                                    format="dd/MM/yyyy"
                                    slotProps={{
                                        textField: { fullWidth: true },
                                    }}
                                />
                            </LocalizationProvider>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-success" onClick={handleUpdateProfile}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
