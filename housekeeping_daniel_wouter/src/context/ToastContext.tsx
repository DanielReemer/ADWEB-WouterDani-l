'use client';
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
  } from "react";
  
  type ToastType = "info" | "success" | "error";
  
  interface Toast {
    id: number;
    message: string;
    type: ToastType;
    visible: boolean;
  }
  
  interface ToastContextProps {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
  }
  
  const ToastContext = createContext<ToastContextProps | undefined>(undefined);
  
  export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
  
    const addToast = useCallback(
      (message: string, type: ToastType = "info", duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type, visible: false }]);
        setTimeout(() => {
          setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, visible: true } : t))
          );
        }, 10);
  
        setTimeout(() => {
          setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
          );
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
          }, 300);
        }, duration);
      },
      []
    );
  
    const getClasses = (type: ToastType) => {
      let base =
        "w-full border-l-4 shadow-lg px-4 py-3 rounded-md font-medium transition-all duration-300 pointer-events-auto";
      let color =
        type === "error"
          ? "bg-red-100 border-red-400 text-red-800"
          : type === "success"
          ? "bg-green-100 border-green-400 text-green-800"
          : "bg-gray-100 border-gray-300 text-gray-800";
      return `${base} ${color}`;
    };
  
    return (
      <ToastContext.Provider value={{ addToast }}>
        {children}
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col space-y-3 min-w-[240px] max-w-xs">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`${getClasses(toast.type)} 
                ${
                  toast.visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-4 pointer-events-none"
                }
              `}
              style={{
                willChange: 'opacity, transform'
              }}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    );
  }
  
  export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
      throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
  }