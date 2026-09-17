"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [showReminder, setShowReminder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleContinue = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    router.push("/login");
    return;
  }

  setRefreshing(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/refresh",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/login");
      return;
    }

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    setTimeLeft(15 * 60);
    setShowReminder(false);
  } catch (error) {
    setError("Unable to refresh session");
  } finally {
    setRefreshing(false);
  }
};

  const handleLogout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/logout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      }
    );

    if (!response.ok) {
      console.log("Logout request failed");
    }
  } catch (error) {
    console.log("Logout error:", error);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    router.push("/login");
  }
};

  useEffect(() => {
    const getProfile = async () => {
      const accessToken = localStorage.getItem("accessToken");

    //   if (!accessToken) {
    //     setError("Please login first");
    //     setLoading(false);
    //     return;
    //   }
    if (!accessToken) {
  router.push("/login");
  return;
}

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to get profile");
          return;
        }

        setUser(data.user);
      } catch (error) {
        setError("Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  useEffect(() => {
  if (showReminder) {
    return;
  }

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        setShowReminder(true);
        return 0;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [showReminder]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-gray-500">
  Session time: {Math.floor(timeLeft / 60)}:
  {String(timeLeft % 60).padStart(2, "0")}
</p>

        {error && (
          <p className="mt-6 rounded-lg bg-blue-50 px-4 py-3 text-red-600">
            {error}
          </p>
        )}

        {user && (
          <div className="mt-8 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900">
                {user.role}
              </p>
            </div>
            <button
  onClick={() => router.push("/change-password")}
  className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
>
  Change Password
</button>

 <button
  onClick={handleLogout}
  className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-red-700"
>
  Logout
</button>

          </div>
        )}
      </div>
      {showReminder && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="text-xl font-semibold text-gray-900">
        Session expired
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Your session has expired. Do you want to continue?
      </p>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleContinue}
          disabled={refreshing}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {refreshing ? "Refreshing..." : "Continue"}
        </button>

        <button
          onClick={handleLogout}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)}
    </main>
    
  );
}