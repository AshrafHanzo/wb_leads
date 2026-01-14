import React, { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Phone, CheckCircle2, History, Calendar, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadListItem, TelecallLog } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/formatters";

interface CallLogDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: LeadListItem | null;
    onSaveSuccess: () => void;
}

const outcomes = [
    'No Answer',
    'Busy',
    'Call Back Later',
    'Interested',
    'Not Interested',
    'Wrong Number'
];

const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
        case 'Interested': return 'text-green-600 bg-green-50 border-green-200';
        case 'Not Interested': return 'text-red-600 bg-red-50 border-red-200';
        case 'Busy': return 'text-amber-600 bg-amber-50 border-amber-200';
        case 'No Answer': return 'text-gray-600 bg-gray-50 border-gray-200';
        case 'Call Back Later': return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'Wrong Number': return 'text-purple-600 bg-purple-50 border-purple-200';
        default: return 'text-muted-foreground bg-muted border-border';
    }
};

export function CallLogDrawer({ open, onOpenChange, lead, onSaveSuccess }: CallLogDrawerProps) {
    const { toast } = useToast();
    const { currentUser } = useAuth();
    const [outcome, setOutcome] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [followupRequired, setFollowupRequired] = useState(false);
    const [followupDate, setFollowupDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [callHistory, setCallHistory] = useState<TelecallLog[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Fetch call history when drawer opens
    useEffect(() => {
        if (open && lead) {
            fetchCallHistory();
        }
    }, [open, lead]);

    const fetchCallHistory = async () => {
        if (!lead) return;
        setHistoryLoading(true);
        try {
            const data = await api.getLeadCalls(lead.lead_id);
            setCallHistory(data);
        } catch (error) {
            console.error('Failed to fetch call history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSave = async () => {
        if (!lead || !currentUser || !outcome) return;

        setLoading(true);
        try {
            await api.logCall({
                lead_id: lead.lead_id,
                account_id: lead.account_id,
                telecaller_user_id: currentUser.user_id,
                call_outcome: outcome,
                notes,
                followup_required: followupRequired,
                followup_datetime: followupRequired ? followupDate : undefined,
            });

            toast({
                title: 'Call logged successfully',
                description: `Outcome: ${outcome}`
            });

            // Reset state
            setOutcome('');
            setNotes('');
            setFollowupRequired(false);
            setFollowupDate('');

            // Refresh call history
            await fetchCallHistory();

            onSaveSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to log call:', error);
            toast({
                title: 'Error',
                description: 'Failed to log call data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!lead) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md p-0 flex flex-col h-full">
                <SheetHeader className="border-b px-6 py-4">
                    <SheetTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        Log Call
                    </SheetTitle>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-sm">{lead.account_name}</h4>
                        <p className="text-xs text-muted-foreground">{lead.contact_phone}</p>
                        <p className="text-[10px] mt-1 text-muted-foreground font-medium uppercase tracking-wider">
                            {lead.industry} | {lead.primary_lob}
                        </p>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Outcome Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Call Outcome</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {outcomes.map((o) => (
                                <button
                                    key={o}
                                    type="button"
                                    className={cn(
                                        "flex items-center justify-between p-2.5 rounded-md border text-left transition-all",
                                        outcome === o
                                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                            : "border-input hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => {
                                        setOutcome(o);
                                        if (o === 'Call Back Later') {
                                            setFollowupRequired(true);
                                            const tomorrow = new Date();
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            setFollowupDate(tomorrow.toISOString().slice(0, 16));
                                        }
                                    }}
                                >
                                    <span className="text-xs font-medium">{o}</span>
                                    {outcome === o && <CheckCircle2 className="h-3.5 w-3.5" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="call_notes" className="text-sm font-semibold">Notes</Label>
                        <Textarea
                            id="call_notes"
                            placeholder="What happened during the call?"
                            className="min-h-[120px] resize-none"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {/* Follow-up */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="followup_toggle" className="text-sm font-medium cursor-pointer">
                                Schedule Follow-up
                            </Label>
                            <input
                                type="checkbox"
                                id="followup_toggle"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={followupRequired}
                                onChange={(e) => {
                                    setFollowupRequired(e.target.checked);
                                    if (e.target.checked && !followupDate) {
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        setFollowupDate(tomorrow.toISOString().slice(0, 16));
                                    }
                                }}
                            />
                        </div>

                        {followupRequired && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="followup_date" className="text-xs text-muted-foreground">Follow-up Date & Time</Label>
                                <Input
                                    id="followup_date"
                                    type="datetime-local"
                                    value={followupDate}
                                    onChange={(e) => setFollowupDate(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Call History Section */}
                    <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-semibold">Call History</Label>
                        </div>

                        {historyLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Clock className="h-6 w-6 animate-spin mb-2" />
                                <p className="text-xs">Loading history...</p>
                            </div>
                        ) : callHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center bg-muted/30 rounded-lg">
                                <History className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-xs font-medium">No call logs yet</p>
                                <p className="text-[10px] opacity-70">Call logs will appear here</p>
                            </div>
                        ) : (
                            <div className="relative space-y-4 pl-4 border-l-2 border-muted ml-1 pb-2 max-h-[250px] overflow-y-auto">
                                {callHistory.map((log) => (
                                    <div key={log.call_id} className="relative">
                                        {/* Timeline Dot */}
                                        <div className="absolute -left-[21px] mt-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-sm" />

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(log.call_datetime)}
                                                </div>
                                                <div className={cn(
                                                    "px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight border",
                                                    getOutcomeColor(log.call_outcome)
                                                )}>
                                                    {log.call_outcome}
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-lg border bg-card/50 shadow-sm space-y-1.5">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    {log.telecaller_name}
                                                </div>

                                                {log.notes && (
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                                                        "{log.notes}"
                                                    </p>
                                                )}

                                                {log.followup_datetime && (
                                                    <div className="pt-1.5 mt-1.5 border-t flex items-center gap-1.5 text-[10px] font-medium text-blue-600">
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
                    </div>
                </div>

                <SheetFooter className="p-6 bg-background border-t">
                    <Button
                        className="w-full h-11"
                        onClick={handleSave}
                        disabled={!outcome || loading}
                    >
                        {loading ? 'Saving...' : 'SAVE CALL'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
