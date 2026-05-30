import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SignInAndLogin() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section
      style={{
        marginTop: 100,
        marginBottom: 64,
        padding: "0 4%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
        className="lg:flex-row lg:items-center lg:justify-between lg:gap-16"
      >
        <div style={{ flex: 1, maxWidth: 480 }}>
          <p
            style={{
              fontWeight: 600,
              fontSize: 35,
              margin: "0 0 20px",
              color: "#cb0094",
            }}
          >
            {t("home.join.title")}
          </p>

          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.65,
              color: "#929292",
            }}
          >
            {t("home.join.subtitle")}
          </p>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 420,
            backgroundColor: "#1F1F1F",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: "32px 28px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}logo-round.png`}
              alt="SoundBloom"
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {t("home.join.signInAccess")}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 13,
                  color: "#929292",
                }}
              >
                {t("home.join.playlistsMore")}
              </p>
            </div>
          </div>

          <div
            style={{
              height: 1,
              backgroundColor: "rgba(255,255,255,0.08)",
              marginBottom: 24,
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
            className="sm:flex-row"
          >
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="bg-pink-500 text-white px-6 py-2.5 rounded-lg hover:bg-pink-700 transition font-medium w-full sm:flex-1"
            >
              {t("common.signUp")}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-white border border-white/30 px-6 py-2.5 rounded-lg hover:bg-white/10 transition w-full sm:flex-1"
            >
              {t("common.login")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
