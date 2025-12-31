import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, Column } from '@/components/common/DataTable';
import { Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MASTER_TABLE_CONFIG = [
    { id: 'industry_master', name: 'Industries', pk: 'industry_id', field: 'industry_name' },
    { id: 'industry_line_of_business', name: 'LOBs', pk: 'lob_id', field: 'lob_name' },
    { id: 'lob_use_case_master', name: 'Use Cases', pk: 'use_case_id', field: 'use_case_name' },
    { id: 'lead_source_master', name: 'Lead Sources', pk: 'lead_source_id', field: 'lead_source_name' },
    { id: 'city_master', name: 'Cities', pk: 'city_id', field: 'city_name' },
    { id: 'country_master', name: 'Countries', pk: 'country_id', field: 'country_name' },
    { id: 'product_master', name: 'Products', pk: 'product_id', field: 'product_name' },
    { id: 'department_master', name: 'Departments', pk: 'department_master_id', field: 'department_name' },
    { id: 'lead_stages', name: 'Lead Stages', pk: 'stage_id', field: 'stage_name' },
    {
        id: 'users',
        name: 'Users',
        pk: 'user_id',
        field: 'full_name',
        extraFields: [
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'role', label: 'Role', type: 'text' }
        ]
    },
];

export function MasterTableManager() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState(MASTER_TABLE_CONFIG[0].id);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newData, setNewData] = useState<Record<string, string>>({});
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [editData, setEditData] = useState<Record<string, string>>({});

    const currentConfig = MASTER_TABLE_CONFIG.find(c => c.id === activeTab)!;

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await api.fetchMasterTable(activeTab);
            setData(result);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to fetch master data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setSearchQuery('');
        setIsAdding(false);
        setEditingId(null);
        setNewData({});
    }, [activeTab]);

    const handleAdd = async () => {
        if (!newData[currentConfig.field]?.trim()) return;
        try {
            await api.addMasterRecord(activeTab, newData);
            setNewData({});
            setIsAdding(false);
            fetchData();
            toast({ title: 'Success', description: 'Record added successfully' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add record. Please check all fields.', variant: 'destructive' });
        }
    };

    const handleUpdate = async (id: number | string) => {
        if (!editData[currentConfig.field]?.trim()) return;
        try {
            await api.updateMasterRecord(activeTab, id, editData);
            setEditingId(null);
            fetchData();
            toast({ title: 'Success', description: 'Record updated successfully' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update record', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: number | string) => {
        try {
            await api.deleteMasterRecord(activeTab, id);
            fetchData();
            toast({ title: 'Success', description: 'Record deleted successfully' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete record. It might be in use.', variant: 'destructive' });
        }
    };

    const filteredData = data.filter(item =>
        String(item[currentConfig.field] || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.email && String(item.email).toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const columns: Column<any>[] = [
        {
            key: currentConfig.field,
            header: currentConfig.name,
            render: (row) => {
                const isEditing = editingId === row[currentConfig.pk];
                if (isEditing) {
                    return (
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <Input
                                placeholder={`Enter ${currentConfig.field}`}
                                value={editData[currentConfig.field] || ''}
                                onChange={(e) => setEditData({ ...editData, [currentConfig.field]: e.target.value })}
                                className="h-8 py-0"
                                autoFocus
                            />
                            {currentConfig.extraFields?.map(f => (
                                <Input
                                    key={f.name}
                                    type={f.type}
                                    placeholder={`Enter ${f.label}`}
                                    value={editData[f.name] || ''}
                                    onChange={(e) => setEditData({ ...editData, [f.name]: e.target.value })}
                                    className="h-8 py-0"
                                />
                            ))}
                            <div className="flex gap-1 mt-1">
                                <Button size="sm" className="h-7 px-2 text-[10px]" onClick={() => handleUpdate(row[currentConfig.pk])}>
                                    <Check className="h-3 w-3 mr-1" /> Save
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => setEditingId(null)}>
                                    <X className="h-3 w-3 mr-1" /> Cancel
                                </Button>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{row[currentConfig.field]}</span>
                        {activeTab === 'users' && <span className="text-[10px] text-muted-foreground">{row.email || 'No email'}</span>}
                    </div>
                );
            }
        },
        ...(activeTab === 'users' ? [
            {
                key: 'role',
                header: 'Role',
                render: (row: any) => <span className="text-xs">{row.role || 'User'}</span>
            },
            {
                key: 'status',
                header: 'Status',
                render: (row: any) => (
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${row.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {row.status || 'Active'}
                    </span>
                )
            }
        ] : []),
        {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-1 justify-end">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => {
                            setEditingId(row[currentConfig.pk]);
                            const initialEditData = { [currentConfig.field]: row[currentConfig.field] };
                            currentConfig.extraFields?.forEach(f => {
                                initialEditData[f.name] = row[f.name] || '';
                            });
                            setEditData(initialEditData);
                        }}
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete this {currentConfig.name.slice(0, -1)}.
                                    If this option is already assigned to any leads, this action might fail.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(row[currentConfig.pk])} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    ];

    return (
        <Card className="mt-6 border-primary/10 shadow-sm">
            <CardHeader className="py-4 px-6 border-b bg-muted/30">
                <CardTitle className="text-base font-semibold text-primary">Master Data Management</CardTitle>
                <p className="text-xs text-muted-foreground">Manage dropdown options for various lead and account fields</p>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-6 pt-4 bg-muted/10 border-b overflow-x-auto">
                        <TabsList className="bg-transparent border-b-0 gap-2 h-auto flex-nowrap justify-start min-w-max pb-2">
                            {MASTER_TABLE_CONFIG.map(config => (
                                <TabsTrigger
                                    key={config.id}
                                    value={config.id}
                                    className="px-4 py-2 text-xs border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none whitespace-nowrap"
                                >
                                    {config.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={`Search ${currentConfig.name.toLowerCase()}...`}
                                    className="pl-9 h-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {!isAdding ? (
                                <Button size="sm" onClick={() => setIsAdding(true)}>
                                    <Plus className="h-4 w-4 mr-1.5" />
                                    Add {currentConfig.name.slice(0, -1)}
                                </Button>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-muted/20 p-3 rounded-lg border border-primary/10">
                                    <Input
                                        placeholder={`Enter ${currentConfig.name.slice(0, -1).toLowerCase()} name`}
                                        className="h-9 min-w-[200px]"
                                        value={newData[currentConfig.field] || ''}
                                        onChange={(e) => setNewData({ ...newData, [currentConfig.field]: e.target.value })}
                                        autoFocus
                                    />
                                    {currentConfig.extraFields?.map(f => (
                                        <Input
                                            key={f.name}
                                            type={f.type}
                                            placeholder={`Enter ${f.label.toLowerCase()}`}
                                            className="h-9 min-w-[150px]"
                                            value={newData[f.name] || ''}
                                            onChange={(e) => setNewData({ ...newData, [f.name]: e.target.value })}
                                        />
                                    ))}
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleAdd}>Save</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DataTable
                            columns={columns}
                            data={filteredData}
                            loading={loading}
                            page={1}
                            limit={100}
                            onPageChange={() => { }}
                            total={filteredData.length}
                            emptyMessage={`No ${currentConfig.name.toLowerCase()} found`}
                        />
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
