
import React, { useState } from 'react';
import { CompleteTransaction, TransactionNote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { transactionService } from '@/lib/transaction-service';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Save } from 'lucide-react';

interface NotesContentProps {
  transaction: CompleteTransaction;
  refreshTransaction: () => Promise<void>;
}

const NotesContent: React.FC<NotesContentProps> = ({ transaction, refreshTransaction }) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isEditingNoteId, setIsEditingNoteId] = useState<string | null>(null);
  const [isDeletingNoteId, setIsDeletingNoteId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const { toast } = useToast();

  const addNote = async () => {
    try {
      if (!newNoteContent.trim()) {
        toast({
          title: "Error",
          description: "Note content cannot be empty",
          variant: "destructive",
        });
        return;
      }

      await transactionService.addNote(transaction.transaction.id, newNoteContent.trim());

      toast({
        title: "Success",
        description: "Note added successfully",
      });

      setIsAddingNote(false);
      setNewNoteContent('');

      await refreshTransaction();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const startEditingNote = (note: TransactionNote) => {
    setIsEditingNoteId(note.id);
    setEditNoteContent(note.note);
  };

  const cancelEditingNote = () => {
    setIsEditingNoteId(null);
    setEditNoteContent('');
  };

  const saveEditedNote = async (noteId: string) => {
    try {
      if (!editNoteContent.trim()) {
        toast({
          title: "Error",
          description: "Note content cannot be empty",
          variant: "destructive",
        });
        return;
      }

      // Find the note to update
      const noteToUpdate = transaction.notes.find(note => note.id === noteId);

      if (!noteToUpdate) {
        throw new Error('Note not found');
      }

      // Update the note
      await transactionService.updateNote({
        ...noteToUpdate,
        note: editNoteContent.trim()
      });

      toast({
        title: "Success",
        description: "Note updated successfully",
      });

      setIsEditingNoteId(null);
      setEditNoteContent('');

      await refreshTransaction();
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await transactionService.deleteNote(noteId);

      toast({
        title: "Success",
        description: "Note deleted successfully",
      });

      setIsDeletingNoteId(null);

      await refreshTransaction();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notes</h2>
        <Button
          onClick={() => setIsAddingNote(true)}
          variant="default"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Note
        </Button>
      </div>

      {transaction.notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No notes added yet. Add your first note.
        </div>
      ) : (
        <div className="space-y-4">
          {transaction.notes.map((note) => (
            <div key={note.id} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-muted-foreground">
                  {note.created_at ? new Date(note.created_at).toLocaleDateString() + ' ' + new Date(note.created_at).toLocaleTimeString() : 'No date'}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditingNote(note)}
                    className="h-7 px-2"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeletingNoteId(note.id)}
                    className="h-7 px-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {isEditingNoteId === note.id ? (
                <div className="mt-2 space-y-3">
                  <Textarea
                    value={editNoteContent}
                    onChange={(e) => setEditNoteContent(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEditingNote}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => saveEditedNote(note.id)}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{note.note}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Note Dialog */}
      <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="noteContent">Note Content</Label>
              <Textarea
                id="noteContent"
                placeholder="Enter note content"
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingNote(false)}>Cancel</Button>
            <Button onClick={addNote}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation Dialog */}
      <Dialog open={!!isDeletingNoteId} onOpenChange={(open) => !open && setIsDeletingNoteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this note? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletingNoteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => isDeletingNoteId && deleteNote(isDeletingNoteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesContent;
