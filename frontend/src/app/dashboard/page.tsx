"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [repos, setRepos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/repos", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setRepos(data));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Your GitHub Repositories</h1>

      <div className="grid grid-cols-3 gap-4">
        {Array.isArray(repos) && repos.map((repo: any) => (
          <div
            key={repo.id}
            className="border rounded-xl p-4 hover:shadow-md transition cursor-pointer"
          >
            <h3 className="font-semibold">{repo.name}</h3>

            <p className="text-sm text-gray-500">⭐ {repo.stargazers_count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
