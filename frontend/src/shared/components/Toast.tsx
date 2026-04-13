import type { ToastType } from "../context/ToastContext.tsx";
import { AlertCircle, AlertTriangle, CheckCircle, X } from "lucide-react";

type ToastProps = {
  type: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
};

const icons = {
  success: <CheckCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <AlertCircle size={18} />,
};

export default function Toast({ type, title, message, onClose }: ToastProps) {
  return (
    <div className={`toast toast--${type}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-content">
        <p className="toast-title">{title}</p>
        {message && <p className="toast-message">{message}</p>}
      </div>
      <button className="toast-close" onClick={onClose} type="button">
        <X size={14} />
      </button>
    </div>
  );
}
