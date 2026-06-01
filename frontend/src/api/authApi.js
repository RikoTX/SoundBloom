const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5223";

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.title || "Request failed. Please try again."
    );
  }

  return data;
}

export async function register({ email, password }) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return parseJsonResponse(response);
}

export async function verifyEmail({ email, code }) {
  const response = await fetch(`${API_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, code }),
  });

  return parseJsonResponse(response);
}

export async function resendCode({ email }) {
  const response = await fetch(`${API_URL}/api/auth/resend-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return parseJsonResponse(response);
}

export async function login({ email, password }) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return parseJsonResponse(response);
}

export async function checkUsername(username) {
  const response = await fetch(
    `${API_URL}/api/auth/username/check?username=${encodeURIComponent(username)}`,
    {
      headers: { Accept: "application/json" },
    }
  );

  return parseJsonResponse(response);
}

export async function setUsername({ token, username }) {
  const response = await fetch(`${API_URL}/api/auth/username`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username }),
  });

  return parseJsonResponse(response);
}

export async function fetchMe(token) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJsonResponse(response);
}

export async function uploadAvatar({ token, avatarData }) {
  const response = await fetch(`${API_URL}/api/auth/avatar`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ avatarData }),
  });

  return parseJsonResponse(response);
}

export async function changePassword({ token, newPassword, confirmPassword }) {
  const response = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword, confirmPassword }),
  });

  return parseJsonResponse(response);
}

export async function removeAvatar(token) {
  const response = await fetch(`${API_URL}/api/auth/avatar`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJsonResponse(response);
}
