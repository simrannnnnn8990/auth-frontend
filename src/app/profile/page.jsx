"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setError("Please login first");
        setLoading(false);
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

        {error && (
          <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-red-600">
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
          </div>
        )}
      </div>
    </main>
  );
}