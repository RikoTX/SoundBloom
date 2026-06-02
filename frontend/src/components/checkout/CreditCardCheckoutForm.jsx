import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import IMask from "imask";
import CreditCardVisual from "./CreditCardVisual";
import { brandLabel, detectCardBrand, digitsOnly } from "../../utils/cardBrand";
import { notifyError } from "../../utils/appNotification";
import "./creditCardCheckout.css";

const PLAN_PRICES = { premium: "$9.99", family: "$14.99" };

function BrandMark({ brand }) {
  const label = brandLabel(brand);
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 6,
        background: "rgba(255,255,255,0.92)",
        color: "#1a3a6e",
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </span>
  );
}

export default function CreditCardCheckoutForm({
  plan,
  savedMethods = [],
  loading = false,
  onSubmit,
}) {
  const { t } = useTranslation();
  const nameRef = useRef(null);
  const numberRef = useRef(null);
  const expiryRef = useRef(null);
  const cvcRef = useRef(null);
  const masksRef = useRef({});

  const defaultSaved = savedMethods.find((m) => m.isDefault) ?? savedMethods[0];
  const hasSaved = savedMethods.length > 0;

  const [useSaved, setUseSaved] = useState(hasSaved);
  const [selectedMethodId, setSelectedMethodId] = useState(defaultSaved?.id ?? null);

  useEffect(() => {
    if (!hasSaved) return;
    const preferred = savedMethods.find((m) => m.isDefault) ?? savedMethods[0];
    if (preferred?.id != null) {
      setSelectedMethodId(preferred.id);
      setUseSaved(true);
    }
  }, [hasSaved, savedMethods]);
  const [saveCard, setSaveCard] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [holderName, setHolderName] = useState("");
  const [displayNumber, setDisplayNumber] = useState("");
  const [displayExpire, setDisplayExpire] = useState("");
  const [displayCvc, setDisplayCvc] = useState("");
  const [brand, setBrand] = useState("unknown");

  useEffect(() => {
    if (!numberRef.current || masksRef.current.number) return;

    const numberMask = IMask(numberRef.current, {
      mask: [
        {
          mask: "0000 000000 00000",
          regex: "^3[47]\\d{0,13}",
          cardtype: "american express",
        },
        {
          mask: "0000 0000 0000 0000",
          regex: "^(?:6011|65\\d{0,2}|64[4-9]\\d?)\\d{0,12}",
          cardtype: "discover",
        },
        {
          mask: "0000 000000 0000",
          regex: "^3(?:0([0-5]|9)|[689]\\d?)\\d{0,11}",
          cardtype: "diners",
        },
        {
          mask: "0000 0000 0000 0000",
          regex: "^(5[1-5]\\d{0,2}|22[2-9]\\d{0,1}|2[3-7]\\d{0,2})\\d{0,12}",
          cardtype: "mastercard",
        },
        {
          mask: "0000 0000 0000 0000",
          regex: "^4\\d{0,15}",
          cardtype: "visa",
        },
        { mask: "0000 0000 0000 0000", cardtype: "unknown" },
      ],
      dispatch: (appended, dynamicMasked) => {
        const number = (dynamicMasked.value + appended).replace(/\D/g, "");
        for (let i = 0; i < dynamicMasked.compiledMasks.length; i += 1) {
          const re = new RegExp(dynamicMasked.compiledMasks[i].regex);
          if (number.match(re) != null) {
            return dynamicMasked.compiledMasks[i];
          }
        }
        return dynamicMasked.compiledMasks[dynamicMasked.compiledMasks.length - 1];
      },
    });

    numberMask.on("accept", () => {
      const digits = digitsOnly(numberMask.unmaskedValue);
      const detected =
        numberMask.masked.currentMask?.cardtype ?? detectCardBrand(digits);
      setBrand(detected);
      setDisplayNumber(numberMask.value || "");
    });

    const expiryMask = IMask(expiryRef.current, {
      mask: "MM{/}YY",
      blocks: {
        MM: { mask: IMask.MaskedRange, from: 1, to: 12 },
        YY: { mask: IMask.MaskedRange, from: 0, to: 99 },
      },
    });
    expiryMask.on("accept", () => setDisplayExpire(expiryMask.value || ""));

    const cvcMask = IMask(cvcRef.current, { mask: "0000" });
    cvcMask.on("accept", () => setDisplayCvc(cvcMask.value || ""));

    masksRef.current = { number: numberMask, expiry: expiryMask, cvc: cvcMask };

    return () => {
      numberMask.destroy();
      expiryMask.destroy();
      cvcMask.destroy();
      masksRef.current = {};
    };
  }, [useSaved]);

  const priceLabel = PLAN_PRICES[plan] ?? "";

  const savedPreview = useMemo(() => {
    const m = savedMethods.find(
      (x) => String(x.id) === String(selectedMethodId),
    );
    if (!m) return null;
    return {
      number: `•••• •••• •••• ${m.lastFour}`,
      name: m.cardholderName,
      expire: `${String(m.expMonth).padStart(2, "0")}/${String(m.expYear).padStart(2, "0")}`,
      brand: m.brand,
    };
  }, [savedMethods, selectedMethodId]);

  const visualProps = useSaved && savedPreview
    ? {
        number: savedPreview.number,
        name: savedPreview.name,
        expire: savedPreview.expire,
        cvc: "•••",
        brandBadge: <BrandMark brand={savedPreview.brand} />,
        colorClass: savedPreview.brand,
      }
    : {
        number: displayNumber || "0123 4567 8910 1112",
        name: holderName || "JOHN DOE",
        expire: displayExpire || "01/28",
        cvc: displayCvc || "985",
        brandBadge: brand !== "unknown" ? <BrandMark brand={brand} /> : null,
        colorClass: brand,
      };

  const handlePay = async () => {
    if (useSaved && selectedMethodId != null) {
      await onSubmit({ paymentMethodId: String(selectedMethodId) });
      return;
    }

    const numberMask = masksRef.current.number;
    const expiryMask = masksRef.current.expiry;
    const digits = digitsOnly(numberMask?.unmaskedValue ?? "");

    if (digits.length < 13) {
      throw new Error(t("subscription.payment.invalidCard"));
    }

    const name = (nameRef.current?.value ?? holderName).trim();
    if (name.length < 2) {
      throw new Error(t("subscription.payment.invalidName"));
    }

    const expParts = (expiryMask?.value ?? "").split("/");
    const expMonth = parseInt(expParts[0], 10);
    const expYear = parseInt(expParts[1], 10);

    if (!expMonth || Number.isNaN(expYear)) {
      throw new Error(t("subscription.payment.invalidExpiry"));
    }

    const cvcDigits = digitsOnly(masksRef.current.cvc?.unmaskedValue ?? "");
    if (cvcDigits.length < 3) {
      throw new Error(t("subscription.payment.invalidCvc"));
    }

    await onSubmit({
      saveCard,
      newCard: {
        cardholderName: name,
        lastFour: digits.slice(-4),
        brand: detectCardBrand(digits),
        expMonth,
        expYear,
      },
    });
  };

  return (
    <div className="cc-checkout">
      <div className="payment-title">
        <h2>{t("subscription.payment.title")}</h2>
        <p className="demo-hint">
          {t("subscription.payment.planLine", {
            plan: t(`subscription.plan.${plan}`),
            price: priceLabel,
          })}
        </p>
      </div>

      {savedMethods.length > 0 && (
        <div className="saved-card-row">
          <button
            type="button"
            className={`saved-card-option${useSaved ? " selected" : ""}`}
            onClick={() => setUseSaved(true)}
          >
            {t("subscription.payment.useSaved")}
          </button>
          {useSaved &&
            savedMethods.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`saved-card-option${String(selectedMethodId) === String(m.id) ? " selected" : ""}`}
                onClick={() => setSelectedMethodId(m.id)}
              >
                {brandLabel(m.brand)} •••• {m.lastFour} — {m.cardholderName}
              </button>
            ))}
          <button
            type="button"
            className={`saved-card-option${!useSaved ? " selected" : ""}`}
            onClick={() => setUseSaved(false)}
          >
            {t("subscription.payment.newCard")}
          </button>
        </div>
      )}

      <CreditCardVisual
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
        {...visualProps}
      />

      {!useSaved && (
        <div className="form-container">
          <div className="field-container">
            <label htmlFor="cc-name">{t("subscription.payment.name")}</label>
            <input
              id="cc-name"
              ref={nameRef}
              maxLength={20}
              type="text"
              autoComplete="cc-name"
              onChange={(e) => setHolderName(e.target.value)}
              onFocus={() => setFlipped(false)}
            />
          </div>
          <div className="field-container">
            <label htmlFor="cc-number">{t("subscription.payment.number")}</label>
            <input
              id="cc-number"
              ref={numberRef}
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              onFocus={() => setFlipped(false)}
            />
          </div>
          <div className="field-container">
            <label htmlFor="cc-expiry">{t("subscription.payment.expiry")}</label>
            <input
              id="cc-expiry"
              ref={expiryRef}
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              onFocus={() => setFlipped(false)}
            />
          </div>
          <div className="field-container">
            <label htmlFor="cc-cvc">{t("subscription.payment.cvc")}</label>
            <input
              id="cc-cvc"
              ref={cvcRef}
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              onFocus={() => setFlipped(true)}
            />
          </div>
        </div>
      )}

      {!useSaved && (
        <label className="save-card-row">
          <input
            type="checkbox"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
          />
          {t("subscription.payment.saveCard")}
        </label>
      )}

      <div className="pay-actions">
        <button
          type="button"
          className="pay-btn"
          disabled={loading}
          onClick={async () => {
            try {
              await handlePay();
            } catch (err) {
              notifyError(
                t("subscription.checkout.failed"),
                err instanceof Error ? err.message : t("subscription.checkout.failed"),
              );
            }
          }}
        >
          {loading
            ? t("subscription.checkout.processing")
            : t("subscription.payment.pay", { price: priceLabel })}
        </button>
        <p className="demo-hint">{t("subscription.checkout.fakeHint")}</p>
      </div>
    </div>
  );
}
