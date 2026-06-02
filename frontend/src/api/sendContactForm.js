const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5223";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export function isContactFormConfigured() {
  return Boolean(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim());
}

async function sendViaWeb3Forms({ name, email, message }) {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim();
  if (!accessKey) {
    return null;
  }

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: accessKey,
      subject: "SoundBloom — сообщение с формы контактов",
      from_name: "SoundBloom",
      name,
      email,
      replyto: email,
      message,
      botcheck: "",
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Web3Forms: не удалось отправить сообщение.",
    );
  }

  return data;
}

async function sendViaBackend({ name, email, message }) {
  const response = await fetch(`${API_URL}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name, email, message }),
  });

  const data = await response.json().catch(() => ({}));

  if (response.ok) {
    return data;
  }

  return null;
}

export async function sendContactForm({ name, email, message }) {
  const payload = {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  };

  if (isContactFormConfigured()) {
    try {
      return await sendViaWeb3Forms(payload);
    } catch (web3Err) {
      const fromApi = await sendViaBackend(payload);
      if (fromApi) {
        return fromApi;
      }
      throw web3Err;
    }
  }

  const fromApi = await sendViaBackend(payload);
  if (fromApi) {
    return fromApi;
  }

  throw new Error(
    "Не удалось отправить. Добавьте VITE_WEB3FORMS_ACCESS_KEY в frontend/.env.local и перезапустите npm run dev.",
  );
}
