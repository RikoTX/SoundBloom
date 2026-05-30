const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export function isContactFormConfigured() {
  return Boolean(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim());
}

export async function sendContactForm({ name, email, message }) {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim();

  if (!accessKey) {
    throw new Error(
      "Contact form is not configured. Add VITE_WEB3FORMS_ACCESS_KEY to .env.local"
    );
  }

  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: accessKey,
      subject: "SoundBloom — new contact message",
      from_name: "SoundBloom Website",
      name: name.trim(),
      email: email.trim(),
      replyto: email.trim(),
      message: message.trim(),
      botcheck: "",
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Could not send your message. Please try again later."
    );
  }

  return data;
}
