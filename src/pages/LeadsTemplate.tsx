import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Pencil,
    Trash2,
    Phone,
    CalendarPlus,
    MoreHorizontal,
    Filter,
    Search,
    XCircle,
    RotateCcw,
    CheckCircle2,
    Ban,
    History,
    Upload,
    FileSpreadsheet,
    AlertCircle,
    Calendar
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CompactModal } from '@/components/common/CompactModal';
import { DatePicker } from '@/components/ui/date-picker';
import { CallLogDrawer } from '@/components/leads/CallLogDrawer';
import { CallHistoryDrawer } from '@/components/leads/CallHistoryDrawer';
import { MeetingLogDrawer } from '@/components/leads/MeetingLogDrawer';
import { MeetingHistoryDrawer } from '@/components/leads/MeetingHistoryDrawer';
import { StatsCards } from '@/components/leads/StatsCards';
import { FollowupsCard } from '@/components/leads/FollowupsCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LeadListItem, Lead, LeadSource, LeadWithDetails } from '@/types';
import {
    mockLeads,
    mockAccounts,
    mockUsers,
    mockLeadStages,
    mockLeadStatuses,
    mockIndustryMaster,
    mockLeadSourceMaster,
    getLeadWithDetails
} from '@/lib/mockData';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

const callOutcomes = [
    'Called - No Answer',
    'Called - Not Interested',
    'Called - Interested',
    'Called - Wrong Number',
    'Called - Meeting Scheduled'
];

// CSV Parser Helper - handles multi-line quoted values, escaped quotes, etc.
const parseCSV = (text: string): any[] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    // Process character by character to handle all edge cases
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    // Escaped quote ("") - add single quote and skip next
                    currentValue += '"';
                    i++;
                } else {
                    // End of quoted field
                    inQuotes = false;
                }
            } else {
                currentValue += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentValue.trim());
                currentValue = '';
            } else if (char === '\r' && nextChar === '\n') {
                currentRow.push(currentValue.trim());
                rows.push(currentRow);
                currentRow = [];
                currentValue = '';
                i++; // Skip \n
            } else if (char === '\n') {
                currentRow.push(currentValue.trim());
                rows.push(currentRow);
                currentRow = [];
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
    }

    // Don't forget the last value/row
    if (currentValue || currentRow.length > 0) {
        currentRow.push(currentValue.trim());
        rows.push(currentRow);
    }

    if (rows.length === 0) return [];

    // First row is headers - trim and clean them
    const headers = rows[0].map(h => h.trim().replace(/^\"|\"$/g, ''));

    // Convert remaining rows to objects
    const result: any[] = [];
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        // Skip empty rows
        if (row.length === 0 || (row.length === 1 && !row[0])) continue;

        const obj: any = {};
        headers.forEach((header, index) => {
            if (header && index < row.length) {
                obj[header] = row[index];
            }
        });

        if (Object.keys(obj).length > 0) {
            result.push(obj);
        }
    }

    return result;
};

// Lead form data type that includes account fields
type LeadFormData = Partial<Lead> & {
    account_name?: string;
    industry?: string;
    head_office?: string;
    location?: string;
    company_website?: string;
    primary_contact_name?: string;
    contact_person_role?: string;
    contact_phone?: string;
    contact_email?: string;
    company_phone?: string;
    call_status?: string;
};

interface LeadsTemplateProps {
    title: string;
    description: string;
    allowedStageIds: number[];
    showDEColumn?: boolean;
    hideGeneratedBy?: boolean;
    hideSourceFrom?: boolean;
    hideStatusColumn?: boolean;
    hideActions?: boolean;
    hideEditAction?: boolean;
    hideDeleteAction?: boolean;
    showProductSelection?: boolean;
    // Stage-specific props used by different pages
    showTelecallingColumns?: boolean;
    showMeetingColumns?: boolean;
    meetingType?: string;
    showPOCColumns?: boolean;
    showProposalColumns?: boolean;
    showWonColumns?: boolean;
    showIndustryFilter?: boolean;
    showLOBFilter?: boolean;
    showCityFilter?: boolean;
    showProductFilter?: boolean;
    hideStageFilter?: boolean;
    hideSourceFilter?: boolean;
    showQuickCallActions?: boolean;
    showOutcomeFilter?: boolean;
    showCallStats?: boolean;
}

