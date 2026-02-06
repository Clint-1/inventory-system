"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // import router

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter(); // initialize router

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Welcome ${data.user.username} (${data.user.role})`);

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push("/dashboard"); // replace with your dashboard route
        }, 1000);
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <form
        className="bg-gray-800 shadow-lg rounded-xl p-10 w-full max-w-sm text-white"
        onSubmit={handleSubmit}
      >
        {/* Title */}
        <h2 className="text-xl font-semibold mb-2 text-center text-gray-400">
          Welcome to
        </h2>
        <h1 className="text-3xl font-bold mb-8 text-center text-white">
          Inventory System
        </h1>

        {/* Message */}
        {message && (
          <p
            className={`mb-4 text-center font-medium ${
              message.includes("Welcome") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        {/* Username */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-300">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <label className="block mb-2 font-medium text-gray-300">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20 text-white"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-600 px-2 py-1 rounded text-gray-300 text-sm hover:bg-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="mb-6 text-right">
          <a href="#" className="text-sm text-blue-400 hover:underline">
            Forgot Password?
          </a>
        </div>

        {/* Login button */}
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Login
        </button>
      </form>
    </div>
  );
}
