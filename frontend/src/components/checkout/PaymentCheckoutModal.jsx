import { useCallback, useEffect, useState } from "react";
import { Modal, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import CreditCardCheckoutForm from "./CreditCardCheckoutForm";
import { fetchPaymentMethods, fakeCheckout } from "../../api/subscriptionApi";
import { notifyError, notifySuccess } from "../../utils/appNotification";
import { isDarkTheme } from "../../theme/initTheme";

export default function PaymentCheckoutModal({
  open,
  plan,
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState([]);
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [dark, setDark] = useState(() => isDarkTheme());

  const loadMethods = useCallback(async () => {
    setMethodsLoading(true);
    try {
      const list = await fetchPaymentMethods();
      setMethods(Array.isArray(list) ? list : []);
    } catch {
      setMethods([]);
    } finally {
      setMethodsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadMethods();
    }
  }, [open, loadMethods]);

  useEffect(() => {
    const syncTheme = () => setDark(isDarkTheme());
    syncTheme();
    window.addEventListener("soundbloom-theme-change", syncTheme);
    return () => window.removeEventListener("soundbloom-theme-change", syncTheme);
  }, [open]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
      const data = await fakeCheckout({
        plan,
        months: 1,
        ...payload,
      });
      notifySuccess(t("subscription.checkout.success"), data.message);
      onSuccess?.(data);
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : t("subscription.checkout.failed");
      notifyError(t("subscription.checkout.failed"), msg);
    } finally {
      setLoading(false);
    }
  };

  const modalBg = dark ? "#111113" : "#f9f9f9";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      destroyOnClose
      title={null}
      className="payment-checkout-modal"
      styles={{
        content: {
          background: modalBg,
          borderRadius: 16,
          padding: "20px 16px 24px",
          border: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
        },
        body: { padding: 0, background: modalBg },
        mask: { backdropFilter: "blur(4px)" },
      }}
    >
      {methodsLoading ? (
        <div className="flex min-h-[280px] items-center justify-center py-12">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 28, color: "#EE10B0" }} spin />} />
        </div>
      ) : (
        <CreditCardCheckoutForm
          key={`${plan}-${methods.map((m) => m.id).join(",")}`}
          plan={plan}
          savedMethods={methods}
          loading={loading}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  );
}
