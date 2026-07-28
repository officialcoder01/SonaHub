import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ServiceForm from "../../components/service/ServiceForm";
import { getServiceDetails, updateService } from "../../services/serviceService";

export default function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadService = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getServiceDetails(id);
        setService(response.service);
      } catch (err) {
        setError(err.message || "Unable to load service details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadService();
    }
  }, [id]);

  const handleSuccess = () => {
    navigate("/dashboard/services");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Edit Service
          </p>
          <p className="mt-4">Loading service details...</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center">
        <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
            Unable to load service
          </p>
          <p className="mt-4 text-sm text-slate-600">{error}</p>
        </section>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const initialData = {
    title: service.title || "",
    description: service.description || "",
    price: service.price || "",
    categoryId: service.categoryId || "",
  };

  const existingImages = Array.isArray(service.images)
    ? service.images.map((image) => image.url)
    : [];

  return (
    <div className="flex justify-center">
      <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Service catalog
          </p>
          <h1 className="mt-2">Edit Service</h1>
          <p className="mt-3">
            Update the fields you want to change and add new images if needed.
          </p>
        </div>
        <ServiceForm
          onSuccess={handleSuccess}
          submitAction={(data, token) => updateService(id, data, token)}
          submitLabel="Update Service"
          initialData={initialData}
          existingImages={existingImages}
        />
      </section>
    </div>
  );
}
