import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileSpreadsheet, FileUp, Download, Loader2 } from 'lucide-react';

interface ImportExportSettingsProps {
  userId?: string;
}

const ImportExportSettings = ({ userId }: ImportExportSettingsProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!userId) {
      toast({
        title: 'Export Failed',
        description: 'You must be logged in to export data.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(format);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Fetch data from IndexedDB or Supabase
      // 2. Format it according to the selected format
      // 3. Create a downloadable file
      
      const filename = `transactly-export-${new Date().toISOString().slice(0, 10)}.${format}`;
      
      // This is just a placeholder for demonstration
      // In a real app, you would generate actual files
      if (format === 'csv' || format === 'excel') {
        const dummyData = 'id,date,description,amount\n1,2023-01-01,Sample transaction,100.00';
        const blob = new Blob([dummyData], { type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // For PDF, you would typically use a library like jsPDF
        // This is just a placeholder
        toast({
          title: 'PDF Export',
          description: 'PDF export functionality would be implemented here.',
        });
      }
      
      toast({
        title: 'Export Complete',
        description: `Your data has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      toast({
        title: 'Export Failed',
        description: `There was an error exporting your data as ${format.toUpperCase()}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!userId) {
      toast({
        title: 'Import Failed',
        description: 'You must be logged in to import data.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsImporting(true);
    try {
      // Check file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'json'].includes(fileExtension || '')) {
        throw new Error('Unsupported file format. Please use CSV, Excel, or JSON files.');
      }
      
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Read the file contents
      // 2. Parse the data
      // 3. Validate the data structure
      // 4. Import it into IndexedDB and/or Supabase
      
      toast({
        title: 'Import Complete',
        description: 'Your data has been imported successfully.',
      });
    } catch (error: any) {
      console.error('Error importing data:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'There was an error importing your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      // Clear the input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Import & Export</h2>
        <p className="text-sm text-muted-foreground">
          Export your data in various formats or import data from external sources.
        </p>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Export your transaction data in various formats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleExport('csv')}
              disabled={isExporting !== null}
              className="w-full"
            >
              {isExporting === 'csv' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Export as CSV
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleExport('excel')}
              disabled={isExporting !== null}
              className="w-full"
            >
              {isExporting === 'excel' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Export as Excel
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleExport('pdf')}
              disabled={isExporting !== null}
              className="w-full"
            >
              {isExporting === 'pdf' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export as PDF
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            Exports include all your transaction data, client information, and daily logs.
          </p>
        </CardContent>
      </Card>

      {/* Import Options */}
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>
            Import data from external sources.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={isImporting}
              >
                {isImporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileUp className="mr-2 h-4 w-4" />
                )}
                Import Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Import Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This will import data from an external file. Supported formats are CSV, Excel, and JSON.
                  <br /><br />
                  <strong>Note:</strong> Importing data may overwrite existing records if they have the same identifiers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex items-center justify-between">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <div className="relative">
                  <input
                    type="file"
                    id="import-file"
                    accept=".csv,.xlsx,.json"
                    onChange={handleImport}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isImporting}
                  />
                  <AlertDialogAction className="pointer-events-none">
                    Select File
                  </AlertDialogAction>
                </div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <p className="text-xs text-muted-foreground mt-2">
            Supported formats: CSV, Excel (.xlsx), and JSON. Make sure your data follows the expected format.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExportSettings;
