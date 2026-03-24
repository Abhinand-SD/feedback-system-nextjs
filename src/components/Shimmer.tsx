export default function Shimmer({ className = "h-20" }: { className?: string }) {
    return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl w-full ${className}`}></div>;
}
