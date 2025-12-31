import React, { useState } from 'react';
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
import { Phone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadListItem } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
    'Not Interested'
];

export function CallLogDrawer({ open, onOpenChange, lead, onSaveSuccess }: CallLogDrawerProps) {
    const { toast } = useToast();
    const { currentUser } = useAuth();
    const [outcome, setOutcome] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [followupRequired, setFollowupRequired] = useState(false);
    const [followupDate, setFollowupDate] = useState('');
    const [loading, setLoading] = useState(false);

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
