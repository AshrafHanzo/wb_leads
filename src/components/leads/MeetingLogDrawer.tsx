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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { CalendarPlus, MapPin, Users, Globe } from "lucide-react";
import { LeadListItem, CityMaster } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MeetingLogDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: LeadListItem | null;
    onSaveSuccess: () => void;
    defaultMeetingType?: string;
}

export function MeetingLogDrawer({
    open,
    onOpenChange,
    lead,
    onSaveSuccess,
    defaultMeetingType = 'Initial Connect'
}: MeetingLogDrawerProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState<CityMaster[]>([]);

    // Form state
    const [meetingType, setMeetingType] = useState(defaultMeetingType);
    const [meetingMode, setMeetingMode] = useState<'Online' | 'In-Person'>('Online');
    const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
    const [meetingTime, setMeetingTime] = useState('10:00');
    const [meetingCity, setMeetingCity] = useState<string>('');
    const [meetingAddress, setMeetingAddress] = useState('');
    const [internalAttendees, setInternalAttendees] = useState('');
    const [customerAttendees, setCustomerAttendees] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (open) {
            api.getCities().then(setCities).catch(console.error);
            // Reset state
            setMeetingType(defaultMeetingType);
            setMeetingMode('Online');
            setMeetingDate(new Date().toISOString().split('T')[0]);
            setMeetingTime('10:00');
            setMeetingCity('');
            setMeetingAddress('');
            setInternalAttendees('');
            setCustomerAttendees('');
            setNotes('');
        }
    }, [open, defaultMeetingType]);

    const handleSave = async () => {
        if (!lead) return;

        setLoading(true);
        try {
            await api.createMeeting({
                lead_id: lead.lead_id,
                account_id: lead.account_id,
                meeting_type: meetingType,
                meeting_mode: meetingMode,
                meeting_date: meetingDate,
                meeting_time: meetingTime,
                meeting_city: meetingCity ? Number(meetingCity) : undefined,
                meeting_address: meetingMode === 'In-Person' ? meetingAddress : undefined,
                internal_attendees: internalAttendees,
                customer_attendees: customerAttendees,
                meeting_notes: notes,
                meeting_status: 'Scheduled'
            });

            toast({
                title: 'Meeting scheduled successfully',
                description: `${meetingType} set for ${meetingDate} at ${meetingTime}`
            });

            onSaveSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to log meeting:', error);
            toast({
                title: 'Error',
                description: 'Failed to schedule meeting',
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
                    <SheetTitle className="flex items-center gap-2 text-primary">
                        <CalendarPlus className="h-5 w-5" />
                        Log Meeting ({meetingType})
                    </SheetTitle>
                    <div className="mt-2 p-3 bg-muted rounded-lg border border-border/50">
                        <h4 className="font-semibold text-sm">{lead.account_name}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            {lead.industry} | {lead.primary_lob}
                        </p>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Meeting Type</Label>
                            <Select value={meetingType} onValueChange={setMeetingType}>
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Initial Connect">Initial Connect</SelectItem>
                                    <SelectItem value="Demo Meeting">Demo Meeting</SelectItem>
                                    <SelectItem value="Follow-up Meeting">Follow-up Meeting</SelectItem>
                                    <SelectItem value="Proposal Presentation">Proposal Presentation</SelectItem>
                                    <SelectItem value="Closure Meeting">Closure Meeting</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Mode</Label>
                            <div className="flex bg-muted p-0.5 rounded-md h-9">
                                <button
                                    type="button"
                                    onClick={() => setMeetingMode('Online')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-sm transition-all ${meetingMode === 'Online' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Globe className="h-3 w-3" />
                                    Online
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMeetingMode('In-Person')}
                                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-sm transition-all ${meetingMode === 'In-Person' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <MapPin className="h-3 w-3" />
                                    In-Person
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Date</Label>
                            <Input
                                type="date"
                                className="h-9"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground">Time</Label>
                            <Input
                                type="time"
                                className="h-9"
                                value={meetingTime}
                                onChange={(e) => setMeetingTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {meetingMode === 'In-Person' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">City</Label>
                                <Select value={meetingCity} onValueChange={setMeetingCity}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select city..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities.map(city => (
                                            <SelectItem key={city.city_id} value={city.city_id.toString()}>
                                                {city.city_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Address/Location</Label>
                                <Input
                                    placeholder="Enter meeting venue"
                                    className="h-9"
                                    value={meetingAddress}
                                    onChange={(e) => setMeetingAddress(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold flex items-center gap-1.5 uppercase text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                Internal Attendees
                            </Label>
                            <Input
                                placeholder="e.g. Senthil, Janani"
                                className="h-9"
                                value={internalAttendees}
                                onChange={(e) => setInternalAttendees(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold flex items-center gap-1.5 uppercase text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                Customer Attendees
                            </Label>
                            <Input
                                placeholder="e.g. Operations Head, Finance Head"
                                className="h-9"
                                value={customerAttendees}
                                onChange={(e) => setCustomerAttendees(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground">Meeting Agenda/Notes</Label>
                        <Textarea
                            placeholder="What is the objective of this meeting?"
                            className="min-h-[100px] resize-none text-sm"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <SheetFooter className="p-6 bg-background border-t">
                    <Button
                        className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Scheduling...' : 'SCHEDULE MEETING'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
