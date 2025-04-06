
import React, { useState, useRef } from 'react';
import { CompleteTransaction, Attachment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { transactionService } from '@/lib/transaction-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Download, FileText, Image, Paperclip, Plus, X } from 'lucide-react';

interface AttachmentsContentProps {
  transaction: CompleteTransaction;
  refreshTransaction: () => Promise<void>;
}

const AttachmentsContent: React.FC<AttachmentsContentProps> = ({ transaction, refreshTransaction }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload files",
          variant: "destructive",
        });
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Upload the file
        await transactionService.addAttachment(
          transaction.transaction.id,
          user.id,
          file,
          file.name,
          file.type
        );
      }

      await refreshTransaction();

      toast({
        title: "Success",
        description: `${files.length} ${files.length === 1 ? 'file' : 'files'} uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    try {
      await transactionService.deleteAttachment(id);
      await refreshTransaction();

      toast({
        title: "Success",
        description: "Attachment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    } else {
      return <FileText className="h-6 w-6 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Attachments</h2>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="default"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Attachment
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          multiple
        />
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
      >
        <Paperclip className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">Drag and drop files here or</p>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Browse Files
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Supported file types: Images, PDFs, Documents
        </p>
      </div>

      {transaction.attachments.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No attachments added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {transaction.attachments.map((attachment) => (
            <div key={attachment.id} className="border rounded-lg p-4 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 mb-2">
                  {getFileIcon(attachment.file_type)}
                  <span className="font-medium truncate max-w-[150px]">{attachment.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive"
                  onClick={() => handleDeleteAttachment(attachment.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-grow flex items-center justify-center my-2">
                {attachment.file_type.startsWith('image/') ? (
                  <img
                    src={attachment.uri}
                    alt={attachment.name}
                    className="max-h-[100px] object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground text-sm px-2 py-1 bg-muted rounded">
                    {attachment.file_type.split('/')[1] || 'File'}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-2 flex justify-between items-center text-xs text-muted-foreground">
                <span>{attachment.created_at ? new Date(attachment.created_at).toLocaleDateString() : 'No date'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 p-0 text-primary"
                  asChild
                >
                  <a href={attachment.uri} download={attachment.name}>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentsContent;
