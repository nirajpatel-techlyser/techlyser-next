interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export default function Tag({ children, className = "" }: TagProps) {
  return (
    <span
      className={`rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ${className}`}
    >
      {children}
    </span>
  );
}
