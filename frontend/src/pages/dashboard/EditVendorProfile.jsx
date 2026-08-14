import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VendorProfileForm from "../../components/dashboard/VendorProfileForm";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile, updateProfile } from "../../services/vendorService";

export default function EditVendorProfile() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                return;
            };

            setIsLoading(true);
            setError("");

            try {
                const profileData = await getMyProfile(token);
                setProfile(profileData);
            } catch (err) {
                setError(err.message || "Failed to fetch vendor profile.");
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    const handleSuccess = () => {
        navigate("/dashboard/vendor-profile");
    };

    if (isLoading) {
        return (
            <div className="flex justify-center">
                <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                        Edit Vendor Profile
                    </p>
                    <p className="mt-4">Loading vendor profile...</p>
                </section>
            </div>
        );
    };

    if (error) {
        return (
            <div className="flex justify-center">
                <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
                        Unable to load vendor profile
                    </p>
                    <p className="mt-4 text-sm text-slate-600">{error}</p>
                </section>
            </div>
        );
    };

    if (!profile) {
        return (
            <div className="flex justify-center">
                <section className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
                        Vendor profile not found
                    </p>
                </section>
            </div>
        );
    };

    const initialData = {
        businessName: profile.businessName || "",
        bio: profile.bio || "",
        description: profile.description || "",
        location: profile.location || "",
    };

    return (
        <div className="flex justify-center">
            <section className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                        Edit Vendor Profile
                    </p>
                </div>
                <VendorProfileForm 
                  token={token}
                  onSuccess={handleSuccess}
                  submitAction={updateProfile}
                  submitLabel="Update Profile"
                  initialData={initialData}
                />
            </section>
        </div>
    );
}