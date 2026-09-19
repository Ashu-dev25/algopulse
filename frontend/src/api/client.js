const API_BASE_URL = "http://localhost:8000/api/v1";

// 1) Token storage helpers
export const getAuthToken = () => localStorage.getItem("algopulse_token");
export const setAuthToken = (token) =>
  localStorage.setItem("algopulse_token", token);
export const removeAuthToken = () => localStorage.removeItem("algopulse_token");

// 2) Core API Request Helper with JWT Bearer Header Injection
export async function apiRequest(endpoint, options = {}) {
  // Step A: Retrieve stored JWT token
  const token = getAuthToken();

  // Step B: Set headers with Bearer token if present
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Step C: Perform fetch request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Step D: Handle 401 Unauthorized
  if (response.status === 401) {
    removeAuthToken();
    window.dispatchEvent(new Event("algopulse:unauthorized"));
  }

  // Step E: Parse and throw readable error message if response not ok
  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || JSON.stringify(errorJson);
    } catch (e) {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  // Step F: Return empty on 204 No Content
  if (response.status === 204) {
    return null;
  }

  // Step G: Return parsed JSON
  return response.json();
}

// 3) Phase 1: Authentication API Endpoints
export const authApi = {
  // Step A: Register new account
  register: (data) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  // Step B: Login with credentials
  login: (data) =>
    apiRequest("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  // Step C: Logout current session
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
  // Step D: Verify active login status
  isLoggedIn: () => apiRequest("/auth/isLoggedIn"),
};

// 4) Phase 1: User Profile CRUD API Endpoints
export const usersApi = {
  // Step A: Read profile
  getProfile: () => apiRequest("/users/profile"),
  // Step B: Update settings
  updateProfile: (data) =>
    apiRequest("/users/profile", { method: "PUT", body: JSON.stringify(data) }),
  // Step C: Delete account
  deleteAccount: () => apiRequest("/users/account", { method: "DELETE" }),
};

// 5) Phase 1: Problem CRUD API Endpoints
export const problemsApi = {
  // Step A: Create problem with strict URL validation
  create: (data) =>
    apiRequest("/problems", { method: "POST", body: JSON.stringify(data) }),
  // Step B: List problems with filtering
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/problems${query ? `?${query}` : ""}`);
  },
  // Step C: Read single problem
  getById: (id) => apiRequest(`/problems/${id}`),
  // Step D: Update problem details
  update: (id, data) =>
    apiRequest(`/problems/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  // Step E: Delete problem
  delete: (id) => apiRequest(`/problems/${id}`, { method: "DELETE" }),
};

// 6) Phase 1: URL Proof Validator Playground API
export const validatorApi = {
  // Step A: Validate submission proof URL
  validateUrl: (url, platform) =>
    apiRequest("/validate/submission-url", {
      method: "POST",
      body: JSON.stringify({ url, platform: platform || null }),
    }),
};

// 7) Phase 2: LeetCode sync and streak APIs
export const syncApi = {
  syncLeetCode: (limit = 20) =>
    apiRequest(`/sync/leetcode?limit=${limit}`, { method: "POST" }),
  getStatus: () => apiRequest("/sync/status"),
};

export const streakApi = {
  getOverview: () => apiRequest("/streak/overview"),
  getHeatmap: (days = 365) => apiRequest(`/streak/heatmap?days=${days}`),
  resetBeforeToday: () => apiRequest("/streak/reset-before-today", { method: "POST" }),
};
