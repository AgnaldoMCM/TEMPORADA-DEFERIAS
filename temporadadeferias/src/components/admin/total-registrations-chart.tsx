
"use client";

import { Progress } from "@/components/ui/progress";

interface TotalRegistrationsChartProps {
    total: number;
    goal: number;
}

export function TotalRegistrationsChart({ total, goal }: TotalRegistrationsChartProps) {
    const progressPercentage = goal > 0 ? (total / goal) * 100 : 0;

    return (
        <Progress value={progressPercentage} className="mt-2" />
    );
}
// Trigger commit
