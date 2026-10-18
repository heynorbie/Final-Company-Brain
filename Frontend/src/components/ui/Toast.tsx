import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { cn, uid } from '@/lib/utils';

type ToastKind = 'success' | 'warning' | 'error' | 'info';
interface Toast { id: string; kind: ToastKind; title: string; description?: string }
interface ToastCtx { push: (t: Omit<Toast, 'id'>) => void }

const Ctx = createContext<ToastCtx | null>(null);

const icons: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};
const tones: Record<ToastKind, string> = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = uid('t');
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
          {toasts.map((t) => {
            const Icon = icons[t.kind];
            return (
              <div key={t.id} className="card flex items-start gap-3 p-3.5 animate-slide-in shadow-glow">
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', tones[t.kind])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-xs text-muted">{t.description}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="btn-ghost -m-1 p-1 rounded">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
