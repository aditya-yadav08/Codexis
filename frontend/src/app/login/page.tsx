"use client";

export default function LoginPage() {

  const login = () => {
    window.location.href = "http://localhost:4000/auth/github";
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={login}
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
      >
        Login with GitHub
      </button>
    </div>
  );
}