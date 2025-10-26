import { useState } from "react";
import { Link } from "react-router-dom";
import api, { handleApiError } from "../api";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enGB } from "date-fns/locale";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    birthDate: "",
    email: "",
    login: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (!formData.login || !formData.password) {
      alert("Please fill in all fields");
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Валидация всех полей
  if (!formData.email || !formData.name || !formData.surname || !formData.birthDate || !formData.login || !formData.password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const kcUser = {
      username: formData.login,
      email: formData.email,
      firstName: formData.name,
      lastName: formData.surname,
      password: formData.password,
    };

  
const payload = {
  name: formData.name,
  surname: formData.surname,
  birthDate: formData.birthDate,
  email: formData.email,
  login: formData.login,
  password: formData.password
};

    await api.post("/auth/registration", payload);

    window.location.href = "/login";

  } catch (error) {
    handleApiError(error, "Unable to complete registration");
  }
};

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ transform: "translateY(0%)" }}
    >
      <div className="card-custom shadow-lg" style={{ width: "450px"}}>
        <h2 className="text-center mb-4 brand-green">Sign up</h2>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="mb-3 text-start">
                <label className="form-label">Login</label>
                <input
                  type="text"
                  name="login"
                  className="form-control"
                  placeholder="Enter your login"
                  value={formData.login}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="button"
                className="btn btn-green w-100"
                onClick={handleNext}
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-3 text-start">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter your first name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="surname"
                  className="form-control"
                  placeholder="Enter your last name"
                  value={formData.surname}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3 text-start">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label">Birth Date</label>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                  <DatePicker
                    value={formData.birthDate ? new Date(formData.birthDate) : null}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        birthDate: date ? date.toISOString().split("T")[0] : "",
                      })
                    }
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: { fullWidth: true, required: true },
                    }}
                  />
                </LocalizationProvider>
              </div>

              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button type="submit" className="btn btn-green">
                  Sign up
                </button>
              </div>
            </>
          )}

          <p className="text-center mt-3">
            Already have an account?{" "}
            <Link to="/login" className="brand-green fw-bold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}