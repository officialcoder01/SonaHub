import { useState, useEffect } from "react";
import { getCategories } from "../../services/serviceService";
import { useAuth } from "../../context/AuthContext";

const initialFormData = {
  title: "",
  description: "",
  price: "",
  categoryId: "",
};

const defaultInitialData = Object.freeze({});
const defaultExistingImages = Object.freeze([]);

export default function ServiceForm({
  onSuccess,
  submitAction,
  submitLabel = "Create Service",
  initialData = defaultInitialData,
  existingImages = defaultExistingImages,
}) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({ ...initialFormData, ...initialData });
  const [categories, setCategories] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState(existingImages);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.categories);
      } catch (err) {
        setError(err.message || "Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 3) {
      setError("Maximum 3 images allowed");
      return;
    }

    setSelectedFiles(files);
    setError("");

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = {
        ...formData,
        images: selectedFiles,
      };
      const response = await submitAction(data, token);
      setFormData(initialFormData);
      setSelectedFiles([]);
      setPreviews([]);
      setExistingImageUrls(existingImages || []);
      if (onSuccess) onSuccess(response.service || response);
    } catch (err) {
      setError(err.message || "Unable to submit service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-stack">
      {error && <div className="form-error">{error}</div>}

      <div className="form-field">
        <label htmlFor="title" className="form-label">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>

      <div className="form-field">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="form-input"
        />
      </div>

      <div className="form-field">
        <label htmlFor="price" className="form-label">
          Price
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="form-input"
        />
      </div>

      <div className="form-field">
        <label htmlFor="categoryId" className="form-label">
          Category
        </label>
        {isLoadingCategories ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Loading categories...
          </div>
        ) : (
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="form-input"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="images" className="form-label">
          Images (max 3)
        </label>
        <input
          type="file"
          id="images"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full rounded-md border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:border-blue-300"
        />
        {(existingImageUrls.length > 0 || previews.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-3">
            {existingImageUrls.map((url, index) => (
              <img
                key={`existing-${index}`}
                src={url}
                alt={`Existing image ${index + 1}`}
                className="h-20 w-20 rounded-md border border-slate-200 object-cover"
              />
            ))}
            {previews.map((preview, index) => (
              <img
                key={`preview-${index}`}
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-20 w-20 rounded-md border border-slate-200 object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isLoadingCategories}
        className="btn-primary w-full"
      >
        {isSubmitting ? `${submitLabel.split(" ")[0]}ing...` : submitLabel}
      </button>
    </form>
  );
}
