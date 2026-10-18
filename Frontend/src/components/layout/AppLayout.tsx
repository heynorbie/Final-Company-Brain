import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [spotlightVisible, setSpotlightVisible] = useState(false);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth < 1024) setCollapsed(false); };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let rafId = 0;
    let lastX = 0;
    let lastY = 0;
    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (!spotlightVisible) setSpotlightVisible(true);
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const el = spotlightRef.current;
        if (el) el.style.transform = `translate(${lastX}px, ${lastY}px) translate(-50%, -50%)`;
      });
    };
    const onLeave = () => setSpotlightVisible(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [spotlightVisible]);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Cursor spotlight — soft radial glow following the pointer */}
      <div
        ref={spotlightRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] h-[220px] w-[220px] rounded-full opacity-0 transition-opacity duration-500"
        style={{
          transform: 'translate(-50%, -50%)',
          opacity: spotlightVisible ? 1 : 0,
          background: 'radial-gradient(circle, rgb(var(--primary) / 0.22) 0%, rgb(var(--primary) / 0.12) 45%, transparent 75%)',
          mixBlendMode: 'screen',
        }}
      />

      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full animate-slide-in">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuToggle={() => setMobileOpen(true)} sidebarCollapsed={collapsed} />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
