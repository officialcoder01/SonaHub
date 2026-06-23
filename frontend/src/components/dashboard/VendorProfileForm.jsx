import { useState } from "react";
import { createProfile } from "../../services/vendorService";

const initialFormData = {
  businessName: "",
  bio: "",
  location: "",
};

export default function VendorProfileForm({ token, onProfileCreated }) {
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
      await createProfile(formData, token);
      setFormData(initialFormData);
      onProfileCreated();
    } catch (err) {
      setError(err.message || "Unable to create vendor profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      <div className="form-field">
        <label htmlFor="businessName" className="form-label">Business Name</label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          value={formData.businessName}
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>

      <div className="form-field">
        <label htmlFor="bio" className="form-label">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          required
          rows={4}
          className="form-input"
        />
      </div>

      <div className="form-field">
        <label htmlFor="location" className="form-label">Location</label>
        <input
          id="location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? "Saving..." : "Save Profile"}
      </button>

      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}
