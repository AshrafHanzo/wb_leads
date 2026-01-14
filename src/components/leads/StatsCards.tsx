import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Calendar, BarChart3, RotateCcw, Phone } from "lucide-react";

interface StatsCardsProps {
    stats: {
        today: number;
        yesterday: number;
        thisWeek: number;
        thisMonth: number;
        callsToday?: number;
        outcomes?: {
            noAnswer: number;
            busy: number;
            callback: number;
            interested: number;
            notInterested: number;
            wrongNumber: number;
        };
    };
    loading?: boolean;
    title?: string;
    showCallStats?: boolean;
}

export function StatsCards({ stats, loading, showCallStats }: StatsCardsProps) {
    const items = [
        { label: "Today", value: stats.today, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Yesterday", value: stats.yesterday, icon: RotateCcw, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "This Week", value: stats.thisWeek, icon: Calendar, color: "text-green-600", bg: "bg-green-50" },
        { label: "This Month", value: stats.thisMonth, icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((item) => (
                    <Card key={item.label} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                                <div className="flex items-baseline gap-1">
                                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                                        {loading ? "..." : item.value}
                                    </h3>
                                    <span className="text-[10px] text-muted-foreground font-normal">Leads</span>
                                </div>
                            </div>
                            <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Call Activity Today */}
            {showCallStats && stats.callsToday !== undefined && (
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold">Call Activity Today</p>
                                    <p className="text-[10px] text-muted-foreground">Total: {stats.callsToday} calls done</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 flex-1">
                                {[
                                    { label: 'No Answer', value: stats.outcomes?.noAnswer, bg: 'from-white to-slate-50/50', border: 'border-slate-100', text: 'text-slate-600' },
                                    { label: 'Busy', value: stats.outcomes?.busy, bg: 'from-white to-amber-50/30', border: 'border-amber-100/50', text: 'text-amber-600' },
                                    { label: 'Call Back', value: stats.outcomes?.callback, bg: 'from-white to-blue-50/30', border: 'border-blue-100/50', text: 'text-blue-600' },
                                    { label: 'Interested', value: stats.outcomes?.interested, bg: 'from-white to-emerald-50/30', border: 'border-emerald-100/50', text: 'text-emerald-600' },
                                    { label: 'Not Int.', value: stats.outcomes?.notInterested, bg: 'from-white to-rose-50/30', border: 'border-rose-100/50', text: 'text-rose-600' },
                                    { label: 'Wrong No.', value: stats.outcomes?.wrongNumber, bg: 'from-white to-purple-50/30', border: 'border-purple-100/50', text: 'text-purple-600' }
                                ].map((box) => (
                                    <div key={box.label} className={`group/stat relative overflow-hidden bg-gradient-to-b ${box.bg} p-2.5 rounded-lg border ${box.border} shadow-[0_1px_2px_rgba(0,0,0,0,03)] hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center min-w-[100px]`}>
                                        <span className="text-[8px] uppercase text-slate-400 font-bold tracking-wider mb-1 text-center">{box.label}</span>
                                        <span className={`text-base font-black ${box.value > 0 ? box.text : 'text-slate-300'}`}>{box.value || 0}</span>
                                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-current opacity-0 group-hover/stat:opacity-20 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