export function LeadsTemplate({
    title,
    description,
    allowedStageIds,
    showDEColumn,
    hideGeneratedBy,
    hideSourceFrom,
    hideStatusColumn,
    hideActions = true,
    hideEditAction,
    hideDeleteAction,
    showProductSelection,
    showTelecallingColumns,
    showMeetingColumns,
    meetingType,
    showPOCColumns,
    showProposalColumns,
    showWonColumns,
    showIndustryFilter,
    showLOBFilter,
    showCityFilter,
    showProductFilter,
    hideStageFilter,
    hideSourceFilter,
    showQuickCallActions,
    showOutcomeFilter,
    showCallStats
}: LeadsTemplateProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { hasPermission, currentUser } = useAuth();
    const [bulkDEAssignedTo, setBulkDEAssignedTo] = useState<string>('');
    const [leads, setLeads] = useState<LeadListItem[]>([]);
    const [stats, setStats] = useState({ today: 0, yesterday: 0, thisWeek: 0, thisMonth: 0 });
    const [statsLoading, setStatsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('all');
    const [sourceFilter, setSourceFilter] = useState<string>('all');
    const [industryFilter, setIndustryFilter] = useState<string>('all');
    const [lobFilter, setLobFilter] = useState<string>('all');
    const [cityFilter, setCityFilter] = useState<string>('all');
    const [productFilter, setProductFilter] = useState<string>('all');
    const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
    const [highlightedLeadId, setHighlightedLeadId] = useState<number | null>(null);
    const [callLogDrawerOpen, setCallLogDrawerOpen] = useState(false);
    const [callHistoryDrawerOpen, setCallHistoryDrawerOpen] = useState(false);
    const [meetingLogDrawerOpen, setMeetingLogDrawerOpen] = useState(false);
    const [meetingHistoryDrawerOpen, setMeetingHistoryDrawerOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<LeadListItem | null>(null);
    const [formData, setFormData] = useState<LeadFormData>({});
    const [validationErrors, setValidationErrors] = useState<{
        account_name?: string;
        company_website?: string;
    }>({});
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState<{
        success: number;
        skipped: number;
        failed: number;
        errors: any[];
    } | null>(null);

    // Master data state
    const [industries, setIndustries] = useState<any[]>(mockIndustryMaster);
    const [leadSources, setLeadSources] = useState<any[]>(mockLeadSourceMaster);
    const [users, setUsers] = useState<any[]>(mockUsers);
    const [stages, setStages] = useState<any[]>(mockLeadStages);
    const [statuses, setStatuses] = useState<any[]>(mockLeadStatuses);
    const [allLobs, setAllLobs] = useState<any[]>([]);
    const [allCities, setAllCities] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const data = await api.getLeads();
            setLeads(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch leads', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const data = await api.getLeadStats(allowedStageIds);
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch master data from API
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [
                    industriesData,
                    sourcesData,
                    usersData,
                    stagesData,
                    statusesData,
                    productsData,
                    lobsData,
                    citiesData
                ] = await Promise.all([
                    api.getIndustries(),
                    api.getLeadSources(),
                    api.getUsers(),
                    api.getStages(),
                    api.getStatuses(),
                    api.getProductsMaster(),
                    api.getIndustryLOBs(),
                    api.getCities()
                ]);

                setIndustries(industriesData);
                // Filter sources to match DB constraints if needed, or just use all
                // The constraint checks for: 'Website', 'Referral', 'Social Media', 'Cold Call', 'Email Campaign', 'Other', 'Employee', 'Intern', 'Partner'
                // We'll trust the DB master table.
                setLeadSources(sourcesData);
                setUsers(usersData);
                setStages(stagesData);
                setStatuses(statusesData);
                setProducts(productsData);
                setAllLobs(lobsData);
                setAllCities(citiesData);
            } catch (error) {
                console.error('Failed to fetch master data:', error);
                toast({
                    title: 'Error loading data',
                    description: 'Failed to load initial data from server',
                    variant: 'destructive'
                });
            }
        };

        fetchMasterData();
    }, []);

    useEffect(() => {
        fetchLeads();
        fetchStats();
    }, [allowedStageIds]);

    console.log('Users in LeadsTemplate:', users);

    const limit = 10;

    const filteredData = useMemo(() => {
        let result = [...leads];

        // 1. First, filter by the allowed stages for this page (from page props)
        if (allowedStageIds.length > 0) {
            result = result.filter(lead => allowedStageIds.includes(lead.stage_id));
        }

        // 2. Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(
                (lead) =>
                    lead.account_name.toLowerCase().includes(searchLower) ||
                    lead.lead_source.toLowerCase().includes(searchLower) ||
                    (lead.hq_city || '').toLowerCase().includes(searchLower)
            );
        }

        // 3. Stage filter (dropdown)
        if (stageFilter !== 'all') {
            result = result.filter((lead) => lead.stage_name === stageFilter);
        }

        // 4. Source filter (dropdown)
        if (sourceFilter !== 'all') {
            result = result.filter((lead) => lead.lead_source === sourceFilter);
        }

        // 5. Industry filter
        if (industryFilter !== 'all') {
            result = result.filter((lead) => lead.industry === industryFilter);
        }

        // 6. LOB filter
        if (lobFilter !== 'all') {
            result = result.filter((lead) => lead.primary_lob === lobFilter);
        }

        // 7. City filter
        if (cityFilter !== 'all') {
            result = result.filter((lead) => lead.hq_city === cityFilter);
        }

        // 8. Product filter
        if (productFilter !== 'all') {
            result = result.filter((lead) => lead.product_mapped === productFilter);
        }

        // 9. Outcome filter
        if (outcomeFilter !== 'all') {
            result = result.filter((lead) => lead.last_call_outcome === outcomeFilter);
        }

        // 10. Date filter
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            result = result.filter((lead) => {
                const leadDate = new Date(lead.lead_date);
                return leadDate >= fromDate;
            });
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter((lead) => {
                const leadDate = new Date(lead.lead_date);
                return leadDate <= toDate;
            });
        }

        return result;
    }, [leads, search, stageFilter, sourceFilter, industryFilter, lobFilter, cityFilter, productFilter, outcomeFilter, dateFrom, dateTo, allowedStageIds]);

    // Show all data without pagination
    const displayData = filteredData;

    const columns: Column<LeadListItem>[] = [
        {
            key: 'lead_date',
            header: 'Date',
            render: (row) => <span>{formatDate(row.lead_date)}</span>
        },
        ...(!hideGeneratedBy ? [{ key: 'generated_by', header: 'Generated By' }] : []),
        {
            key: 'account_name',
            header: 'Account',
            sortable: true,
            render: (row) => (
                <button
                    onClick={() => window.open(`/accounts/${row.account_id}`, '_blank')}
                    className="font-medium text-primary hover:underline text-left text-wrap max-w-[200px] block"
                >
                    {row.account_name}
                </button>
            )
        },
        { key: 'industry', header: 'Industry' },
        { key: 'primary_lob', header: 'Main LOB' },
        { key: 'hq_city', header: 'HQ City' },
        {
            key: 'data_completion_score' as keyof LeadListItem,
            header: 'Data Completion',
            render: (row: LeadListItem) => (
                <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                (row.data_completion_score || 0) > 80 ? "bg-green-500" :
                                    (row.data_completion_score || 0) > 50 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${row.data_completion_score || 0}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{row.data_completion_score || 0}%</span>
                </div>
            )
        },
        ...(showDEColumn ? [{
            key: 'de_assigned_to_name' as keyof LeadListItem,
            header: 'DE assigned to',
            render: (row: LeadListItem) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Select
                        value={row.de_assigned_to?.toString()}
                        onValueChange={async (value) => {
                            try {
                                await api.updateLeadDE(row.lead_id, Number(value));
                                fetchLeads();
                                toast({ title: 'Assigned successfully' });
                            } catch (err) {
                                console.error(err);
                                toast({ title: 'Error', description: 'Failed to assign', variant: 'destructive' });
                            }
                        }}
                    >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map(u => (
                                <SelectItem key={u.user_id} value={String(u.user_id)}>{u.full_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )
        }] : []),
        {
            key: 'stage_name',
            header: 'Stage Update',
            render: (row) => (
                <Select
                    value={row.stage_id?.toString()}
                    onValueChange={async (value) => {
                        const newStageId = Number(value);
                        // Find default status for this stage
                        const defaultStatus = statuses.find(s => s.stage_id === newStageId);

                        try {
                            await api.updateLeadStage(row.lead_id, {
                                stage_id: newStageId,
                                status_id: defaultStatus?.status_id
                            });

                            // Refresh list
                            fetchLeads();
                            toast({ title: 'Stage updated' });
                        } catch (err) {
                            console.error('Failed to update stage:', err);
                            toast({ title: 'Error', description: 'Failed to update stage', variant: 'destructive' });
                        }
                    }}
                >
                    <SelectTrigger className="h-8 w-[200px] text-xs">
                        <SelectValue placeholder="Select stage">
                            <span className="truncate">{row.stage_name || 'New'}</span>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[200px]">
                        {stages.map((stage) => (
                            <SelectItem key={stage.stage_id} value={stage.stage_id.toString()}>
                                {stage.stage_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        },
        ...(showProductSelection ? [{
            key: 'product_mapped' as keyof LeadListItem,
            header: 'Product',
            render: (row: LeadListItem) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Select
                        value={row.product_mapped || ""}
                        onValueChange={async (value) => {
                            if (!value) return;
                            try {
                                await api.updateLead(row.lead_id, { product_mapped: value });
                                // Optimistically update local state to avoid flickers/sync issues
                                setLeads(prev => prev.map(l =>
                                    l.lead_id === row.lead_id ? { ...l, product_mapped: value } : l
                                ));
                                toast({ title: 'Product updated' });
                            } catch (err) {
                                console.error(err);
                                toast({ title: 'Error', description: 'Failed to update product', variant: 'destructive' });
                            }
                        }}
                    >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map(p => (
                                <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )
        }] : []),
        ...(!hideStatusColumn ? [{
            key: 'status_name',
            header: 'Status',
            render: (row) => {
                const availableStatuses = statuses.filter(s => s.stage_id === row.stage_id);

                return (
                    <Select
                        value={row.status_id?.toString()}
                        onValueChange={async (value) => {
                            try {
                                await api.updateLeadStage(row.lead_id, {
                                    stage_id: row.stage_id,
                                    status_id: Number(value)
                                });

                                // Refresh list
                                fetchLeads();
                                toast({ title: 'Status updated' });
                            } catch (err) {
                                console.error('Failed to update status:', err);
                                toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
                            }
                        }}
                    >
                        <SelectTrigger className="h-8 w-[110px] text-xs">
                            <SelectValue placeholder="Select status">
                                <span className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                                    row.status_name === 'New' && "bg-blue-100 text-blue-800",
                                    row.status_name === 'Active' && "bg-green-100 text-green-800",
                                    row.status_name === 'Inactive' && "bg-gray-100 text-gray-800",
                                    !['New', 'Active', 'Inactive'].includes(row.status_name) && "bg-gray-100 text-gray-800"
                                )}>
                                    {row.status_name || 'Active'}
                                </span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent position="popper" className="max-h-[200px]">
                            {availableStatuses.map((status) => (
                                <SelectItem key={status.status_id} value={status.status_id.toString()}>
                                    {status.status_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            }
        }] : []),
        ...(showQuickCallActions ? [{
            key: 'quickActions' as keyof LeadListItem,
            header: 'Actions',
            render: (row: LeadListItem) => (
                <div className="flex items-center gap-1.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm"
                                onClick={() => {
                                    setSelectedLead(row);
                                    setCallLogDrawerOpen(true);
                                }}
                            >
                                <Phone className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Log New Call</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-gray-200 text-muted-foreground hover:bg-gray-50 shadow-sm"
                                onClick={() => {
                                    setSelectedLead(row);
                                    setCallHistoryDrawerOpen(true);
                                }}
                            >
                                <History className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Call History</TooltipContent>
                    </Tooltip>
                </div>
            )
        }] : []),
        ...(showMeetingColumns ? [{
            key: 'meetingActions' as keyof LeadListItem,
            header: 'Actions',
            render: (row: LeadListItem) => (
                <div className="flex items-center gap-1.5">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-primary/20 text-primary hover:bg-primary/5 shadow-sm"
                                onClick={() => {
                                    setSelectedLead(row);
                                    setMeetingLogDrawerOpen(true);
                                }}
                            >
                                <CalendarPlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Schedule Meeting</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 border-gray-200 text-muted-foreground hover:bg-gray-50 shadow-sm"
                                onClick={() => {
                                    setSelectedLead(row);
                                    setMeetingHistoryDrawerOpen(true);
                                }}
                            >
                                <History className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Meeting History</TooltipContent>
                    </Tooltip>
                </div>
            )
        }] : []),
        ...(!hideActions ? [{
            key: 'actions' as keyof LeadListItem,
            header: '',
            render: (row: LeadListItem) => (
                <div className="flex items-center justify-end gap-1 px-2 group">
                    {!hideEditAction && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-white hover:text-primary transition-colors"
                                    onClick={() => handleEdit(row)}
                                >
                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Lead</TooltipContent>
                        </Tooltip>
                    )}
                    {!hideDeleteAction && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-white hover:text-red-600 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(row);
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-red-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Lead</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            )
        }] : [])
    ];

    const handleEdit = async (lead: LeadListItem | null) => {
        if (lead) {
            // Fetch full lead details with account info from API
            try {
                const leadDetails = await api.getLead(lead.lead_id);
                setSelectedLead(lead);
                setFormData({
                    ...leadDetails,
                    // Ensure IDs are numbers
                    stage_id: Number(leadDetails.stage_id),
                    status_id: Number(leadDetails.status_id),
                    account_name: leadDetails.account_name, // Ensure this maps correctly
                    // Map other fields as necessary if the API response keys differ from LeadFormData
                });
                setEditModalOpen(true);
            } catch (error) {
                console.error('Failed to fetch lead details:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load lead details',
                    variant: 'destructive'
                });
            }
        } else {
            setSelectedLead(null);
            // reset form for new lead
            setFormData({
                lead_date: new Date().toISOString().split('T')[0],
                expected_value: 0,
                account_name: '',
                industry: '',
                head_office: '',
                location: '',
                company_website: '',
                primary_contact_name: '',
                contact_person_role: '',
                contact_phone: '',
                contact_email: '',
                company_phone: '',
                call_status: '',
                lead_source: leadSources[0]?.source_name || 'Website',
                lead_generated_by: currentUser?.user_id || users[0]?.user_id || 1,
                stage_id: stages[0]?.stage_id || 1,
                status_id: statuses.find(s => s.stage_id === (stages[0]?.stage_id || 1))?.status_id || 1,
            });
            setValidationErrors({});
            setEditModalOpen(true);
        }
    };

    const handleDelete = (lead: LeadListItem) => {
        setSelectedLead(lead);
        setDeleteDialogOpen(true);
    };

    const handleSave = async () => {
        // Validate mandatory fields
        const errors: { account_name?: string; company_website?: string } = {};

        if (!formData.account_name || !formData.account_name.trim()) {
            errors.account_name = 'Account Name is required';
        }

        if (!formData.company_website || !formData.company_website.trim()) {
            errors.company_website = 'Company Website is required';
        }

        if (!formData.stage_id || !formData.status_id) {
            toast({ title: 'Error', description: 'Stage and status are required', variant: 'destructive' });
            return;
        }

        // Check for existing validation errors (from duplicate check)
        if (validationErrors.account_name || validationErrors.company_website) {
            toast({
                title: 'Validation Error',
                description: validationErrors.account_name || validationErrors.company_website,
                variant: 'destructive'
            });
            return;
        }

        if (errors.account_name || errors.company_website) {
            setValidationErrors(errors);
            toast({
                title: 'Error',
                description: errors.account_name || errors.company_website,
                variant: 'destructive'
            });
            return;
        }

        if (selectedLead) {
            try {
                // Call API to update lead
                // @ts-ignore
                await api.updateLead(selectedLead.lead_id, formData);

                // Refresh leads list from API to show latest data
                fetchLeads();

                toast({ title: 'Lead updated successfully' });
            } catch (error) {
                console.error('Error updating lead:', error);
                toast({
                    title: 'Error updating lead',
                    description: error instanceof Error ? error.message : 'Unknown error',
                    variant: 'destructive'
                });
                return;
            }
        } else {
            try {
                // Call API to create lead (and account) in database
                const response = await api.createLead(formData as Lead);

                if (response.success) {
                    // Refresh leads list to get the new lead with all joined fields
                    fetchLeads();
                    toast({ title: 'Lead created successfully' });
                }
            } catch (error: any) {
                console.error('Error creating lead:', error);
                // Check if it's a duplicate error from the backend
                const errorMessage = error.message || 'Unknown error';
                if (errorMessage.includes('already exists')) {
                    if (errorMessage.toLowerCase().includes('account')) {
                        setValidationErrors(prev => ({ ...prev, account_name: errorMessage }));
                    } else if (errorMessage.toLowerCase().includes('website')) {
                        setValidationErrors(prev => ({ ...prev, company_website: errorMessage }));
                    }
                }
                toast({
                    title: 'Error creating lead',
                    description: errorMessage,
                    variant: 'destructive'
                });
                return; // Don't close modal on error
            }
        }
        setValidationErrors({});
        setEditModalOpen(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setImportResults(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const parsedData = parseCSV(text);

                if (parsedData.length === 0) {
                    toast({
                        title: 'Empty File',
                        description: 'No data found in the selected CSV file.',
                        variant: 'destructive'
                    });
                    setImporting(false);
                    return;
                }

                // Send to backend
                const result = await api.importLeads(parsedData);
                setImportResults(result);

                if (result.success > 0) {
                    toast({
                        title: 'Import Successful',
                        description: `Imported ${result.success} leads. Skipped ${result.skipped}.`
                    });
                    fetchLeads(); // Refresh list
                }

                // Don't close immediately so user can see results
            } catch (error: any) {
                console.error('Import error:', error);
                console.error('Error details:', error?.message, error?.response?.data);
                toast({
                    title: 'Import Failed',
                    description: error?.message || 'Failed to process the file.',
                    variant: 'destructive'
                });
            } finally {
                setImporting(false);
            }
        };
        reader.readAsText(file);
    };

    const handleConfirmDelete = async () => {
        if (selectedLead) {
            try {
                await api.deleteLead(selectedLead.lead_id);
                // Refresh list
                fetchLeads();
                toast({ title: 'Lead deleted successfully' });
            } catch (error) {
                console.error('Error deleting lead:', error);
                toast({
                    title: 'Error deleting lead',
                    description: 'Failed to delete lead from database',
                    variant: 'destructive'
                });
            }
        }
        setDeleteDialogOpen(false);
    };

    const handleExport = () => {
        const csv = [
            ['ID', 'Date', 'Account', 'Source', 'Stage', 'Value', 'Next Followup'].join(','),
            ...filteredData.map(l => [
                l.lead_id,
                formatDate(l.lead_date),
                `"${l.account_name}"`,
                l.lead_source,
                l.stage_name,
                l.expected_value,
                l.next_followup_at || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'leads.csv';
        link.click();
        toast({ title: 'Export complete' });
    };

    const openModal = () => handleEdit(null);

    return (
        <AppLayout>
            <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    {allowedStageIds.includes(1) && !hideGeneratedBy && (
                        <div className="flex items-center gap-2">
                            <Button onClick={() => setImportDialogOpen(true)} variant="outline" size="sm" className="gap-2">
                                <Upload className="h-4 w-4" /> Import (CSV)
                            </Button>
                            <Button onClick={() => openModal()} size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> Add Lead
                            </Button>
                        </div>
                    )}
                </div>

                <StatsCards stats={stats} loading={statsLoading} showCallStats={showCallStats} />

                {showCallStats && (
                    <FollowupsCard
                        onLeadClick={(leadId, accountId) => {
                            // Open account details page in new tab
                            window.open(`/accounts/${accountId}`, '_blank');
                        }}
                    />
                )}

                <div className="flex flex-col gap-3 bg-muted/20 p-4 rounded-xl border border-primary/5 mb-6">
                    {/* Row 1: Dropdown Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        {!hideStageFilter && (
                            <Select value={stageFilter} onValueChange={setStageFilter}>
                                <SelectTrigger className="h-8 w-[130px] text-xs bg-white">
                                    <SelectValue placeholder="All Stages" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Stages</SelectItem>
                                    {stages
                                        .filter(s => allowedStageIds.length === 0 || allowedStageIds.includes(s.stage_id))
                                        .map((stage) => (
                                            <SelectItem key={stage.stage_id} value={stage.stage_name}>
                                                {stage.stage_name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        )}

                        {!hideSourceFilter && (
                            <Select value={sourceFilter} onValueChange={setSourceFilter}>
                                <SelectTrigger className="h-8 w-[130px] text-xs bg-white">
                                    <SelectValue placeholder="All Sources" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sources</SelectItem>
                                    {leadSources.map((source) => (
                                        <SelectItem key={source.lead_source_id} value={source.source_name}>
                                            {source.source_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {showIndustryFilter && (
                            <Select value={industryFilter} onValueChange={setIndustryFilter}>
                                <SelectTrigger className="h-8 w-[130px] text-xs bg-white">
                                    <SelectValue placeholder="All Industries" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Industries</SelectItem>
                                    {industries.map((ind) => (
                                        <SelectItem key={ind.industry_id} value={ind.industry_name}>
                                            {ind.industry_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {showLOBFilter && (
                            <Select value={lobFilter} onValueChange={setLobFilter}>
                                <SelectTrigger className="h-8 w-[120px] text-xs bg-white">
                                    <SelectValue placeholder="All LOBs" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All LOBs</SelectItem>
                                    {allLobs.map((lob) => (
                                        <SelectItem key={lob.lob_id} value={lob.lob_name}>
                                            {lob.lob_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {showCityFilter && (
                            <Select value={cityFilter} onValueChange={setCityFilter}>
                                <SelectTrigger className="h-8 w-[120px] text-xs bg-white">
                                    <SelectValue placeholder="All Cities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Cities</SelectItem>
                                    {allCities.map((city) => (
                                        <SelectItem key={city.city_id} value={city.city_name}>
                                            {city.city_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {showProductFilter && (
                            <Select value={productFilter} onValueChange={setProductFilter}>
                                <SelectTrigger className="h-8 w-[130px] text-xs bg-white">
                                    <SelectValue placeholder="All Products" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Products</SelectItem>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={p.name}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {showOutcomeFilter && (
                            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                                <SelectTrigger className="h-8 w-[140px] text-xs bg-white">
                                    <SelectValue placeholder="All Outcomes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Outcomes</SelectItem>
                                    {['No Answer', 'Busy', 'Call Back Later', 'Interested', 'Not Interested', 'Wrong Number'].map((outcome) => (
                                        <SelectItem key={outcome} value={outcome}>
                                            {outcome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Row 2: Date Filter + Search - Compact & Stunning */}
                    <div className="flex items-center gap-4">
                        {/* Date Range Filter - Sleek Design */}
                        <div className="flex items-center gap-0 bg-gradient-to-r from-slate-50 to-white rounded-lg border shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-1.5 border-r bg-slate-50/80">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date Range</span>
                            </div>
                            <DatePicker
                                date={dateFrom}
                                onSelect={setDateFrom}
                                placeholder="From date"
                                className="border-0 rounded-none shadow-none"
                            />
                            <div className="px-2 py-1.5 text-xs text-slate-400 font-medium bg-slate-50/50">→</div>
                            <DatePicker
                                date={dateTo}
                                onSelect={setDateTo}
                                placeholder="To date"
                                className="border-0 rounded-none shadow-none"
                            />
                            {(dateFrom || dateTo) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-none hover:bg-red-50 hover:text-red-500 transition-colors"
                                    onClick={() => {
                                        setDateFrom(undefined);
                                        setDateTo(undefined);
                                    }}
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Results Count */}
                        <div className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{displayData.length}</span> results
                        </div>

                        {/* Search - Right Side */}
                        <div className="relative flex-grow max-w-sm ml-auto">
                            <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search leads, accounts..."
                                className="pl-9 h-8 text-xs shadow-sm bg-white rounded-lg"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={displayData}
                    page={1}
                    total={displayData.length}
                    limit={displayData.length || 1}
                    onPageChange={() => { }}
                />

                {/* Edit Modal */}
                <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{selectedLead ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            {/* Account Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">Account Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="account_name">Account Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="account_name"
                                            value={formData.account_name || ''}
                                            onChange={(e) => {
                                                setFormData({ ...formData, account_name: e.target.value });
                                                if (validationErrors.account_name) {
                                                    setValidationErrors(prev => ({ ...prev, account_name: undefined }));
                                                }
                                            }}
                                            onBlur={async (e) => {
                                                const value = e.target.value.trim();
                                                if (value && !selectedLead) {
                                                    try {
                                                        const result = await api.checkDuplicate({ account_name: value });
                                                        if (result.account_name_exists) {
                                                            setValidationErrors(prev => ({
                                                                ...prev,
                                                                account_name: `Account "${result.existing_account_name}" already exists`
                                                            }));
                                                        }
                                                    } catch (err) {
                                                        console.error('Duplicate check failed:', err);
                                                    }
                                                }
                                            }}
                                            placeholder="Enter account name"
                                            className={validationErrors.account_name ? 'border-red-500' : ''}
                                        />
                                        {validationErrors.account_name && (
                                            <p className="text-xs text-red-500">{validationErrors.account_name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="industry">Industry</Label>
                                        <Select
                                            value={formData.industry}
                                            onValueChange={(value) => setFormData({ ...formData, industry: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select industry" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {industries.map((ind) => (
                                                    <SelectItem key={ind.industry_id} value={ind.industry_name}>
                                                        {ind.industry_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="head_office">Head Office</Label>
                                        <Input
                                            id="head_office"
                                            value={formData.head_office || ''}
                                            onChange={(e) => setFormData({ ...formData, head_office: e.target.value })}
                                            placeholder="City, Country"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={formData.location || ''}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Branch/Office Location"
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="company_website">Company Website <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="company_website"
                                            value={formData.company_website || ''}
                                            onChange={(e) => {
                                                setFormData({ ...formData, company_website: e.target.value });
                                                if (validationErrors.company_website) {
                                                    setValidationErrors(prev => ({ ...prev, company_website: undefined }));
                                                }
                                            }}
                                            onBlur={async (e) => {
                                                const value = e.target.value.trim();
                                                if (value && !selectedLead) {
                                                    try {
                                                        const result = await api.checkDuplicate({ company_website: value });
                                                        if (result.company_website_exists) {
                                                            setValidationErrors(prev => ({
                                                                ...prev,
                                                                company_website: `Website already exists for "${result.existing_website_account}"`
                                                            }));
                                                        }
                                                    } catch (err) {
                                                        console.error('Duplicate check failed:', err);
                                                    }
                                                }
                                            }}
                                            placeholder="https://example.com"
                                            className={validationErrors.company_website ? 'border-red-500' : ''}
                                        />
                                        {validationErrors.company_website && (
                                            <p className="text-xs text-red-500">{validationErrors.company_website}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Person Details */}
                                <div className="space-y-2 mt-4">
                                    <Label className="text-base font-semibold">Primary Contact</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="primary_contact_name">Name</Label>
                                            <Input
                                                id="primary_contact_name"
                                                value={formData.primary_contact_name || ''}
                                                onChange={(e) => setFormData({ ...formData, primary_contact_name: e.target.value })}
                                                placeholder="Contact Person Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_person_role">Role/Designation</Label>
                                            <Input
                                                id="contact_person_role"
                                                value={formData.contact_person_role || ''}
                                                onChange={(e) => setFormData({ ...formData, contact_person_role: e.target.value })}
                                                placeholder="e.g. CEO, HR Manager"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_phone">Phone</Label>
                                            <Input
                                                id="contact_phone"
                                                value={formData.contact_phone || ''}
                                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                                placeholder="Contact Phone"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_email">Email</Label>
                                            <Input
                                                id="contact_email"
                                                type="email"
                                                value={formData.contact_email || ''}
                                                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company_phone">Company Phone (Landline)</Label>
                                            <Input
                                                id="company_phone"
                                                value={formData.company_phone || ''}
                                                onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                                                placeholder="Company Landline"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="call_status">Call Status</Label>
                                            <Input
                                                id="call_status"
                                                value={formData.call_status || ''}
                                                onChange={(e) => setFormData({ ...formData, call_status: e.target.value })}
                                                placeholder="Enter call status"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lead Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium border-b pb-2">Lead Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="lead_source">Source From</Label>
                                        <Select
                                            value={formData.lead_source}
                                            onValueChange={(value) => setFormData({ ...formData, lead_source: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select source" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leadSources.map((source) => (
                                                    <SelectItem key={source.lead_source_id} value={source.source_name}>
                                                        {source.source_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lead_generated_by">Generated By</Label>
                                        <Select
                                            value={formData.lead_generated_by?.toString()}
                                            onValueChange={(value) => setFormData({ ...formData, lead_generated_by: Number(value) })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem
                                                        key={user.user_id}
                                                        value={user.user_id.toString()}
                                                    >
                                                        {user.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stage">Stage <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={formData.stage_id?.toString()}
                                            onValueChange={(value) => {
                                                const stageId = Number(value);
                                                // Find default status for this stage
                                                const defaultStatus = statuses.find(s => s.stage_id === stageId);
                                                setFormData({
                                                    ...formData,
                                                    stage_id: stageId,
                                                    status_id: defaultStatus?.status_id
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select stage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stages.map((stage) => (
                                                    <SelectItem key={stage.stage_id} value={stage.stage_id.toString()}>
                                                        {stage.stage_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={formData.status_id?.toString()}
                                            onValueChange={(value) => setFormData({ ...formData, status_id: Number(value) })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses
                                                    .filter(s => s.stage_id === formData.stage_id)
                                                    .map((status) => (
                                                        <SelectItem key={status.status_id} value={status.status_id.toString()}>
                                                            {status.status_name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lead_date">Lead Date</Label>
                                        <Input
                                            id="lead_date"
                                            type="date"
                                            value={formData.lead_date ? new Date(formData.lead_date).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setFormData({ ...formData, lead_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Lead</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the lead from the database.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Import Dialog */}
                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Import Leads from CSV</DialogTitle>
                            <DialogDescription>
                                Upload a CSV file exported from the spreadsheet.
                                Duplicates based on Account Name will be skipped.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="csv_file">CSV File</Label>
                                <Input
                                    id="csv_file"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    disabled={importing}
                                />
                            </div>

                            {importing && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                                    <Upload className="h-4 w-4" />
                                    Importing leads... please wait
                                </div>
                            )}

                            {importResults && (
                                <div className={`p-4 rounded-lg text-sm ${importResults.success > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    <div className="flex items-center gap-2 mb-2 font-medium">
                                        {importResults.success > 0 ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <Ban className="h-4 w-4" />
                                        )}
                                        Import Complete
                                    </div>
                                    <ul className="space-y-1 ml-6 list-disc">
                                        <li>Added: {importResults.success}</li>
                                        <li>Skipped (Duplicates): {importResults.skipped}</li>
                                        <li>Failed: {importResults.failed}</li>
                                    </ul>
                                    {importResults.errors.length > 0 && (
                                        <div className="mt-2 text-xs text-red-600 max-h-32 overflow-y-auto">
                                            <strong>Errors:</strong>
                                            {importResults.errors.map((err, idx) => (
                                                <div key={idx} className="mt-1">
                                                    {err.company}: {err.error}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="sm:justify-end">
                            <Button variant="secondary" onClick={() => setImportDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <CallLogDrawer
                    open={callLogDrawerOpen}
                    onOpenChange={setCallLogDrawerOpen}
                    lead={selectedLead}
                    onSaveSuccess={async () => {
                        // Refresh leads list to show updated timestamps
                        const updatedLeads = await api.getLeads();
                        setLeads(updatedLeads);
                    }}
                />

                <CallHistoryDrawer
                    open={callHistoryDrawerOpen}
                    onOpenChange={setCallHistoryDrawerOpen}
                    lead={selectedLead}
                />

                <MeetingLogDrawer
                    open={meetingLogDrawerOpen}
                    onOpenChange={setMeetingLogDrawerOpen}
                    lead={selectedLead}
                    onSaveSuccess={async () => {
                        // Refresh leads list
                        const updatedLeads = await api.getLeads();
                        setLeads(updatedLeads);
                    }}
                    defaultMeetingType={meetingType}
                />

                <MeetingHistoryDrawer
                    open={meetingHistoryDrawerOpen}
                    onOpenChange={setMeetingHistoryDrawerOpen}
                    lead={selectedLead}
                />
            </div >
        </AppLayout >
    );
}
