import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCards } from '@/components/leads/StatsCards';
import { Calendar, Clock, MapPin, User, Users, Phone, Mail, ExternalLink, CheckCircle2, XCircle, CalendarClock } from 'lucide-react';
import { format, isToday, isTomorrow, isAfter, isBefore, addDays, startOfToday, endOfToday, startOfTomorrow, endOfTomorrow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AccountMeeting } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function Meetings() {
    const { toast } = useToast();
    const [meetings, setMeetings] = useState<AccountMeeting[]>([]);
    const [stats, setStats] = useState({ today: 0, yesterday: 0, thisWeek: 0, thisMonth: 0 });
    const [statsLoading, setStatsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<AccountMeeting | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [rescheduling, setRescheduling] = useState(false);
    const limit = 10;

    const fetchMeetings = async () => {
        try {
            const data = await api.getAllMeetings();
            setMeetings(data);
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const data = await api.getMeetingStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
        fetchStats();
    }, []);

    const handleStatusUpdate = async (id: number, status: 'Completed' | 'Cancelled') => {
        try {
            await api.updateMeetingStatus(id, status);
            toast({
                title: `Meeting ${status}`,
                description: `Status updated successfully.`
            });
            fetchMeetings();
            fetchStats();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update meeting status',
                variant: 'destructive'
            });
        }
    };

    const handleReschedule = async () => {
        if (!selectedMeeting || !newDate || !newTime) return;
        setRescheduling(true);
        try {
            await api.rescheduleMeeting(selectedMeeting.meeting_id, newDate, newTime);
            toast({
                title: 'Meeting Rescheduled',
                description: `New schedule: ${format(new Date(newDate), 'PPP')} at ${newTime}`
            });
            setRescheduleDialogOpen(false);
            fetchMeetings();
            fetchStats();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to reschedule meeting',
                variant: 'destructive'
            });
        } finally {
            setRescheduling(false);
        }
    };

    const filteredMeetings = useMemo(() => {
        const today = startOfToday();
        const tomorrow = startOfTomorrow();

        return meetings.filter(m => {
            const meetingDate = new Date(m.meeting_date);
            if (filter === 'today') return isToday(meetingDate);
            if (filter === 'tomorrow') return isTomorrow(meetingDate);
            if (filter === 'next_week') {
                return isAfter(meetingDate, endOfTomorrow()) && isBefore(meetingDate, addDays(today, 9));
            }
            return true;
        });
    }, [meetings, filter]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredMeetings.slice(start, start + limit);
    }, [filteredMeetings, page]);

    const columns: Column<AccountMeeting>[] = [
        {
            key: 'account_name',
            header: 'Account / Lead',
            render: (row: any) => (
                <div className="flex flex-col">
                    <div className="font-medium text-primary flex items-center gap-1.5">
                        {row.account_name}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link to={`/accounts/${row.account_id}`}>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>View Account Details</TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="text-xs text-foreground font-semibold flex items-center gap-1 mt-0.5">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {row.contact_name || 'N/A'}
                    </div>
                    <div className="text-[10px] text-muted-foreground italic">
                        {row.meeting_type}
                    </div>
                </div>
            )
        },
        {
            key: 'meeting_date',
            header: 'Schedule',
            render: (row) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(row.meeting_date), 'PPP')}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {row.meeting_time} ({row.meeting_mode})
                    </div>
                </div>
            )
        },
        {
            key: 'location',
            header: 'Location/City',
            render: (row) => (
                <div className="flex items-center gap-1.5 text-xs">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {row.meeting_mode === 'Online' ? 'Online Meeting' : (row.city_name || row.meeting_address || 'N/A')}
                </div>
            )
        },
        {
            key: 'attendees',
            header: 'Attendees',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[10px]" title="Internal Attendees">
                        <User className="h-3 w-3 text-blue-500" />
                        <span className="truncate max-w-[120px]">{row.internal_attendees || 'None specified'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]" title="Customer Attendees">
                        <Users className="h-3 w-3 text-green-500" />
                        <span className="truncate max-w-[120px]">{row.customer_attendees || 'None specified'}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'contact',
            header: 'Contact',
            render: (row: any) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[10px]">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {row.contact_phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {row.contact_email}
                    </div>
                </div>
            )
        },
        {
            key: 'meeting_status',
            header: 'Status',
            render: (row) => {
                const colors = {
                    'Scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
                    'Completed': 'bg-green-50 text-green-700 border-green-200',
                    'Cancelled': 'bg-red-50 text-red-700 border-red-200'
                };
                return (
                    <Badge variant="outline" className={colors[row.meeting_status as keyof typeof colors] || ''}>
                        {row.meeting_status}
                    </Badge>
                );
            }
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-1">
                    {row.meeting_status === 'Scheduled' && (
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7 border-green-200 text-green-600 hover:bg-green-50"
                                        onClick={() => handleStatusUpdate(row.meeting_id, 'Completed')}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mark as Completed</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7 border-red-200 text-red-500 hover:bg-red-50"
                                        onClick={() => handleStatusUpdate(row.meeting_id, 'Cancelled')}
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancel Meeting</TooltipContent>
                            </Tooltip>
                        </>
                    )}
                    {(row.meeting_status === 'Cancelled' || row.meeting_status === 'Scheduled') && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 border-blue-200 text-blue-600 hover:bg-blue-50"
                                    onClick={() => {
                                        setSelectedMeeting(row);
                                        setNewDate(new Date(row.meeting_date).toISOString().split('T')[0]);
                                        setNewTime(row.meeting_time);
                                        setRescheduleDialogOpen(true);
                                    }}
                                >
                                    <CalendarClock className="h-3.5 w-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reschedule Meeting</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            )
        }
    ];

    return (
        <AppLayout>
            <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">Account Meetings</h1>
                        <p className="text-sm text-muted-foreground">Central tracking for all customer meetings and engagements</p>
                    </div>
                </div>

                <StatsCards stats={stats} loading={statsLoading} title="Meetings" />

                <div className="flex flex-col gap-4">
                    <Tabs value={filter} onValueChange={setFilter} className="w-full">
                        <TabsList className="bg-muted/50 p-1 h-9">
                            <TabsTrigger value="all" className="text-xs h-7">All Meetings</TabsTrigger>
                            <TabsTrigger value="today" className="text-xs h-7">Today</TabsTrigger>
                            <TabsTrigger value="tomorrow" className="text-xs h-7">Tomorrow</TabsTrigger>
                            <TabsTrigger value="next_week" className="text-xs h-7">Next 7 Days</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <DataTable
                        columns={columns}
                        data={paginatedData}
                        total={filteredMeetings.length}
                        page={page}
                        limit={limit}
                        onPageChange={setPage}
                        loading={loading}
                        emptyMessage="No meetings found for the selected period"
                    />
                </div>

                <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CalendarClock className="h-5 w-5 text-primary" />
                                Reschedule Meeting
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">New Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">New Time</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setRescheduleDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleReschedule} disabled={rescheduling}>
                                {rescheduling ? "Rescheduling..." : "Save New Schedule"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
