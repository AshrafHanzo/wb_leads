import { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Phone,
    CalendarPlus,
    MoreHorizontal,
    Filter,
    Search
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    DialogFooter,
} from "@/components/ui/dialog";

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
};

interface LeadsTemplateProps {
    title: string;
    description: string;
    allowedStageIds: number[];
    showDEColumn?: boolean;
    hideGeneratedBy?: boolean;
    hideSourceFrom?: boolean;
}

export function LeadsTemplate({ title, description, allowedStageIds, showDEColumn, hideGeneratedBy, hideSourceFrom }: LeadsTemplateProps) {
    const { toast } = useToast();
    const { hasPermission, currentUser } = useAuth();
    const [leads, setLeads] = useState<LeadListItem[]>([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('all');
    const [sourceFilter, setSourceFilter] = useState<string>('all');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<LeadListItem | null>(null);
    const [formData, setFormData] = useState<LeadFormData>({});

    // Master data state
    const [industries, setIndustries] = useState<any[]>(mockIndustryMaster);
    const [leadSources, setLeadSources] = useState<any[]>(mockLeadSourceMaster);
    const [users, setUsers] = useState<any[]>(mockUsers);
    const [stages, setStages] = useState<any[]>(mockLeadStages);
    const [statuses, setStatuses] = useState<any[]>(mockLeadStatuses);

    // Fetch data from API
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [
                    industriesData,
                    sourcesData,
                    usersData,
                    stagesData,
                    statusesData,
                    leadsData
                ] = await Promise.all([
                    api.getIndustries(),
                    api.getLeadSources(),
                    api.getUsers(),
                    api.getStages(),
                    api.getStatuses(),
                    api.getLeads()
                ]);

                setIndustries(industriesData);
                // Filter sources to match DB constraints if needed, or just use all
                // The constraint checks for: 'Website', 'Referral', 'Social Media', 'Cold Call', 'Email Campaign', 'Other', 'Employee', 'Intern', 'Partner'
                // We'll trust the DB master table.
                setLeadSources(sourcesData);
                setUsers(usersData);
                setStages(stagesData);
                setStatuses(statusesData);
                setLeads(leadsData);
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

    console.log('Users in LeadsTemplate:', users);

    const limit = 10;

    const filteredData = useMemo(() => {
        let result = [...leads];

        // 1. First, filter by the allowed stages for this page
        if (allowedStageIds.length > 0) {
            result = result.filter(lead => allowedStageIds.includes(lead.stage_id));
        }

        // 2. Search filter
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(
                (lead) =>
                    lead.account_name.toLowerCase().includes(searchLower) ||
                    lead.lead_source.toLowerCase().includes(searchLower)
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

        return result;
    }, [leads, search, stageFilter, sourceFilter, allowedStageIds]);

    const paginatedData = useMemo(() => {
        const startIndex = (page - 1) * limit;
        return filteredData.slice(startIndex, startIndex + limit);
    }, [filteredData, page]);

    const totalPages = Math.ceil(filteredData.length / limit);

    const columns: Column<LeadListItem>[] = [
        { key: 'lead_id', header: 'ID', render: (row) => <span className="text-muted-foreground">#{row.lead_id}</span> },
        {
            key: 'lead_date',
            header: 'Date',
            render: (row) => <span>{formatDate(row.lead_date)}</span>
        },
        {
            key: 'account_name',
            header: 'Account',
            sortable: true,
            render: (row) => <span className="font-medium">{row.account_name}</span>
        },
        ...(!hideGeneratedBy ? [{ key: 'generated_by', header: 'Generated By' }] : []),
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
                                const updatedLeads = await api.getLeads();
                                setLeads(updatedLeads);
                                toast({ title: 'Assigned successfully' });
                            } catch (err) {
                                console.error(err);
                                toast({ title: 'Error', description: 'Failed to assign', variant: 'destructive' });
                            }
                        }}
                    >
                        <SelectTrigger className="w-[140px] h-8">
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
        ...(!hideSourceFrom ? [{ key: 'lead_source', header: 'Source From' }] : []),

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
                            const updatedLeads = await api.getLeads();
                            setLeads(updatedLeads);
                            toast({ title: 'Stage updated' });
                        } catch (err) {
                            console.error('Failed to update stage:', err);
                            toast({ title: 'Error', description: 'Failed to update stage', variant: 'destructive' });
                        }
                    }}
                >
                    <SelectTrigger className="h-8 w-[250px]">
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
        {
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
                                const updatedLeads = await api.getLeads();
                                setLeads(updatedLeads);
                                toast({ title: 'Status updated' });
                            } catch (err) {
                                console.error('Failed to update status:', err);
                                toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
                            }
                        }}
                    >
                        <SelectTrigger className="h-8 w-[150px]">
                            <SelectValue placeholder="Select status">
                                <span className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
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
        },
        {
            key: 'actions',
            header: '',
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-muted"
                                onClick={() => handleEdit(row)}
                            >
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Lead</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                onClick={() => handleDelete(row)}
                            >
                                <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-600" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Lead</TooltipContent>
                    </Tooltip>
                </div>
            )
        }
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
                status_name: '',
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
                lead_source: leadSources[0]?.source_name || 'Website',
                lead_generated_by: currentUser?.user_id || users[0]?.user_id || 1,
                stage_id: stages[0]?.stage_id || 1,
                status_id: statuses.find(s => s.stage_id === (stages[0]?.stage_id || 1))?.status_id || 1,
            });
            setEditModalOpen(true);
        }
    };

    const handleDelete = (lead: LeadListItem) => {
        setSelectedLead(lead);
        setDeleteDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.account_name || !formData.stage_id || !formData.status_id) {
            toast({ title: 'Error', description: 'Account name, stage, and status are required', variant: 'destructive' });
            return;
        }

        if (selectedLead) {
            try {
                // Call API to update lead
                // @ts-ignore
                await api.updateLead(selectedLead.lead_id, formData);

                // Refresh leads list from API to show latest data
                const updatedLeads = await api.getLeads();
                setLeads(updatedLeads);

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
                    const updatedLeads = await api.getLeads();
                    setLeads(updatedLeads);
                    toast({ title: 'Lead created successfully' });
                }
            } catch (error) {
                console.error('Error creating lead:', error);
                toast({
                    title: 'Error creating lead',
                    description: error instanceof Error ? error.message : 'Unknown error',
                    variant: 'destructive'
                });
                return; // Don't close modal on error
            }
        }
        setEditModalOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (selectedLead) {
            try {
                await api.deleteLead(selectedLead.lead_id);
                // Refresh list
                const updatedLeads = await api.getLeads();
                setLeads(updatedLeads);
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
                l.next_followup_date || ''
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

    return (
        <AppLayout>
            <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    {hasPermission('create', 'leads') && (
                        <Button size="sm" className="h-8 text-xs" onClick={() => handleEdit(null)}>
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Add Lead
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                    <Select value={stageFilter} onValueChange={setStageFilter}>
                        <SelectTrigger className="h-8 w-[150px] text-xs">
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

                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="h-8 w-[150px] text-xs">
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
                </div>

                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search leads, accounts..."
                        className="pl-9 h-9 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <DataTable
                    columns={columns}
                    data={paginatedData}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
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
                                            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                                            placeholder="Enter account name"
                                        />
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
                                        <Label htmlFor="company_website">Company Website</Label>
                                        <Input
                                            id="company_website"
                                            value={formData.company_website || ''}
                                            onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                                            placeholder="https://example.com"
                                        />
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

            </div>
        </AppLayout>
    );
}


