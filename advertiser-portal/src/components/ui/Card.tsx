interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      {children}
    </div>
  );
}
