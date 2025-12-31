import React, { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { History, Calendar, User, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadListItem, TelecallLog } from "@/types";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/formatters";

interface CallHistoryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: LeadListItem | null;
}

const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
        case 'Interested': return 'text-green-600 bg-green-50 border-green-200';
        case 'Not Interested': return 'text-red-600 bg-red-50 border-red-200';
        case 'Busy': return 'text-amber-600 bg-amber-50 border-amber-200';
        case 'No Answer': return 'text-gray-600 bg-gray-50 border-gray-200';
        case 'Call Back Later': return 'text-blue-600 bg-blue-50 border-blue-200';
        default: return 'text-muted-foreground bg-muted border-border';
    }
};

export function CallHistoryDrawer({ open, onOpenChange, lead }: CallHistoryDrawerProps) {
    const [history, setHistory] = useState<TelecallLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && lead) {
            fetchHistory();
        }
    }, [open, lead]);

    const fetchHistory = async () => {
        if (!lead) return;
        setLoading(true);
        try {
            const data = await api.getLeadCalls(lead.lead_id);
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch call history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!lead) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader className="border-b pb-4 mb-6">
                    <SheetTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Call History
                    </SheetTitle>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-sm">{lead.account_name}</h4>
                        <p className="text-xs text-muted-foreground">{lead.contact_phone}</p>
                    </div>
                </SheetHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Clock className="h-8 w-8 animate-spin mb-2" />
                        <p className="text-sm">Loading history...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                        <History className="h-10 w-10 mb-4 opacity-20" />
                        <p className="text-sm font-medium">No call logs found</p>
                        <p className="text-xs opacity-70">New call logs will appear here</p>
                    </div>
                ) : (
                    <div className="relative space-y-6 pl-4 border-l-2 border-muted ml-2 pb-10">
                        {history.map((log) => (
                            <div key={log.call_id} className="relative">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[25px] mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary shadow-sm" />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(log.call_datetime)}
                                        </div>
                                        <div className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border",
                                            getOutcomeColor(log.call_outcome)
                                        )}>
                                            {log.call_outcome}
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-lg border bg-card/50 shadow-sm space-y-2">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            {log.telecaller_name}
                                        </div>

                                        {log.notes && (
                                            <p className="text-xs text-muted-foreground leading-relaxed italic">
                                                "{log.notes}"
                                            </p>
                                        )}

                                        {log.followup_datetime && (
                                            <div className="pt-2 mt-2 border-t flex items-center gap-1.5 text-[10px] font-medium text-blue-600">
                                                <Clock className="h-3 w-3" />
                                                Next Follow-up: {formatDate(log.followup_datetime)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
