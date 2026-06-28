import { useState } from "react";
import naijaStateLocalGovernment from "naija-state-local-government";
import { createProfile } from "../../services/vendorService";

const initialFormData = {
  businessName: "",
  bio: "",
  location: "",
};

const stateOptions = naijaStateLocalGovernment.states();

export default function VendorProfileForm({ token, onProfileCreated }) {
  const [formData, setFormData] = useState(initialFormData);
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [lgaOptions, setLgaOptions] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleStateChange = (event) => {
    const stateName = event.target.value;
    setSelectedState(stateName);
    setSelectedLga("");
    setLgaOptions(stateName ? naijaStateLocalGovernment.lgas(stateName).lgas : []);
    setFormData((currentData) => ({
      ...currentData,
      location: stateName,
    }));
  };

  const handleLgaChange = (event) => {
    const lgaName = event.target.value;
    setSelectedLga(lgaName);
    setFormData((currentData) => ({
      ...currentData,
      location: lgaName && selectedState ? `${lgaName}, ${selectedState}` : selectedState,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!selectedState || !selectedLga) {
      setError("Please select both a state and a local government area.");
      setIsSubmitting(false);
      return;
    }

    try {
      await createProfile(
        {
          ...formData,
          location: `${selectedLga}, ${selectedState}`,
        },
        token,
      );
      setFormData(initialFormData);
      setSelectedState("");
      setSelectedLga("");
      setLgaOptions([]);
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
        <label htmlFor="state" className="form-label">State</label>
        <select
          id="state"
          name="state"
          value={selectedState}
          onChange={handleStateChange}
          required
          className="form-input"
        >
          <option value="">Select a state</option>
          {stateOptions.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="lga" className="form-label">Local Government Area</label>
        <select
          id="lga"
          name="lga"
          value={selectedLga}
          onChange={handleLgaChange}
          required
          disabled={!selectedState}
          className="form-input"
        >
          <option value="">{selectedState ? "Select an LGA" : "Select a state first"}</option>
          {lgaOptions.map((lga) => (
            <option key={lga} value={lga}>
              {lga}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? "Saving..." : "Save Profile"}
      </button>

      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}
