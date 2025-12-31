import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Building2, MapPin, Phone, Mail, Globe, User,
    Briefcase, Users, Lightbulb, AlertTriangle, Plus, Pencil,
    Trash2, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CompactModal } from '@/components/common/CompactModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
    AccountFull, AccountContact, AccountLineOfBusiness,
    AccountDepartment, AccountUseCase, DepartmentPainPoint,
    Account, AccountStatus, CityMaster, CountryMaster, IndustryLOB,
    DepartmentMaster, UseCaseMaster, TelecallLog
} from '@/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

type TabType = 'details' | 'contacts' | 'business' | 'departments' | 'usecases' | 'painpoints' | 'history';

const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'details', label: 'Details', icon: Building2 },
    { id: 'contacts', label: 'Key Contacts', icon: Users },
    { id: 'business', label: 'Line of Business', icon: Briefcase },
    { id: 'departments', label: 'Departments', icon: Users },
    { id: 'usecases', label: 'Use Cases', icon: Lightbulb },
    { id: 'painpoints', label: 'Pain Points', icon: AlertTriangle },
    { id: 'history', label: 'Telecall History', icon: Phone },
];

const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Education', 'Manufacturing', 'Real Estate', 'Logistics', 'Other'];
const statuses: AccountStatus[] = ['Prospect', 'Active', 'Dormant'];

