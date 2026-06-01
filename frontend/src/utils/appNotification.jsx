import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { pushToast } from "./toastBus";

/** Above operator/admin modals (z-2000) and player (z-1200). */
const MODAL_Z_INDEX = 10100;

export function notifySuccess(title, message) {
  pushToast({ type: "success", title, message });
}

export function notifyError(title, message) {
  pushToast({ type: "error", title, message });
}

export function notifyInfo(title, message) {
  pushToast({ type: "info", title, message });
}

export function notifyWarning(title, message) {
  pushToast({ type: "warning", title, message });
}

/** @returns {Promise<boolean>} */
export function confirmAction({
  title,
  content,
  okText,
  cancelText,
  danger = false,
}) {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      content,
      centered: true,
      zIndex: MODAL_Z_INDEX,
      maskClosable: true,
      okText,
      cancelText,
      okButtonProps: danger ? { danger: true } : undefined,
      className: "soundbloom-confirm",
      icon: (
        <ExclamationCircleOutlined
          style={{ color: danger ? "#f87171" : "#EE10B0" }}
        />
      ),
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}
