export function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div className="fade-up" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
