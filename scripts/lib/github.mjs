const API_URL = "https://api.github.com";

export async function githubRequest(path, token) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "aryanmiriyala-profile-workflows",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${path} failed: ${response.status} ${body}`);
  }

  return response.json();
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}
