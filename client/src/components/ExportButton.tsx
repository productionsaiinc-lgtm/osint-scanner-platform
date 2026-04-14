import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface ExportButtonProps {
  scanId: number;
  disabled?: boolean;
}

export function ExportButton({ scanId, disabled = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportJSON = trpc.export.exportJSON.useMutation({
    onSuccess: (data) => {
      const element = document.createElement('a');
      element.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data.data, null, 2))}`);
      element.setAttribute('download', data.filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('JSON exported successfully');
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
      setIsExporting(false);
    },
  });

  const exportCSV = trpc.export.exportCSV.useMutation({
    onSuccess: (data) => {
      const element = document.createElement('a');
      element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(data.data)}`);
      element.setAttribute('download', data.filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('CSV exported successfully');
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
      setIsExporting(false);
    },
  });

  const exportPDF = trpc.export.exportPDF.useMutation({
    onSuccess: (data) => {
      const link = document.createElement('a');
      link.href = data.data;
      link.download = data.filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF exported successfully');
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
      setIsExporting(false);
    },
  });

  const exportXLSX = trpc.export.exportXLSX.useMutation({
    onSuccess: (data) => {
      const link = document.createElement('a');
      const binaryString = atob(data.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = data.filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('XLSX exported successfully');
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
      setIsExporting(false);
    },
  });

  const handleExport = (format: 'json' | 'csv' | 'pdf' | 'xlsx') => {
    setIsExporting(true);
    switch (format) {
      case 'json':
        exportJSON.mutate({ scanId });
        break;
      case 'csv':
        exportCSV.mutate({ scanId });
        break;
      case 'pdf':
        exportPDF.mutate({ scanId, includeAnalysis: true });
        break;
      case 'xlsx':
        exportXLSX.mutate({ scanId });
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('json')} disabled={isExporting}>
          <FileJson className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isExporting}>
          <FileText className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting}>
          <FileText className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xlsx')} disabled={isExporting}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as XLSX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
