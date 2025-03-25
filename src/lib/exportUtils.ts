
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Transaction } from './types';

export type ExportFormat = 'json' | 'csv' | 'pdf' | 'excel';

export const exportTransactions = async (
  transactions: Transaction[], 
  format: ExportFormat
): Promise<void> => {
  switch (format) {
    case 'json':
      return exportAsJSON(transactions);
    case 'csv':
      return exportAsCSV(transactions);
    case 'pdf':
      return exportAsPDF(transactions);
    case 'excel':
      return exportAsExcel(transactions);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

const exportAsJSON = (transactions: Transaction[]): Promise<void> => {
  return new Promise((resolve) => {
    const jsonData = JSON.stringify(transactions, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactly-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    resolve();
  });
};

const exportAsCSV = (transactions: Transaction[]): Promise<void> => {
  return new Promise((resolve) => {
    try {
      // Flatten transactions for CSV
      const flattenedData = transactions.map((t) => ({
        id: t.id,
        name: t.name,
        date: t.date,
        totalAmount: t.totalAmount,
        status: t.status,
        supplierName: t.loadBuy?.supplierName,
        goodsName: t.loadBuy?.goodsName,
        quantity: t.loadBuy?.quantity,
        purchaseRate: t.loadBuy?.purchaseRate,
        totalCost: t.loadBuy?.totalCost,
        buyerName: t.loadSold?.buyerName,
        saleRate: t.loadSold?.saleRate,
        totalSaleAmount: t.loadSold?.totalSaleAmount,
        origin: t.transportation?.origin,
        destination: t.transportation?.destination,
        transportCharges: t.transportation?.charges
      }));

      // Custom CSV generation - get headers from first item
      const headers = Object.keys(flattenedData[0] || {});
      
      // Convert data to CSV
      let csvContent = headers.join(',') + '\n';
      
      flattenedData.forEach(item => {
        const row = headers.map(header => {
          // Handle special characters and ensure proper CSV escaping
          const value = item[header as keyof typeof item];
          const stringValue = value === null || value === undefined ? '' : String(value);
          
          // Escape quotes and wrap in quotes if contains comma, newline, or quotes
          if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',');
        
        csvContent += row + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactly-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    } catch (error) {
      console.error('CSV Export error:', error);
      resolve();
    }
  });
};

const exportAsPDF = (transactions: Transaction[]): Promise<void> => {
  return new Promise((resolve) => {
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Transaction Export', 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Create table data
      const tableData = transactions.map((t) => [
        t.id.substring(0, 8) + '...',
        t.name || 'N/A',
        new Date(t.date || '').toLocaleDateString(),
        t.totalAmount?.toString() || '0',
        t.status || 'pending',
        t.loadBuy?.goodsName || 'N/A'
      ]);
      
      // Add table with autoTable
      (doc as any).autoTable({
        head: [['ID', 'Name', 'Date', 'Amount', 'Status', 'Goods']],
        body: tableData,
        startY: 40,
        headStyles: { fillColor: [51, 51, 51] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
      
      // Save the PDF
      doc.save(`transactly-export-${new Date().toISOString().split('T')[0]}.pdf`);
      resolve();
    } catch (error) {
      console.error('PDF Export error:', error);
      resolve();
    }
  });
};

const exportAsExcel = (transactions: Transaction[]): Promise<void> => {
  return new Promise((resolve) => {
    try {
      // Flatten transactions for Excel
      const flattenedData = transactions.map((t) => ({
        id: t.id,
        name: t.name,
        date: t.date,
        totalAmount: t.totalAmount,
        status: t.status,
        supplierName: t.loadBuy?.supplierName,
        goodsName: t.loadBuy?.goodsName,
        quantity: t.loadBuy?.quantity,
        purchaseRate: t.loadBuy?.purchaseRate,
        totalCost: t.loadBuy?.totalCost,
        buyerName: t.loadSold?.buyerName,
        saleRate: t.loadSold?.saleRate,
        totalSaleAmount: t.loadSold?.totalSaleAmount,
        origin: t.transportation?.origin,
        destination: t.transportation?.destination,
        transportCharges: t.transportation?.charges
      }));
      
      // Convert to XML (Excel compatible)
      let xml = '<?xml version="1.0"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n<Worksheet ss:Name="Sheet1">\n<Table>\n';
      
      // Add header row
      xml += '<Row>\n';
      Object.keys(flattenedData[0] || {}).forEach((key) => {
        xml += `<Cell><Data ss:Type="String">${key}</Data></Cell>\n`;
      });
      xml += '</Row>\n';
      
      // Add data rows
      flattenedData.forEach((item) => {
        xml += '<Row>\n';
        Object.values(item).forEach((value) => {
          if (value === undefined || value === null) {
            xml += '<Cell><Data ss:Type="String"></Data></Cell>\n';
          } else if (typeof value === 'number') {
            xml += `<Cell><Data ss:Type="Number">${value}</Data></Cell>\n`;
          } else {
            // Escape XML special characters
            const escapedValue = String(value)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
            xml += `<Cell><Data ss:Type="String">${escapedValue}</Data></Cell>\n`;
          }
        });
        xml += '</Row>\n';
      });
      
      xml += '</Table>\n</Worksheet>\n</Workbook>';
      
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactly-export-${new Date().toISOString().split('T')[0]}.xls`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    } catch (error) {
      console.error('Excel Export error:', error);
      resolve();
    }
  });
};
