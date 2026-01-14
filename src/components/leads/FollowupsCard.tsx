import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Phone, ChevronRight, Clock, User, Search, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { api } from '@/lib/api';

interface Followup {
    lead_id: number;
    account_id: number;
    next_followup_at: string;
    account_name: string;
    primary_contact_name: string;
    contact_phone: string;
    stage_name: string;
    last_call_outcome: string;
    last_call_notes: string;
}

interface FollowupsCardProps {
    onLeadClick?: (leadId: number, accountId: number) => void;
}

export function FollowupsCard({ onLeadClick }: FollowupsCardProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [followups, setFollowups] = useState<Followup[]>([]);
    const [todayCount, setTodayCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchFollowups = async (date?: Date) => {
        setLoading(true);
        try {
            const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined;
            const data = await api.getFollowups(dateStr);
            setFollowups(data.followups);
            setTodayCount(data.todayCount);
        } catch (err) {
            console.error('Error fetching followups:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowups(selectedDate);
    }, [selectedDate]);

    const isToday = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

    // Filter followups by search query
    const filteredFollowups = useMemo(() => {
        if (!searchQuery.trim()) return followups;
        const query = searchQuery.toLowerCase();
        return followups.filter(f =>
            f.account_name.toLowerCase().includes(query) ||
            (f.contact_phone || '').toLowerCase().includes(query) ||
            (f.primary_contact_name || '').toLowerCase().includes(query)
        );
    }, [followups, searchQuery]);

    const getOutcomeColor = (outcome: string) => {
        switch (outcome) {
            case 'Interested': return 'text-emerald-600 bg-emerald-50';
            case 'Call Back Later': return 'text-blue-600 bg-blue-50';
            case 'No Answer': return 'text-slate-600 bg-slate-50';
            case 'Busy': return 'text-amber-600 bg-amber-50';
            case 'Not Interested': return 'text-rose-600 bg-rose-50';
            case 'Wrong Number': return 'text-purple-600 bg-purple-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    return (
        <Card className="border-none shadow-sm bg-white mb-6">
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Header with Today's Count */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Follow-ups</p>
                                <p className="text-[10px] text-muted-foreground">
                                    {isToday ? "Today's scheduled calls" : `Calls for ${format(selectedDate!, 'MMM dd')}`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            <div className="text-center px-4 py-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                                <span className="text-2xl font-bold text-orange-600">{filteredFollowups.length}</span>
                                <p className="text-[9px] text-orange-500 font-medium uppercase tracking-wider">
                                    {isToday ? 'Today' : 'Selected'}
                                </p>
                            </div>
                            {!isToday && (
                                <div className="text-center px-3 py-2 bg-slate-50 rounded-lg border">
                                    <span className="text-lg font-semibold text-slate-600">{todayCount}</span>
                                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Today</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search + Date Picker */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search follow-ups..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-8 h-8 w-[180px] text-xs"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <DatePicker
                            date={selectedDate}
                            onSelect={setSelectedDate}
                            placeholder="Select date"
                            className="w-[150px]"
                        />
                        {!isToday && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => setSelectedDate(new Date())}
                            >
                                Today
                            </Button>
                        )}
                    </div>
                </div>

                {/* Follow-ups List */}
                {loading ? (
                    <div className="mt-4 text-center py-8 text-muted-foreground text-sm">Loading...</div>
                ) : filteredFollowups.length === 0 ? (
                    <div className="mt-4 text-center py-8 text-muted-foreground text-sm">
                        {searchQuery ? 'No follow-ups match your search' : 'No follow-ups scheduled for this date'}
                    </div>
                ) : (
                    <div className="mt-4 grid gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {filteredFollowups.map((followup) => (
                            <div
                                key={followup.lead_id}
                                className="group flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-white to-slate-50/50 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer"
                                onClick={() => onLeadClick?.(followup.lead_id, followup.account_id)}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                                            {followup.account_name}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                            {followup.contact_phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {followup.contact_phone}
                                                </span>
                                            )}
                                            {followup.next_followup_at && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(followup.next_followup_at), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {followup.last_call_outcome && (
                                        <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${getOutcomeColor(followup.last_call_outcome)}`}>
                                            {followup.last_call_outcome}
                                        </span>
                                    )}
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

