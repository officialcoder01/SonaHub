import { useState } from "react";
import naijaStateLocalGovernment from "naija-state-local-government";

const initialFormData = {
  businessName: "",
  bio: "",
  location: "",
};

const defaultFormData = Object.freeze({});

const stateOptions = naijaStateLocalGovernment.states();

export default function VendorProfileForm({
  token,
  onSuccess,
  submitAction,
  submitLabel = "Save Profile",
  initialData = defaultFormData,
}) {
  const [formData, setFormData] = useState({ ...initialFormData, ...initialData });
  const [selectedState, setSelectedState] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // track the previous initialData to reset the form when it changes
  const [prevInitialData, setPrevInitialData] = useState("");

  const normalizeInput = (s) => (typeof s === "string" ? s.trim() : "");

  const findStateOption = (input) => {
    const cleaned = normalizeInput(input);
    if (!cleaned) return "";
    const match = stateOptions.find((s) => s.toLowerCase() === cleaned.toLowerCase());
    return match || cleaned;
  };

  const getLgasForState = (state) => {
    const matchedState = findStateOption(state);
    const result = naijaStateLocalGovernment.lgas(matchedState);
    return result?.lgas ?? [];
  };

  // Detect changes in initialData and reset the form if it has changed
  if(JSON.stringify(initialData) !== JSON.stringify(prevInitialData)) {
    setPrevInitialData(initialData);

    setFormData({ ...initialFormData, ...initialData });

    const loc = initialData?.location;

    if (loc) {
      const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
      const [lga = "", stateInput = ""] = parts;
      const state = findStateOption(stateInput);

      setSelectedState(state);
      setSelectedLga(lga);
    } else {
      setSelectedState("");
      setSelectedLga("");
    }
  };

  const lgaOptions = selectedState ? getLgasForState(selectedState) : [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((cur) => ({ ...cur, [name]: value }));
  }

  const handleStateChange = (event) => {
    const raw = event.target.value;
    const state = findStateOption(raw);
    setSelectedState(state);
    setSelectedLga("");
    setFormData((cur) => ({ ...cur, location: state }));
  };

  const handleLgaChange = (event) => {
    const lgaName = normalizeInput(event.target.value);
    setSelectedLga(lgaName);
    setFormData((cur) => ({
      ...cur,
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
      const data = {
        ...formData,
        location: `${selectedLga}, ${selectedState}`,
      };

      const response = await submitAction(data, token);

      setFormData(initialFormData);
      setSelectedState("");
      setSelectedLga("");

      if (onSuccess) onSuccess(response.vendorProfile || response);
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
        {isSubmitting ? `${submitLabel.split(' ')[0]}ing...` : submitLabel}
      </button>

      {error ? <p className="form-error">{error}</p> : null}
    </form>
  );
}
