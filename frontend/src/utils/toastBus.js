let nextId = 0;
const listeners = new Set();

export function subscribeToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushToast(toast) {
  const item = {
    id: ++nextId,
    duration: 6000,
    ...toast,
  };
  listeners.forEach((listener) => listener(item));
  return item.id;
}

export function dismissToast(id) {
  listeners.forEach((listener) => listener({ type: "dismiss", id }));
}
