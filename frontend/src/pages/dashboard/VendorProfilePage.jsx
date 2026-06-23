import { useCallback, useEffect, useState } from "react";
import DashboardCardSkeleton from "../../components/dashboard/DashboardCardSkeleton";
import DashboardEmptyState from "../../components/dashboard/DashboardEmptyState";
import VendorProfileForm from "../../components/dashboard/VendorProfileForm";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile } from "../../services/vendorService";

export default function VendorProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Profile state stays local to this page so future edit behavior can grow here.
      const nextProfile = await getMyProfile(token);
      setProfile(nextProfile);
    } catch (err) {
      setError(err.message || "Unable to load vendor profile");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isActive = true;

    if (!token) {
      return () => {
        isActive = false;
      };
    }

    getMyProfile(token)
      .then((nextProfile) => {
        if (isActive) {
          setProfile(nextProfile);
          setError("");
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(err.message || "Unable to load vendor profile");
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Vendor profile
        </p>
        <h1 className="mt-2">Vendor Profile</h1>
        <p className="mt-2 max-w-2xl text-sm">
          Keep your public business information clear, trustworthy, and customer ready.
        </p>
      </div>

      {isLoading ? <DashboardCardSkeleton className="max-w-3xl" rows={4} /> : null}

      {!isLoading && error ? (
        <DashboardEmptyState
          eyebrow="Profile unavailable"
          title="We could not load your vendor profile."
          description={error}
          actionLabel="Try Again"
          onAction={loadProfile}
        />
      ) : null}

      {!isLoading && !error && !profile ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <VendorProfileForm token={token} onProfileCreated={loadProfile} />
        </section>
      ) : null}

      {!isLoading && !error && profile ? (
        <section className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Active profile
          </p>
          <h2 className="mt-2">{profile.businessName}</h2>
          <p className="mt-3 text-sm">{profile.bio || "No business bio added yet."}</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Location
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {profile.location || "Not provided"}
              </dd>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Specialty
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {profile.specialty || "Not provided"}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  );
}
