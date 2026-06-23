import { useNavigate } from "react-router-dom";
import ServiceForm from "../../components/service/ServiceForm";

export default function CreateService() {
  const navigate = useNavigate();

  const handleSuccess = (service) => {
    navigate("/dashboard/services");
  };

  return (
    <div className="flex justify-center">
      <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Service catalog
          </p>
          <h1 className="mt-2">Create New Service</h1>
          <p className="mt-3">
            Add the details customers need to understand what you offer.
          </p>
        </div>
        <ServiceForm onSuccess={handleSuccess} />
      </section>
    </div>
  );
}
