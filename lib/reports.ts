import { reportApi } from "./api";
import { downloadWithAuth } from "./auth";

type ExportFormat = 'pdf' | 'csv' | 'excel';
type ReportType = 'summary' | 'budget' | 'team' | 'aiInsights' | 'comprehensive';

interface ExportOptions {
  reportType: ReportType;
  format: ExportFormat;
  projectId?: string;
  fileName?: string;
}

export const exportReport = async (options: ExportOptions): Promise<boolean> => {
  try {
    const { reportType, format, projectId, fileName = `${reportType}-report` } = options;

    // 1) Call the backend to "export" and get the download URL
    const response = await reportApi.exportReport({
      reportType,
      format,
      projectId,
    });

    if (!(response && response.success && typeof response.data?.url === "string")) {
      console.error("Export endpoint did not return a download URL.");
      return false;
    }

    // 2) Build the proper download URL
    let urlPath = response.data.url; // e.g. "/api/reports/download/summary_1234.pdf"
    const envBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Clean up the base URL
    let cleanBase = envBase;
    // If the base ends with "/api", strip that off when urlPath also begins with "/api"
    if (cleanBase.toLowerCase().endsWith("/api") && urlPath.startsWith("/api/")) {
      cleanBase = cleanBase.slice(0, cleanBase.length - 4);
    }
    // Remove any trailing slash from the base
    if (cleanBase.endsWith("/")) {
      cleanBase = cleanBase.slice(0, cleanBase.length - 1);
    }

    // Ensure urlPath starts with a single "/"
    if (!urlPath.startsWith("/")) {
      urlPath = "/" + urlPath;
    }
    // Fix any duplicate /api/api/ paths
    if (urlPath.startsWith("/api/api/")) {
      urlPath = urlPath.replace("/api/api/", "/api/");
    }

    // Construct the final download URL
    const downloadUrl = `${cleanBase}${urlPath}`;
    
    // 3) Use the authenticated download function to handle the file download
    return await downloadWithAuth(downloadUrl, `${fileName}.${format}`);
  } catch (error) {
    console.error("Error exporting report:", error);
    return false;
  }
};

export const getReportFileName = (reportType: ReportType, projectName?: string): string => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const baseName = reportType.charAt(0).toUpperCase() + reportType.slice(1);
  
  if (projectName && reportType === 'comprehensive') {
    return `${projectName.replace(/\s+/g, '-')}_${baseName}_Report_${timestamp}`;
  }
  
  return `${baseName}_Report_${timestamp}`;
};

export const supportedExportFormats: { value: ExportFormat; label: string }[] = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'csv', label: 'CSV Spreadsheet' },
  { value: 'excel', label: 'Excel Spreadsheet' },
];