export default function AccountDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [account, setAccount] = useState<AccountFull | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('details');
    const [loading, setLoading] = useState(true);
    const [telecallLogs, setTelecallLogs] = useState<TelecallLog[]>([]);

    // Modal states
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [lobModalOpen, setLobModalOpen] = useState(false);
    const [deptModalOpen, setDeptModalOpen] = useState(false);
    const [useCaseModalOpen, setUseCaseModalOpen] = useState(false);
    const [painPointModalOpen, setPainPointModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [accountEditModalOpen, setAccountEditModalOpen] = useState(false);

    const [cities, setCities] = useState<CityMaster[]>([]);
    const [countries, setCountries] = useState<CountryMaster[]>([]);
    const [allIndustryLOBs, setAllIndustryLOBs] = useState<IndustryLOB[]>([]);
    const [departmentsMaster, setDepartmentsMaster] = useState<DepartmentMaster[]>([]);
    const [useCasesMaster, setUseCasesMaster] = useState<UseCaseMaster[]>([]);

    // Edit states
    const [editingContact, setEditingContact] = useState<AccountContact | null>(null);
    const [editingLob, setEditingLob] = useState<AccountLineOfBusiness | null>(null);
    const [editingDept, setEditingDept] = useState<AccountDepartment | null>(null);
    const [editingUseCase, setEditingUseCase] = useState<AccountUseCase | null>(null);
    const [editingPainPoint, setEditingPainPoint] = useState<DepartmentPainPoint | null>(null);
    const [selectedDeptForPainPoint, setSelectedDeptForPainPoint] = useState<number | null>(null);

    // Form data
    const [contactForm, setContactForm] = useState({ name: '', role: '', phone: '', email: '' });
    const [lobForm, setLobForm] = useState({ business_type: '', description: '' });
    const [deptForm, setDeptForm] = useState({ department_name: '', head_name: '' });
    const [useCaseForm, setUseCaseForm] = useState({ use_case_title: '', description: '', status: 'Identified' });
    const [painPointForm, setPainPointForm] = useState({ pain_point: '', severity: 'Medium', notes: '' });
    const [accountForm, setAccountForm] = useState<Partial<Account>>({});

    // Delete state
    const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: number; deptId?: number } | null>(null);

    // Expanded departments for pain points
    const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (id) {
            fetchAccountData();
        }
    }, [id]);

    const fetchAccountData = async () => {
        try {
            setLoading(true);
            const data = await api.getAccountFull(Number(id));
            setAccount(data);

            // Fetch telecall logs
            api.getAccountTelecallLogs(Number(id)).then(setTelecallLogs).catch(err => console.error('Failed to fetch telecall logs:', err));

            // Fetch master data separately so it doesn't crash the main load
            try {
                const [citiesData, countriesData, lobsData, deptsData, ucsData] = await Promise.all([
                    api.getCities().catch(() => []),
                    api.getCountries().catch(() => []),
                    api.getIndustryLOBs().catch(() => []),
                    api.getDepartmentsMaster().catch(() => []),
                    api.getUseCasesMaster().catch(() => [])
                ]);
                setCities(citiesData || []);
                setCountries(countriesData || []);
                setAllIndustryLOBs(lobsData || []);
                setDepartmentsMaster(deptsData || []);
                setUseCasesMaster(ucsData || []);
            } catch (masterError) {
                console.warn('Failed to fetch master data:', masterError);
            }
        } catch (error) {
            console.error('Failed to fetch account:', error);
            toast({ title: 'Error', description: 'Failed to load account details', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleAccountEdit = () => {
        if (!account) return;
        setAccountForm({
            account_name: account.account_name,
            industry: account.industry,
            head_office: account.head_office,
            primary_contact_name: account.primary_contact_name,
            contact_person_role: account.contact_person_role,
            contact_phone: account.contact_phone,
            contact_email: account.contact_email,
            company_phone: account.company_phone,
            account_status: account.account_status,
            account_owner: account.account_owner,
            lead_source: account.lead_source,
            remarks: account.remarks,
            company_website: account.company_website,
            primary_lob: account.primary_lob,
            country: account.country,
            employee_count: account.employee_count,
            total_revenue: account.total_revenue,
            data_completion_score: account.data_completion_score,
            contact_person: account.contact_person,
            phone: account.phone,
            email: account.email,
            website: account.website,
        });
        setAccountEditModalOpen(true);
    };

    const handleAccountSave = async () => {
        try {
            await api.updateAccount(Number(id), accountForm);
            toast({ title: 'Account updated successfully' });
            setAccountEditModalOpen(false);
            fetchAccountData();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to update account', variant: 'destructive' });
        }
    };

    // Contact handlers
    const handleContactSubmit = async () => {
        try {
            if (editingContact) {
                await api.updateAccountContact(Number(id), editingContact.id, contactForm);
                toast({ title: 'Contact updated successfully' });
            } else {
                await api.createAccountContact(Number(id), contactForm);
                toast({ title: 'Contact added successfully' });
            }
            setContactModalOpen(false);
            setEditingContact(null);
            setContactForm({ name: '', role: '', phone: '', email: '' });
            fetchAccountData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save contact', variant: 'destructive' });
        }
    };

    // Line of Business handlers
    const handleLobSubmit = async () => {
        try {
            if (editingLob) {
                await api.updateAccountLineOfBusiness(Number(id), editingLob.id, lobForm);
                toast({ title: 'Line of business updated successfully' });
            } else {
                await api.createAccountLineOfBusiness(Number(id), lobForm);
                toast({ title: 'Line of business added successfully' });
            }
            setLobModalOpen(false);
            setEditingLob(null);
            setLobForm({ business_type: '', description: '' });
            fetchAccountData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save line of business', variant: 'destructive' });
        }
    };

    // Department handlers
    const handleDeptSubmit = async () => {
        try {
            if (editingDept) {
                await api.updateAccountDepartment(Number(id), editingDept.id, deptForm);
                toast({ title: 'Department updated successfully' });
            } else {
                await api.createAccountDepartment(Number(id), deptForm);
                toast({ title: 'Department added successfully' });
            }
            setDeptModalOpen(false);
            setEditingDept(null);
            setDeptForm({ department_name: '', head_name: '' });
            fetchAccountData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save department', variant: 'destructive' });
        }
    };

    // Use Case handlers
    const handleUseCaseSubmit = async () => {
        try {
            if (editingUseCase) {
                await api.updateAccountUseCase(Number(id), editingUseCase.id, useCaseForm);
                toast({ title: 'Use case updated successfully' });
            } else {
                await api.createAccountUseCase(Number(id), useCaseForm);
                toast({ title: 'Use case added successfully' });
            }
            setUseCaseModalOpen(false);
            setEditingUseCase(null);
            setUseCaseForm({ use_case_title: '', description: '', status: 'Identified' });
            fetchAccountData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save use case', variant: 'destructive' });
        }
    };

    // Pain Point handlers
    const handlePainPointSubmit = async () => {
        if (!selectedDeptForPainPoint) return;
        try {
            if (editingPainPoint) {
                await api.updateDepartmentPainPoint(editingPainPoint.department_id, editingPainPoint.id, painPointForm);
                toast({ title: 'Pain point updated successfully' });
            } else {
                await api.createDepartmentPainPoint(selectedDeptForPainPoint, painPointForm);
                toast({ title: 'Pain point added successfully' });
            }
            setPainPointModalOpen(false);
            setEditingPainPoint(null);
            setSelectedDeptForPainPoint(null);
            setPainPointForm({ pain_point: '', severity: 'Medium', notes: '' });
            fetchAccountData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save pain point', variant: 'destructive' });
        }
    };

    // Delete handler
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            switch (deleteTarget.type) {
                case 'contact':
                    await api.deleteAccountContact(Number(id), deleteTarget.id);
                    break;
                case 'lob':
                    await api.deleteAccountLineOfBusiness(Number(id), deleteTarget.id);
                    break;
                case 'dept':
                    await api.deleteAccountDepartment(Number(id), deleteTarget.id);
                    break;
                case 'usecase':
                    await api.deleteAccountUseCase(Number(id), deleteTarget.id);
                    break;
                case 'painpoint':
                    if (deleteTarget.deptId) {
                        await api.deleteDepartmentPainPoint(deleteTarget.deptId, deleteTarget.id);
                    }
                    break;
            }
            toast({ title: 'Deleted successfully' });
            setDeleteDialogOpen(false);
            setDeleteTarget(null);
            fetchAccountData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
        }
    };

    const toggleDeptExpand = (deptId: number) => {
        const newExpanded = new Set(expandedDepts);
        if (newExpanded.has(deptId)) {
            newExpanded.delete(deptId);
        } else {
            newExpanded.add(deptId);
        }
        setExpandedDepts(newExpanded);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'Low': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getUseCaseStatusColor = (status: string) => {
        switch (status) {
            case 'Implemented': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'In Progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'On Hold': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            default: return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    if (!account) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <Building2 className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground">Account not found</p>
                    <Button onClick={() => navigate('/accounts')}>Back to Accounts</Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/accounts')}
                            className="mt-1"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-foreground">{account.account_name}</h1>
                                <StatusBadge status={account.account_status} type="account" />
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                {account.industry && (
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="h-3.5 w-3.5" />
                                        {account.industry}
                                    </span>
                                )}
                                {account.company_website && (
                                    <a
                                        href={account.company_website.startsWith('http') ? account.company_website : `https://${account.company_website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-primary hover:underline"
                                    >
                                        <Globe className="h-3.5 w-3.5" />
                                        Website
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    <Button onClick={handleAccountEdit} size="sm" className="h-8">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Account
                    </Button>
                </div>

                {/* Tabs */}
                <div className="border-b border-border">
                    <nav className="flex gap-1 -mb-px overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            let count = 0;
                            switch (tab.id) {
                                case 'contacts': count = account.contacts?.length || 0; break;
                                case 'business': count = account.lineOfBusiness?.length || 0; break;
                                case 'departments': count = account.departments?.length || 0; break;
                                case 'usecases': count = account.useCases?.length || 0; break;
                                case 'painpoints': count = account.painPoints?.length || 0; break;
                            }
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all
                    ${isActive
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                                        }
                  `}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    {count > 0 && (
                                        <span className={`
                      px-1.5 py-0.5 text-xs rounded-full
                      ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
                    `}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Info Card */}
                            <div className="lg:col-span-2 bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-primary" />
                                    Company Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Account Name</p>
                                        <p className="font-medium">{account.account_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Industry</p>
                                        <p className="font-medium">{account.industry || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Head Office</p>
                                        <p className="font-medium">{account.head_office || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Country</p>
                                        <p className="font-medium">{account.country || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Company Phone</p>
                                        <p className="font-medium">{account.company_phone || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Primary LOB</p>
                                        <p className="font-medium">{account.primary_lob || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Employee Count</p>
                                        <p className="font-medium">{account.employee_count || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Total Revenue</p>
                                        <p className="font-medium">{account.total_revenue ? `$${account.total_revenue.toLocaleString()}` : '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <StatusBadge status={account.account_status} type="account" />
                                    </div>
                                    {account.data_completion_score !== undefined && (
                                        <div className="space-y-1 col-span-2">
                                            <p className="text-xs text-muted-foreground">Data Completion Score</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${account.data_completion_score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium">{account.data_completion_score}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {account.remarks && (
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                                        <p className="text-sm">{account.remarks}</p>
                                    </div>
                                )}
                            </div>

                            {/* Primary Contact Card */}
                            <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-primary" />
                                    Primary Contact
                                </h3>
                                {account.primary_contact_name ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold">
                                                {getInitials(account.primary_contact_name)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{account.primary_contact_name}</p>
                                                <p className="text-sm text-muted-foreground">{account.contact_person_role || 'Contact'}</p>
                                            </div>
                                        </div>
                                        {account.contact_phone && (
                                            <a href={`tel:${account.contact_phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                                                <Phone className="h-4 w-4" />
                                                {account.contact_phone}
                                            </a>
                                        )}
                                        {account.contact_email && (
                                            <a href={`mailto:${account.contact_email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                                                <Mail className="h-4 w-4" />
                                                {account.contact_email}
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No primary contact set</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contacts Tab */}
                    {activeTab === 'contacts' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Key Contacts</h3>
                                <Button size="sm" onClick={() => {
                                    setEditingContact(null);
                                    setContactForm({ name: '', role: '', phone: '', email: '' });
                                    setContactModalOpen(true);
                                }}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Contact
                                </Button>
                            </div>
                            {account.contacts?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {account.contacts.map((contact) => (
                                        <div key={contact.id} className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 p-4 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center text-blue-500 font-semibold text-sm">
                                                        {getInitials(contact.name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{contact.name}</p>
                                                        <p className="text-xs text-muted-foreground">{contact.role || 'Contact'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                                        setEditingContact(contact);
                                                        setContactForm({ name: contact.name, role: contact.role, phone: contact.phone, email: contact.email });
                                                        setContactModalOpen(true);
                                                    }}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                                                        setDeleteTarget({ type: 'contact', id: contact.id });
                                                        setDeleteDialogOpen(true);
                                                    }}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="mt-3 space-y-1">
                                                {contact.phone && (
                                                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
                                                        <Phone className="h-3 w-3" /> {contact.phone}
                                                    </a>
                                                )}
                                                {contact.email && (
                                                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary truncate">
                                                        <Mail className="h-3 w-3" /> {contact.email}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Users className="h-12 w-12 mb-3 opacity-50" />
                                    <p>No contacts added yet</p>
                                    <p className="text-sm">Add key contacts for this account</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Line of Business Tab */}
                    {activeTab === 'business' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Type of Business / Line of Business</h3>
                                <Button size="sm" onClick={() => {
                                    setEditingLob(null);
                                    setLobForm({ business_type: '', description: '' });
                                    setLobModalOpen(true);
                                }}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Business Type
                                </Button>
                            </div>
                            {account.lineOfBusiness?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {account.lineOfBusiness.map((lob) => (
                                        <div key={lob.id} className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 p-4 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center">
                                                        <Briefcase className="h-5 w-5 text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{lob.business_type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                                        setEditingLob(lob);
                                                        setLobForm({ business_type: lob.business_type, description: lob.description });
                                                        setLobModalOpen(true);
                                                    }}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                                                        setDeleteTarget({ type: 'lob', id: lob.id });
                                                        setDeleteDialogOpen(true);
                                                    }}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {lob.description && (
                                                <p className="mt-3 text-sm text-muted-foreground">{lob.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Briefcase className="h-12 w-12 mb-3 opacity-50" />
                                    <p>No business types added yet</p>
                                    <p className="text-sm">Add the types of business this client is involved in</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Departments Tab */}
                    {activeTab === 'departments' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Departments</h3>
                                <Button size="sm" onClick={() => {
                                    setEditingDept(null);
                                    setDeptForm({ department_name: '', head_name: '' });
                                    setDeptModalOpen(true);
                                }}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Department
                                </Button>
                            </div>
                            {account.departments?.length > 0 ? (
                                <div className="space-y-3">
                                    {account.departments.map((dept) => {
                                        const deptPainPoints = account.painPoints?.filter(pp => pp.department_id === dept.id) || [];
                                        const isExpanded = expandedDepts.has(dept.id);
                                        return (
                                            <div key={dept.id} className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 shadow-sm overflow-hidden">
                                                <div className="p-4 flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-500/10 flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-violet-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{dept.department_name}</p>
                                                            {dept.head_name && (
                                                                <p className="text-xs text-muted-foreground">Head: {dept.head_name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {deptPainPoints.length} pain point{deptPainPoints.length !== 1 ? 's' : ''}
                                                        </span>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                                                setEditingDept(dept);
                                                                setDeptForm({ department_name: dept.department_name, head_name: dept.head_name });
                                                                setDeptModalOpen(true);
                                                            }}>
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                                                                setDeleteTarget({ type: 'dept', id: dept.id });
                                                                setDeleteDialogOpen(true);
                                                            }}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleDeptExpand(dept.id)}>
                                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                {isExpanded && (
                                                    <div className="px-4 pb-4 border-t border-border/50">
                                                        <div className="pt-3 flex justify-between items-center mb-2">
                                                            <p className="text-sm font-medium text-muted-foreground">Pain Points</p>
                                                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                                                                setSelectedDeptForPainPoint(dept.id);
                                                                setEditingPainPoint(null);
                                                                setPainPointForm({ pain_point: '', severity: 'Medium', notes: '' });
                                                                setPainPointModalOpen(true);
                                                            }}>
                                                                <Plus className="h-3 w-3 mr-1" /> Add Pain Point
                                                            </Button>
                                                        </div>
                                                        {deptPainPoints.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {deptPainPoints.map((pp) => (
                                                                    <div key={pp.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg group/pp">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`px-2 py-0.5 text-xs rounded-full border ${getSeverityColor(pp.severity)}`}>
                                                                                    {pp.severity}
                                                                                </span>
                                                                                <p className="text-sm font-medium">{pp.pain_point}</p>
                                                                            </div>
                                                                            {pp.notes && <p className="text-xs text-muted-foreground mt-1">{pp.notes}</p>}
                                                                        </div>
                                                                        <div className="flex gap-1 opacity-0 group-hover/pp:opacity-100 transition-opacity">
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                                                                setSelectedDeptForPainPoint(dept.id);
                                                                                setEditingPainPoint(pp);
                                                                                setPainPointForm({ pain_point: pp.pain_point, severity: pp.severity, notes: pp.notes });
                                                                                setPainPointModalOpen(true);
                                                                            }}>
                                                                                <Pencil className="h-3 w-3" />
                                                                            </Button>
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => {
                                                                                setDeleteTarget({ type: 'painpoint', id: pp.id, deptId: dept.id });
                                                                                setDeleteDialogOpen(true);
                                                                            }}>
                                                                                <Trash2 className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground text-center py-3">No pain points identified for this department</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Users className="h-12 w-12 mb-3 opacity-50" />
                                    <p>No departments added yet</p>
                                    <p className="text-sm">Add departments to track their specific needs</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Use Cases Tab */}
                    {activeTab === 'usecases' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Use Cases</h3>
                                <Button size="sm" onClick={() => {
                                    setEditingUseCase(null);
                                    setUseCaseForm({ use_case_title: '', description: '', status: 'Identified' });
                                    setUseCaseModalOpen(true);
                                }}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Use Case
                                </Button>
                            </div>
                            {account.useCases?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {account.useCases.map((uc) => (
                                        <div key={uc.id} className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 p-4 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
                                                        <Lightbulb className="h-5 w-5 text-amber-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{uc.use_case_title}</p>
                                                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full border mt-1 ${getUseCaseStatusColor(uc.status)}`}>
                                                            {uc.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                                        setEditingUseCase(uc);
                                                        setUseCaseForm({ use_case_title: uc.use_case_title, description: uc.description, status: uc.status });
                                                        setUseCaseModalOpen(true);
                                                    }}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                                                        setDeleteTarget({ type: 'usecase', id: uc.id });
                                                        setDeleteDialogOpen(true);
                                                    }}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {uc.description && (
                                                <p className="mt-3 text-sm text-muted-foreground">{uc.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Lightbulb className="h-12 w-12 mb-3 opacity-50" />
                                    <p>No use cases added yet</p>
                                    <p className="text-sm">Add potential use cases for this account</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pain Points Tab */}
                    {activeTab === 'painpoints' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">All Pain Points</h3>
                                {account.departments?.length > 0 && (
                                    <Select onValueChange={(val) => {
                                        setSelectedDeptForPainPoint(Number(val));
                                        setEditingPainPoint(null);
                                        setPainPointForm({ pain_point: '', severity: 'Medium', notes: '' });
                                        setPainPointModalOpen(true);
                                    }}>
                                        <SelectTrigger className="w-[200px] h-8">
                                            <SelectValue placeholder="Add to department..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {account.departments.map(dept => (
                                                <SelectItem key={dept.id} value={String(dept.id)}>{dept.department_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            {account.painPoints?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {account.painPoints.map((pp) => (
                                        <div key={pp.id} className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border/50 p-4 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${pp.severity === 'Critical' ? 'bg-red-500/20' :
                                                        pp.severity === 'High' ? 'bg-orange-500/20' :
                                                            pp.severity === 'Medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                                                        }`}>
                                                        <AlertTriangle className={`h-5 w-5 ${pp.severity === 'Critical' ? 'text-red-500' :
                                                            pp.severity === 'High' ? 'text-orange-500' :
                                                                pp.severity === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                                                            }`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className={`px-2 py-0.5 text-xs rounded-full border ${getSeverityColor(pp.severity)}`}>
                                                                {pp.severity}
                                                            </span>
                                                            {pp.department_name && (
                                                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                                                    {pp.department_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="font-medium mt-1">{pp.pain_point}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                                        setSelectedDeptForPainPoint(pp.department_id);
                                                        setEditingPainPoint(pp);
                                                        setPainPointForm({ pain_point: pp.pain_point, severity: pp.severity, notes: pp.notes });
                                                        setPainPointModalOpen(true);
                                                    }}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => {
                                                        setDeleteTarget({ type: 'painpoint', id: pp.id, deptId: pp.department_id });
                                                        setDeleteDialogOpen(true);
                                                    }}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {pp.notes && (
                                                <p className="mt-3 text-sm text-muted-foreground">{pp.notes}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <AlertTriangle className="h-12 w-12 mb-3 opacity-50" />
                                    <p>No pain points identified yet</p>
                                    <p className="text-sm">Add departments first, then add pain points to each</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Telecall History Tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Telecall History</h3>
                            </div>
                            {telecallLogs.length > 0 ? (
                                <div className="border rounded-xl overflow-hidden bg-card">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">Date & Time</th>
                                                <th className="px-4 py-3 text-left font-medium">Caller</th>
                                                <th className="px-4 py-3 text-left font-medium">Outcome</th>
                                                <th className="px-4 py-3 text-left font-medium">Follow-up</th>
                                                <th className="px-4 py-3 text-left font-medium">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {telecallLogs.map((log) => (
                                                <tr key={log.call_id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                                        {new Date(log.call_datetime).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {log.caller_name || 'System'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={cn(
                                                            "inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                                            log.call_outcome === 'Interested' ? "bg-green-100 text-green-800 border-green-200" :
                                                                log.call_outcome === 'Not Interested' ? "bg-red-100 text-red-800 border-red-200" :
                                                                    log.call_outcome === 'Call Back Requested' ? "bg-amber-100 text-amber-800 border-amber-200" :
                                                                        "bg-gray-100 text-gray-800 border-gray-200"
                                                        )}>
                                                            {log.call_outcome}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                                        {log.follow_up_required && log.follow_up_date
                                                            ? formatDate(log.follow_up_date)
                                                            : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="max-w-xs truncate" title={log.call_notes}>
                                                            {log.call_notes || '-'}
                                                        </p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
                                    <Phone className="h-12 w-12 mb-3 opacity-30" />
                                    <p>No call history available for this account</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Modal */}
            <CompactModal open={contactModalOpen} onOpenChange={setContactModalOpen} title={editingContact ? 'Edit Contact' : 'Add Contact'}>
                <div className="grid gap-3">
                    <div>
                        <Label className="text-xs">Name *</Label>
                        <Input value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                        <Label className="text-xs">Role</Label>
                        <Input value={contactForm.role} onChange={e => setContactForm({ ...contactForm, role: e.target.value })} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                        <Label className="text-xs">Phone</Label>
                        <Input value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                        <Label className="text-xs">Email</Label>
                        <Input type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} className="h-8 text-sm mt-1" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => setContactModalOpen(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleContactSubmit} disabled={!contactForm.name}>{editingContact ? 'Update' : 'Add'}</Button>
                </div>
            </CompactModal>

            {/* Line of Business Modal */}
            <CompactModal open={lobModalOpen} onOpenChange={setLobModalOpen} title={editingLob ? 'Edit Business Type' : 'Add Business Type'}>
                <div className="grid gap-3">
                    <div>
                        <Label className="text-xs">Business Type *</Label>
                        <Select
                            value={lobForm.business_type}
                            onValueChange={v => setLobForm({ ...lobForm, business_type: v })}
                        >
                            <SelectTrigger className="h-8 text-sm mt-1">
                                <SelectValue placeholder="Select Business Type" />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
                                {allIndustryLOBs
                                    .filter(lob => !account.industry || lob.industry_name === account.industry)
                                    .map(lob => (
                                        <SelectItem key={lob.lob_id} value={lob.lob_name}>{lob.lob_name}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea value={lobForm.description} onChange={e => setLobForm({ ...lobForm, description: e.target.value })} className="text-sm mt-1 h-20 resize-none" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => setLobModalOpen(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleLobSubmit} disabled={!lobForm.business_type}>{editingLob ? 'Update' : 'Add'}</Button>
                </div>
            </CompactModal>

            {/* Department Modal */}
            <CompactModal open={deptModalOpen} onOpenChange={setDeptModalOpen} title={editingDept ? 'Edit Department' : 'Add Department'}>
                <div className="grid gap-3">
                    <div>
                        <Label className="text-xs">Department Name *</Label>
                        <Select
                            value={deptForm.department_name}
                            onValueChange={v => setDeptForm({ ...deptForm, department_name: v })}
                        >
                            <SelectTrigger className="h-8 text-sm mt-1">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
                                {departmentsMaster.map(dept => (
                                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Department Head</Label>
                        <Input value={deptForm.head_name} onChange={e => setDeptForm({ ...deptForm, head_name: e.target.value })} className="h-8 text-sm mt-1" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => setDeptModalOpen(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleDeptSubmit} disabled={!deptForm.department_name}>{editingDept ? 'Update' : 'Add'}</Button>
                </div>
            </CompactModal>

            {/* Use Case Modal */}
            <CompactModal open={useCaseModalOpen} onOpenChange={setUseCaseModalOpen} title={editingUseCase ? 'Edit Use Case' : 'Add Use Case'}>
                <div className="grid gap-3">
                    <div>
                        <Label className="text-xs">Use Case Title *</Label>
                        <Select
                            value={useCaseForm.use_case_title}
                            onValueChange={v => setUseCaseForm({ ...useCaseForm, use_case_title: v })}
                        >
                            <SelectTrigger className="h-8 text-sm mt-1">
                                <SelectValue placeholder="Select Use Case" />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
                                {useCasesMaster.map(uc => (
                                    <SelectItem key={uc.id} value={uc.name}>{uc.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Status</Label>
                        <Select value={useCaseForm.status} onValueChange={v => setUseCaseForm({ ...useCaseForm, status: v })}>
                            <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Identified">Identified</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Implemented">Implemented</SelectItem>
                                <SelectItem value="On Hold">On Hold</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea value={useCaseForm.description} onChange={e => setUseCaseForm({ ...useCaseForm, description: e.target.value })} className="text-sm mt-1 h-20 resize-none" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => setUseCaseModalOpen(false)}>Cancel</Button>
                    <Button size="sm" onClick={handleUseCaseSubmit} disabled={!useCaseForm.use_case_title}>{editingUseCase ? 'Update' : 'Add'}</Button>
                </div>
            </CompactModal>

            {/* Pain Point Modal */}
            <CompactModal open={painPointModalOpen} onOpenChange={setPainPointModalOpen} title={editingPainPoint ? 'Edit Pain Point' : 'Add Pain Point'}>
                <div className="grid gap-3">
                    <div>
                        <Label className="text-xs">Pain Point *</Label>
                        <Input value={painPointForm.pain_point} onChange={e => setPainPointForm({ ...painPointForm, pain_point: e.target.value })} className="h-8 text-sm mt-1" />
                    </div>
                    <div>
                        <Label className="text-xs">Severity</Label>
                        <Select value={painPointForm.severity} onValueChange={v => setPainPointForm({ ...painPointForm, severity: v })}>
                            <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Notes</Label>
                        <Textarea value={painPointForm.notes} onChange={e => setPainPointForm({ ...painPointForm, notes: e.target.value })} className="text-sm mt-1 h-20 resize-none" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => setPainPointModalOpen(false)}>Cancel</Button>
                    <Button size="sm" onClick={handlePainPointSubmit} disabled={!painPointForm.pain_point}>{editingPainPoint ? 'Update' : 'Add'}</Button>
                </div>
            </CompactModal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Confirm Delete"
                description="Are you sure you want to delete this item? This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleDelete}
                variant="destructive"
            />

            {/* Account Edit Modal */}
            <CompactModal
                open={accountEditModalOpen}
                onOpenChange={setAccountEditModalOpen}
                title="Edit Account Details"
                size="lg"
            >
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <Label className="text-xs">Account Name *</Label>
                        <Input
                            value={accountForm.account_name || ''}
                            onChange={e => setAccountForm({ ...accountForm, account_name: e.target.value })}
                            className="h-8 text-sm mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Industry</Label>
                        <Select
                            value={accountForm.industry || ''}
                            onValueChange={v => setAccountForm({ ...accountForm, industry: v, primary_lob: '' })}
                        >
                            <SelectTrigger className="h-8 text-sm mt-1">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
                                {industries.map(i => (
                                    <SelectItem key={i} value={i}>{i}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Status</Label>
                        <Select
                            value={accountForm.account_status || 'Prospect'}
                            onValueChange={v => setAccountForm({ ...accountForm, account_status: v as AccountStatus })}
                        >
                            <SelectTrigger className="h-8 text-sm mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
                                {statuses.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Head Office (City)</Label>
                        <Select
                            value={accountForm.head_office || ''}
                            onValueChange={v => setAccountForm({ ...accountForm, head_office: v })}
                        >
                            <SelectTrigger className="h-8 text-sm mt-1">
                                <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
                                {cities.map(c => (
                                    <SelectItem key={c.city_id} value={c.city_name}>{c.city_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Country</Label>
                        <Select
                            value={accountForm.country || ''}
                            onValueChange={v => setAccountForm({ ...accountForm, country: v })}
                        >
                            <SelectTrigger className="h-8 text-sm mt-1">
                                <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
                                {countries.map(c => (
                                    <SelectItem key={c.country_id} value={c.country_name}>{c.country_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Primary LOB</Label>
                        <Select
                            value={accountForm.primary_lob || ''}
                            onValueChange={v => setAccountForm({ ...accountForm, primary_lob: v })}
                        >
                            <SelectTrigger className="h-8 text-sm mt-1">
                                <SelectValue placeholder="Select LOB" />
                            </SelectTrigger>
                            <SelectContent position="popper" side="bottom" className="max-h-[200px] overflow-y-auto">
                                {allIndustryLOBs
                                    .filter(lob => !accountForm.industry || lob.industry_name === accountForm.industry)
                                    .map(lob => (
                                        <SelectItem key={lob.lob_id} value={lob.lob_name}>{lob.lob_name}</SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Employee Count</Label>
                        <Input
                            type="number"
                            value={accountForm.employee_count || ''}
                            onChange={e => setAccountForm({ ...accountForm, employee_count: Number(e.target.value) })}
                            className="h-8 text-sm mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Total Revenue</Label>
                        <Input
                            type="number"
                            value={accountForm.total_revenue || ''}
                            onChange={e => setAccountForm({ ...accountForm, total_revenue: Number(e.target.value) })}
                            className="h-8 text-sm mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Data Completion Score (%)</Label>
                        <Input
                            type="number"
                            value={accountForm.data_completion_score || ''}
                            onChange={e => setAccountForm({ ...accountForm, data_completion_score: Number(e.target.value) })}
                            className="h-8 text-sm mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Company Website</Label>
                        <Input
                            value={accountForm.company_website || ''}
                            onChange={e => setAccountForm({ ...accountForm, company_website: e.target.value })}
                            className="h-8 text-sm mt-1"
                        />
                    </div>
                    <div className="col-span-2 py-2 border-t border-b bg-muted/20 my-2">
                        <p className="text-xs font-semibold px-1">Primary Contact Information</p>
                    </div>
                    <div>
                        <Label className="text-xs">Contact Name</Label>
                        <Input
                            value={accountForm.primary_contact_name || ''}
                            onChange={e => setAccountForm({ ...accountForm, primary_contact_name: e.target.value })}
                            className="h-8 text-sm mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Contact Role</Label>
                        <Input
                            value={accountForm.contact_person_role || ''}
                            onChange={e => setAccountForm({ ...accountForm, contact_person_role: e.target.value })}
                            className="h-8 text-sm mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Contact Phone</Label>
                        <Input
                            value={accountForm.contact_phone || ''}
                            onChange={e => setAccountForm({ ...accountForm, contact_phone: e.target.value })}
                            className="h-8 text-sm mt-1"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Contact Email</Label>
                        <Input
                            type="email"
                            value={accountForm.contact_email || ''}
                            onChange={e => setAccountForm({ ...accountForm, contact_email: e.target.value })}
                            className="h-8 text-sm mt-1"
                        />
                    </div>
                    <div className="col-span-2">
                        <Label className="text-xs">Remarks</Label>
                        <Textarea
                            value={accountForm.remarks || ''}
                            onChange={e => setAccountForm({ ...accountForm, remarks: e.target.value })}
                            className="text-sm mt-1 h-16 resize-none"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                    <Button variant="outline" size="sm" onClick={() => setAccountEditModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleAccountSave}>
                        Save Changes
                    </Button>
                </div>
            </CompactModal>
        </AppLayout>
    );
}
