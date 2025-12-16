import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CompactModal } from '@/components/common/CompactModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LeadStage, LeadStageStatus } from '@/types';
import { mockLeadStages, mockLeadStatuses } from '@/lib/mockData';

export default function Stages() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [stages, setStages] = useState<LeadStage[]>(mockLeadStages);
  const [statuses, setStatuses] = useState<LeadStageStatus[]>(mockLeadStatuses);
  const [selectedStage, setSelectedStage] = useState<LeadStage | null>(stages[0] || null);
  
  // Modal states
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteStageDialogOpen, setDeleteStageDialogOpen] = useState(false);
  const [deleteStatusDialogOpen, setDeleteStatusDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<LeadStage | null>(null);
  const [editingStatus, setEditingStatus] = useState<LeadStageStatus | null>(null);
  const [stageName, setStageName] = useState('');
  const [statusName, setStatusName] = useState('');

  // Only Admin can access this page
  if (currentUser?.role !== 'Admin') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Access denied. Admin only.</p>
        </div>
      </AppLayout>
    );
  }

  const stageStatuses = statuses.filter(s => s.stage_id === selectedStage?.stage_id);

  // Stage handlers
  const handleEditStage = (stage: LeadStage | null) => {
    setEditingStage(stage);
    setStageName(stage?.stage_name || '');
    setStageModalOpen(true);
  };

  const handleSaveStage = () => {
    if (!stageName.trim()) {
      toast({ title: 'Error', description: 'Stage name is required', variant: 'destructive' });
      return;
    }

    if (editingStage) {
      setStages(stages.map(s => 
        s.stage_id === editingStage.stage_id ? { ...s, stage_name: stageName } : s
      ));
      toast({ title: 'Stage updated' });
    } else {
      const newStage: LeadStage = {
        stage_id: Math.max(...stages.map(s => s.stage_id)) + 1,
        stage_name: stageName,
      };
      setStages([...stages, newStage]);
      toast({ title: 'Stage created' });
    }
    setStageModalOpen(false);
  };

  const handleDeleteStage = (stage: LeadStage) => {
    setEditingStage(stage);
    setDeleteStageDialogOpen(true);
  };

  const confirmDeleteStage = () => {
    if (editingStage) {
      setStages(stages.filter(s => s.stage_id !== editingStage.stage_id));
      setStatuses(statuses.filter(s => s.stage_id !== editingStage.stage_id));
      if (selectedStage?.stage_id === editingStage.stage_id) {
        setSelectedStage(stages.find(s => s.stage_id !== editingStage.stage_id) || null);
      }
      toast({ title: 'Stage deleted' });
    }
    setDeleteStageDialogOpen(false);
  };

  // Status handlers
  const handleEditStatus = (status: LeadStageStatus | null) => {
    setEditingStatus(status);
    setStatusName(status?.status_name || '');
    setStatusModalOpen(true);
  };

  const handleSaveStatus = () => {
    if (!statusName.trim() || !selectedStage) {
      toast({ title: 'Error', description: 'Status name is required', variant: 'destructive' });
      return;
    }

    if (editingStatus) {
      setStatuses(statuses.map(s => 
        s.status_id === editingStatus.status_id ? { ...s, status_name: statusName } : s
      ));
      toast({ title: 'Status updated' });
    } else {
      const newStatus: LeadStageStatus = {
        status_id: Math.max(...statuses.map(s => s.status_id)) + 1,
        status_name: statusName,
        stage_id: selectedStage.stage_id,
      };
      setStatuses([...statuses, newStatus]);
      toast({ title: 'Status created' });
    }
    setStatusModalOpen(false);
  };

  const handleDeleteStatus = (status: LeadStageStatus) => {
    setEditingStatus(status);
    setDeleteStatusDialogOpen(true);
  };

  const confirmDeleteStatus = () => {
    if (editingStatus) {
      setStatuses(statuses.filter(s => s.status_id !== editingStatus.status_id));
      toast({ title: 'Status deleted' });
    }
    setDeleteStatusDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Lead Stages & Status</h1>
            <p className="text-sm text-muted-foreground">Configure your sales pipeline stages</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Stages */}
          <Card>
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Stages</CardTitle>
              <Button size="sm" className="h-7 text-xs" onClick={() => handleEditStage(null)}>
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {stages.map(stage => (
                  <div
                    key={stage.stage_id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      selectedStage?.stage_id === stage.stage_id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedStage(stage)}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight className={`h-4 w-4 transition-transform ${
                        selectedStage?.stage_id === stage.stage_id ? 'rotate-90 text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className="text-sm font-medium">{stage.stage_name}</span>
                      <Badge variant="secondary" className="text-2xs">
                        {statuses.filter(s => s.stage_id === stage.stage_id).length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={(e) => { e.stopPropagation(); handleEditStage(stage); }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDeleteStage(stage); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statuses */}
          <Card>
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {selectedStage ? `${selectedStage.stage_name} Statuses` : 'Select a Stage'}
              </CardTitle>
              {selectedStage && (
                <Button size="sm" className="h-7 text-xs" onClick={() => handleEditStatus(null)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-2">
              {selectedStage ? (
                <div className="space-y-1">
                  {stageStatuses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No statuses for this stage
                    </p>
                  ) : (
                    stageStatuses.map(status => (
                      <div
                        key={status.status_id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group"
                      >
                        <span className="text-sm">{status.status_name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleEditStatus(status)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleDeleteStatus(status)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Select a stage to view its statuses
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stage Modal */}
        <CompactModal
          open={stageModalOpen}
          onOpenChange={setStageModalOpen}
          title={editingStage ? 'Edit Stage' : 'Add Stage'}
          size="sm"
        >
          <div>
            <Label className="text-xs">Stage Name *</Label>
            <Input 
              value={stageName} 
              onChange={e => setStageName(e.target.value)}
              className="h-8 text-sm mt-1"
              placeholder="e.g., Qualification"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setStageModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveStage}>
              {editingStage ? 'Update' : 'Create'}
            </Button>
          </div>
        </CompactModal>

        {/* Status Modal */}
        <CompactModal
          open={statusModalOpen}
          onOpenChange={setStatusModalOpen}
          title={editingStatus ? 'Edit Status' : 'Add Status'}
          size="sm"
        >
          <div>
            <Label className="text-xs">Status Name *</Label>
            <Input 
              value={statusName} 
              onChange={e => setStatusName(e.target.value)}
              className="h-8 text-sm mt-1"
              placeholder="e.g., Meeting Scheduled"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveStatus}>
              {editingStatus ? 'Update' : 'Create'}
            </Button>
          </div>
        </CompactModal>

        {/* Delete Stage Confirmation */}
        <ConfirmDialog
          open={deleteStageDialogOpen}
          onOpenChange={setDeleteStageDialogOpen}
          title="Delete Stage"
          description="Are you sure you want to delete this stage and all its statuses? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={confirmDeleteStage}
          variant="destructive"
        />

        {/* Delete Status Confirmation */}
        <ConfirmDialog
          open={deleteStatusDialogOpen}
          onOpenChange={setDeleteStatusDialogOpen}
          title="Delete Status"
          description="Are you sure you want to delete this status? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={confirmDeleteStatus}
          variant="destructive"
        />
      </div>
    </AppLayout>
  );
}
