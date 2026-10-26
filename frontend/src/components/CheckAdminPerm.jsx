// CheckAdminPerm.jsx
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import supabase from "../supabaseClient";

export default function CheckAdminPerm() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (cancelled) return;

        if (error || !user) {
          setStatus("signed-out");
        } else {
          setStatus(
            user.app_metadata?.role === "admin" ? "admin" : "denied"
          );
        }
      } catch {
        if (!cancelled) setStatus("denied");
      }
    }

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") setStatus("signed-out");
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (status === "loading") return <p>Checking access...</p>;
  if (status === "signed-out") return <Navigate to="/login" replace />;
  if (status !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}