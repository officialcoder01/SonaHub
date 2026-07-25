import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../layouts/AuthLayout";

const initialFormData = {
  email: "",
  password: "",
};

export default function Login() {
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
      const response = await loginUser(formData);
      login(response.token, response.user);
      setFormData(initialFormData);
      navigate(response.user.role === "VENDOR" ? "/dashboard" : "/");
    } catch (err) {
      setError(err.message || "Unable to log in");
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
            className="text-2xl font-extrabold tracking-tight text-blue-700"
          >
            Sona<span className="hidden min-[390px]:inline text-red-500">Hub</span>
          </Link>
          <h1 className="mt-5">Welcome back</h1>
          <p className="mt-2">Access your marketplace account.</p>
        </div>

        {error ? <p className="form-error mb-4">{error}</p> : null}

        <form onSubmit={handleSubmit} className="form-stack">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-700 hover:text-blue-800"
          >
            Register
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
