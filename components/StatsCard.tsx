import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    textColor?: string;
    className?: string;
}

export function StatsCard({ title, value, textColor = "text-gray-900", className }: StatsCardProps) {
    return (
        <div className={cn("bg-white rounded-xl p-4 shadow-sm border border-gray-100", className)}>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
            <div className={cn("text-2xl font-bold", textColor)}>{value}</div>
        </div>
    );
}
