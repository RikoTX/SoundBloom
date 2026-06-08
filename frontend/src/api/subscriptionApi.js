import { getToken } from "../utils/getToken";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5223";

function authHeaders() {
  const { token, isAuth } = getToken();

  if (!isAuth || !token) {
    throw new Error("Not authenticated.");
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        data.message ||
          "Endpoint not found. Restart the backend (dotnet run) after updating.",
      );
    }
    throw new Error(data.message || "Request failed.");
  }
  return data;
}

export async function fetchSubscriptionStatus() {
  const response = await fetch(`${API_URL}/api/subscription/status`, {
    headers: authHeaders(),
  });
  return parseJson(response);
}

export async function recordTrackSkip() {
  const response = await fetch(`${API_URL}/api/subscription/skip`, {
    method: "POST",
    headers: authHeaders(),
  });
  return parseJson(response);
}

export async function fetchPaymentMethods() {
  const response = await fetch(`${API_URL}/api/subscription/payment-methods`, {
    headers: authHeaders(),
  });
  return parseJson(response);
}

export async function fakeCheckout({
  plan,
  months = 1,
  paymentMethodId = null,
  saveCard = true,
  newCard = null,
  promoCode = null,
}) {
  const body = { plan, months, saveCard };

  if (paymentMethodId) {
    body.paymentMethodId = paymentMethodId;
  } else if (newCard) {
    body.newCard = newCard;
  }

  if (promoCode) {
    body.promoCode = promoCode;
  }

  const response = await fetch(`${API_URL}/api/subscription/checkout`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return parseJson(response);
}

export async function cancelSubscription() {
  const response = await fetch(`${API_URL}/api/subscription/cancel`, {
    method: "POST",
    headers: authHeaders(),
  });
  return parseJson(response);
}

export async function fetchFamily() {
  const response = await fetch(`${API_URL}/api/subscription/family`, {
    headers: authHeaders(),
  });
  return parseJson(response);
}

export async function searchFamilyUsers(query) {
  const q = (query || "").trim();
  if (!q) return [];
  const response = await fetch(
    `${API_URL}/api/subscription/family/search?q=${encodeURIComponent(q)}`,
    { headers: authHeaders() },
  );
  return parseJson(response);
}

export async function addFamilyMember(username) {
  const response = await fetch(`${API_URL}/api/subscription/family/members`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ username }),
  });
  return parseJson(response);
}

export async function removeFamilyMember(memberId) {
  const response = await fetch(
    `${API_URL}/api/subscription/family/members/${encodeURIComponent(memberId)}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (response.status === 204) return null;
  return parseJson(response);
}

export async function fetchTrackDownload(trackId) {
  const response = await fetch(
    `${API_URL}/api/subscription/tracks/${encodeURIComponent(trackId)}/download`,
    { headers: authHeaders() },
  );
  return parseJson(response);
}
