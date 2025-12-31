import React, { useEffect, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { History, Calendar, Clock, MapPin, Users, Globe, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadListItem, AccountMeeting } from "@/types";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/formatters";

interface MeetingHistoryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: LeadListItem | null;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Completed': return 'text-green-600 bg-green-50 border-green-200';
        case 'Cancelled': return 'text-red-600 bg-red-50 border-red-200';
        case 'Scheduled': return 'text-blue-600 bg-blue-50 border-blue-200';
        default: return 'text-muted-foreground bg-muted border-border';
    }
};

export function MeetingHistoryDrawer({ open, onOpenChange, lead }: MeetingHistoryDrawerProps) {
    const [history, setHistory] = useState<AccountMeeting[]>([]);
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
            const data = await api.getLeadMeetings(lead.lead_id);
            setHistory(data);
        } catch (error) {
            console.error('Failed to fetch meeting history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!lead) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg overflow-y-auto">
                <SheetHeader className="border-b pb-4 mb-6">
                    <SheetTitle className="flex items-center gap-2 text-primary">
                        <History className="h-5 w-5" />
                        Meeting History
                    </SheetTitle>
                    <div className="mt-2 p-3 bg-muted rounded-lg border border-border/50">
                        <h4 className="font-semibold text-sm">{lead.account_name}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            {lead.industry} | {lead.primary_lob}
                        </p>
                    </div>
                </SheetHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Clock className="h-8 w-8 animate-spin mb-2" />
                        <p className="text-sm font-medium">Loading history...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                        <History className="h-10 w-10 mb-4 opacity-10" />
                        <p className="text-sm font-medium">No meeting logs found</p>
                        <p className="text-xs opacity-60">Scheduled meetings will appear here</p>
                    </div>
                ) : (
                    <div className="relative space-y-8 pl-4 border-l border-muted-foreground/20 ml-3 pb-10">
                        {history.map((meeting) => (
                            <div key={meeting.meeting_id} className="relative">
                                {/* Timeline Dot */}
                                <div className={cn(
                                    "absolute -left-[21px] mt-1.5 h-4 w-4 rounded-full border-2 border-background shadow-sm",
                                    meeting.meeting_status === 'Completed' ? 'bg-green-500' :
                                        meeting.meeting_status === 'Scheduled' ? 'bg-blue-500' : 'bg-red-500'
                                )} />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-foreground">
                                                {meeting.meeting_type}
                                            </span>
                                            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground tracking-tight">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(meeting.meeting_date)} at {meeting.meeting_time}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                            getStatusColor(meeting.meeting_status)
                                        )}>
                                            {meeting.meeting_status}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl border bg-card shadow-sm space-y-3 relative overflow-hidden group hover:border-primary/30 transition-colors">
                                        {/* Meeting Mode Indicator */}
                                        <div className="absolute top-0 right-0 p-2 opacity-5">
                                            {meeting.meeting_mode === 'Online' ? <Globe className="h-12 w-12" /> : <MapPin className="h-12 w-12" />}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                {meeting.meeting_mode === 'Online' ? (
                                                    <><Globe className="h-3.5 w-3.5 text-blue-500" /> Online Meeting</>
                                                ) : (
                                                    <><MapPin className="h-3.5 w-3.5 text-red-500" /> In-person</>
                                                )}
                                            </div>
                                            {meeting.city_name && (
                                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                                                    {meeting.city_name}
                                                </div>
                                            )}
                                        </div>

                                        {(meeting.internal_attendees || meeting.customer_attendees) && (
                                            <div className="space-y-2 pt-2 border-t border-muted">
                                                {meeting.internal_attendees && (
                                                    <div className="flex items-start gap-2">
                                                        <Users className="h-3.5 w-3.5 text-primary mt-0.5" />
                                                        <div className="space-y-0.5">
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Internal</p>
                                                            <p className="text-xs">{meeting.internal_attendees}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {meeting.customer_attendees && (
                                                    <div className="flex items-start gap-2">
                                                        <Users className="h-3.5 w-3.5 text-indigo-500 mt-0.5" />
                                                        <div className="space-y-0.5">
                                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customer</p>
                                                            <p className="text-xs">{meeting.customer_attendees}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {meeting.meeting_notes && (
                                            <div className="pt-2 border-t border-muted">
                                                <div className="flex items-start gap-2">
                                                    <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        {meeting.meeting_notes}
                                                    </p>
                                                </div>
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
