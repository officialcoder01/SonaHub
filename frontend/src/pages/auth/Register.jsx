import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../layouts/AuthLayout";
import logo from "../../assets/images/logo.png";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  role: "CUSTOMER",
};

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await registerUser(formData);
      login(response.token, response.user);
      setFormData(initialFormData);
      navigate(response.user.role === "VENDOR" ? "/dashboard" : "/");
    } catch (err) {
      setError(err.message || "Unable to register user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="form-card">
        <div className="mb-7 text-center">
          <Link
            to="/"
            className="flex items-center justify-center"
          >
            <img src={logo} alt="SonaHub Logo" className="h-8 w-auto mr-2 inline-block" />
          </Link>
          <h1 className="mt-4">Create your account</h1>
          <p className="mt-2">
            Create an account to buy or sell artisan services.
          </p>
        </div>

        {error ? <p className="form-error mb-4">{error}</p> : null}

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-field">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="role" className="form-label">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-input"
            >
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="VENDOR">VENDOR</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-700 hover:text-blue-800"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
