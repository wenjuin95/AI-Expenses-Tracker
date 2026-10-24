import { useMemo } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import type { ChartData } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { Receipt } from '../types/expenses';

// Register the required Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseChartProps {
    expenses: Receipt[];
}

export default function ExpenseChart({ expenses }: ExpenseChartProps) {
    // Process data to group totals by category
    const chartData = useMemo(() => {
        const categoryTotals = expenses.reduce((acc, expense) => {
            const category = expense.category || 'Uncategorized';
            // Only sum positive amounts, defaulting to 0 if undefined
            const amount = Math.max(0, expense.total_amount || 0);

            acc[category] = (acc[category] || 0) + amount;
            return acc;
        }, {} as Record<string, number>);

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        return {
            labels,
            datasets: [
                {
                    label: 'Total Spent',
                    data,
                    backgroundColor: [
                        '#3b82f6', // blue-500
                        '#10b981', // emerald-500
                        '#f59e0b', // amber-500
                        '#ef4444', // red-500
                        '#8b5cf6', // violet-500
                        '#ec4899', // pink-500
                        '#64748b', // slate-500
                    ],
                    borderWidth: 1,
                    hoverOffset: 4
                }
            ]
        } as ChartData<'doughnut'>;
    }, [expenses]);

    // If there are no expenses with amounts, don't render the chart
    if (expenses.length === 0 || chartData.datasets[0].data.length === 0) {
        return null;
    }

    const totalSpent = chartData.datasets[0].data.reduce((a, b) => a + b, 0);

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 max-w-62.5">
                <Doughnut
                    data={chartData}
                    options={{
                        responsive: true,
                        cutout: '70%',
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    usePointStyle: true,
                                    padding: 20,
                                    font: { size: 12 }
                                }
                            }
                        }
                    }}
                />
            </div>

            <div className="w-full md:w-1/2">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Spending Breakdown</h3>
                <p className="text-3xl font-bold text-blue-600 mb-6">
                    {/* Assuming RM as base currency from your ManualEntry setup */}
                    RM {totalSpent.toFixed(2)}
                </p>

                <div className="space-y-3">
                    {chartData.labels?.map((label, index) => {
                        const amount = chartData.datasets[0].data[index];
                        const percentage = ((amount / totalSpent) * 100).toFixed(1);
                        const color = chartData.datasets[0].backgroundColor?.[index as number] as string;

                        return (
                            <div key={label as string} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                                    <span className="font-medium text-slate-700">{label as string}</span>
                                </div>
                                <div className="text-slate-500">
                                    {percentage}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
