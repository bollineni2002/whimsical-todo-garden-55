import React, { useState, useEffect } from 'react';
import { DailyLog } from '@/lib/types';
import { dbService } from '@/lib/db-service';
import { supabaseService } from '@/lib/supabase-service';
import { syncService } from '@/lib/sync-service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Edit, Trash2, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const DailyLogsList: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<DailyLog[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [newLog, setNewLog] = useState<Omit<DailyLog, 'id' | 'created_at'>>({
    user_id: '',
    direction: 'paid',
    payment_type: 'cash',
    date: new Date().toISOString(),
    recipient_name: '',
    amount: 0,
    is_third_party: false,
    third_party_name: '',
    notes: '',
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, [user]);

  useEffect(() => {
    if (logs.length > 0) {
      filterLogs();
    } else {
      setFilteredLogs([]);
    }
  }, [logs, searchQuery]);

  const loadLogs = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await dbService.getDailyLogsByUser(user.id);
      // Sort logs by date (newest first)
      const sortedLogs = [...data].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setLogs(sortedLogs);
    } catch (error) {
      console.error('Failed to load daily logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load daily logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    if (!searchQuery.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = logs.filter(
      log =>
        log.recipient_name.toLowerCase().includes(query) ||
        (log.third_party_name && log.third_party_name.toLowerCase().includes(query)) ||
        (log.notes && log.notes.toLowerCase().includes(query))
    );
    setFilteredLogs(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseFloat(value) : value;

    if (isEditDialogOpen && selectedLog) {
      setSelectedLog({
        ...selectedLog,
        [name]: processedValue,
      });
    } else {
      setNewLog({
        ...newLog,
        [name]: processedValue,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (isEditDialogOpen && selectedLog) {
      setSelectedLog({
        ...selectedLog,
        [name]: value,
      });
    } else {
      setNewLog({
        ...newLog,
        [name]: value,
      });
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (isEditDialogOpen && selectedLog) {
      setSelectedLog({
        ...selectedLog,
        [name]: checked,
      });
    } else {
      setNewLog({
        ...newLog,
        [name]: checked,
      });
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;

    if (isEditDialogOpen && selectedLog) {
      setSelectedLog({
        ...selectedLog,
        date: date.toISOString(),
      });
    } else {
      setNewLog({
        ...newLog,
        date: date.toISOString(),
      });
    }
  };

  const handleAddLog = async () => {
    if (!user?.id) {
      console.error('Cannot add log: User ID is missing');
      return;
    }

    try {
      console.log('Adding new daily log...');

      if (!newLog.recipient_name || !newLog.amount) {
        console.log('Validation error: Recipient name or amount is missing');
        toast({
          title: 'Validation Error',
          description: 'Recipient name and amount are required',
          variant: 'destructive',
        });
        return;
      }

      if (newLog.is_third_party && !newLog.third_party_name) {
        console.log('Validation error: Third party name is required when third party is enabled');
        toast({
          title: 'Validation Error',
          description: 'Third party name is required when third party is enabled',
          variant: 'destructive',
        });
        return;
      }

      const logToAdd = {
        ...newLog,
        user_id: user.id,
      };

      console.log('Adding daily log to local database:', logToAdd);

      // Add daily log to local database
      const createdLog = await dbService.addDailyLog(logToAdd);
      console.log('Successfully added daily log to local database:', createdLog);

      // If online, also add to Supabase
      if (navigator.onLine) {
        console.log('Online, syncing daily log to Supabase...');
        try {
          const result = await supabaseService.createDailyLog(createdLog);
          if (result) {
            console.log('Successfully synced daily log to Supabase:', result);
          } else {
            console.error('Failed to sync daily log to Supabase: result was null');
          }
        } catch (error) {
          console.error('Error syncing daily log to Supabase:', error);
          // Continue even if Supabase sync fails
        }
      } else {
        console.log('Offline, skipping Supabase sync');
      }

      console.log('Reloading logs...');
      await loadLogs();

      setIsAddDialogOpen(false);
      setNewLog({
        user_id: user.id,
        direction: 'paid',
        payment_type: 'cash',
        date: new Date().toISOString(),
        recipient_name: '',
        amount: 0,
        is_third_party: false,
        third_party_name: '',
        notes: '',
      });

      toast({
        title: 'Success',
        description: 'Daily log added successfully',
      });

      // Force sync to ensure data is in Supabase
      if (navigator.onLine) {
        console.log('Forcing sync of all data...');
        try {
          await syncService.forceSyncContacts(user.id);
          console.log('Force sync completed successfully');
        } catch (syncError) {
          console.error('Error during force sync:', syncError);
        }
      }
    } catch (error) {
      console.error('Error adding daily log:', error);
      toast({
        title: 'Error',
        description: 'Failed to add daily log',
        variant: 'destructive',
      });
    }
  };

  const handleEditLog = async () => {
    if (!selectedLog) return;

    try {
      if (!selectedLog.recipient_name || !selectedLog.amount) {
        toast({
          title: 'Validation Error',
          description: 'Recipient name and amount are required',
          variant: 'destructive',
        });
        return;
      }

      if (selectedLog.is_third_party && !selectedLog.third_party_name) {
        toast({
          title: 'Validation Error',
          description: 'Third party name is required when third party is enabled',
          variant: 'destructive',
        });
        return;
      }

      // Update daily log in local database
      await dbService.updateDailyLog(selectedLog);

      // If online, also update in Supabase
      if (navigator.onLine) {
        try {
          await supabaseService.updateDailyLog(selectedLog);
        } catch (error) {
          console.error('Error syncing updated daily log to Supabase:', error);
          // Continue even if Supabase sync fails
        }
      }
      await loadLogs();

      setIsEditDialogOpen(false);
      setSelectedLog(null);

      toast({
        title: 'Success',
        description: 'Daily log updated successfully',
      });
    } catch (error) {
      console.error('Error updating daily log:', error);
      toast({
        title: 'Error',
        description: 'Failed to update daily log',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLog = async () => {
    if (!selectedLog) return;

    try {
      // Delete daily log from local database
      await dbService.deleteDailyLog(selectedLog.id);

      // If online, also delete from Supabase
      if (navigator.onLine) {
        try {
          await supabaseService.deleteDailyLog(selectedLog.id);
        } catch (error) {
          console.error('Error syncing deleted daily log to Supabase:', error);
          // Continue even if Supabase sync fails
        }
      }
      await loadLogs();

      setIsDeleteDialogOpen(false);
      setSelectedLog(null);

      toast({
        title: 'Success',
        description: 'Daily log deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting daily log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete daily log',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (log: DailyLog) => {
    setSelectedLog(log);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (log: DailyLog) => {
    setSelectedLog(log);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Daily Logs</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Log
          </Button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          {logs.length === 0
            ? "You haven't added any daily logs yet. Click 'Add Log' to get started."
            : "No logs match your search criteria."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLogs.map((log) => (
            <Card key={log.id} className={cn(
              "overflow-hidden",
              log.direction === 'received' ? "border-green-200 dark:border-green-900" : "border-red-200 dark:border-red-900"
            )}>
              <CardHeader className={cn(
                "pb-2",
                log.direction === 'received'
                  ? "bg-green-50 dark:bg-green-950/30"
                  : "bg-red-50 dark:bg-red-950/30"
              )}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {log.direction === 'received' ? (
                      <ArrowUpCircle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                    )}
                    <CardTitle className="text-lg">
                      {log.direction === 'received' ? 'Received' : 'Paid'}
                    </CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(log)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(log)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(log.date).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {log.direction === 'received' ? 'From:' : 'To:'}
                    </span>
                    <span className="text-sm font-medium">{log.recipient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className={cn(
                      "text-sm font-medium",
                      log.direction === 'received' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {formatCurrency(log.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Type:</span>
                    <span className="text-sm font-medium capitalize">{log.payment_type}</span>
                  </div>
                  {log.is_third_party && log.third_party_name && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Third Party:</span>
                      <span className="text-sm font-medium">{log.third_party_name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              {log.notes && (
                <CardFooter className="border-t pt-4 pb-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground">{log.notes}</p>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Log Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Daily Log</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="direction" className="text-right">
                Direction
              </Label>
              <div className="col-span-3">
                <Select
                  value={newLog.direction}
                  onValueChange={(value) => handleSelectChange('direction', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid (Outgoing)</SelectItem>
                    <SelectItem value="received">Received (Incoming)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newLog.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newLog.date ? format(new Date(newLog.date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newLog.date ? new Date(newLog.date) : undefined}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="recipient_name" className="text-right">
                {newLog.direction === 'received' ? 'From' : 'To'}
              </Label>
              <Input
                id="recipient_name"
                name="recipient_name"
                value={newLog.recipient_name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={newLog.amount || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_type" className="text-right">
                Payment Type
              </Label>
              <div className="col-span-3">
                <Select
                  value={newLog.payment_type}
                  onValueChange={(value) => handleSelectChange('payment_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_third_party" className="text-right">
                Third Party
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="is_third_party"
                  checked={newLog.is_third_party}
                  onCheckedChange={(checked) => handleSwitchChange('is_third_party', checked)}
                />
                <Label htmlFor="is_third_party">
                  {newLog.is_third_party ? 'Yes' : 'No'}
                </Label>
              </div>
            </div>
            {newLog.is_third_party && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="third_party_name" className="text-right">
                  Third Party Name
                </Label>
                <Input
                  id="third_party_name"
                  name="third_party_name"
                  value={newLog.third_party_name || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={newLog.notes || ''}
                onChange={handleInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLog}>Add Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Log Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Daily Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_direction" className="text-right">
                  Direction
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedLog.direction}
                    onValueChange={(value) => handleSelectChange('direction', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid (Outgoing)</SelectItem>
                      <SelectItem value="received">Received (Incoming)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_date" className="text-right">
                  Date
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedLog.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedLog.date ? format(new Date(selectedLog.date), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedLog.date ? new Date(selectedLog.date) : undefined}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_recipient_name" className="text-right">
                  {selectedLog.direction === 'received' ? 'From' : 'To'}
                </Label>
                <Input
                  id="edit_recipient_name"
                  name="recipient_name"
                  value={selectedLog.recipient_name}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="edit_amount"
                  name="amount"
                  type="number"
                  value={selectedLog.amount || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_payment_type" className="text-right">
                  Payment Type
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedLog.payment_type}
                    onValueChange={(value) => handleSelectChange('payment_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_is_third_party" className="text-right">
                  Third Party
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="edit_is_third_party"
                    checked={selectedLog.is_third_party}
                    onCheckedChange={(checked) => handleSwitchChange('is_third_party', checked)}
                  />
                  <Label htmlFor="edit_is_third_party">
                    {selectedLog.is_third_party ? 'Yes' : 'No'}
                  </Label>
                </div>
              </div>
              {selectedLog.is_third_party && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_third_party_name" className="text-right">
                    Third Party Name
                  </Label>
                  <Input
                    id="edit_third_party_name"
                    name="third_party_name"
                    value={selectedLog.third_party_name || ''}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="edit_notes"
                  name="notes"
                  value={selectedLog.notes || ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLog}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Log Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Daily Log</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this daily log? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLog}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyLogsList;
