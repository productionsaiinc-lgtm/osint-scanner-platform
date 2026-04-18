import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getScanHosts, getScanDomains, getScanProfiles, getUserScans } from "./db";
import {
  exportScanResultsJSON,
  exportScanResultsCSV,
  generatePDFReport,
  generateXLSXReport,
} from "./export";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportRouter = router({
  // Export scan results as JSON
  exportJSON: protectedProcedure
    .input(z.object({
      scanId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get scan data
        const scans: any = await getUserScans(ctx.user.id);
        const scan = scans?.find((s: any) => s.id === input.scanId);

        if (!scan) {
          throw new Error("Scan not found");
        }

        // Get related data
        const hosts = await getScanHosts(input.scanId);
        const domains = await getScanDomains(input.scanId);
        const profiles = await getScanProfiles(input.scanId);

        // Generate JSON export
        const jsonData = await exportScanResultsJSON(scan, hosts || [], domains || [], profiles || []);

        return {
          success: true,
          data: jsonData,
          filename: `scan-${input.scanId}-${new Date().getTime()}.json`,
        };
      } catch (error) {
        console.error("JSON export error:", error);
        throw new Error(`Failed to export JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  // Export scan results as CSV
  exportCSV: protectedProcedure
    .input(z.object({
      scanId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get scan data
        const scans: any = await getUserScans(ctx.user.id);
        const scan = scans?.find((s: any) => s.id === input.scanId);

        if (!scan) {
          throw new Error("Scan not found");
        }

        // Get related data
        const hosts = await getScanHosts(input.scanId);
        const domains = await getScanDomains(input.scanId);
        const profiles = await getScanProfiles(input.scanId);

        // Generate CSV export
        const csvData = await exportScanResultsCSV(scan, hosts || [], domains || [], profiles || []);

        return {
          success: true,
          data: csvData,
          filename: `scan-${input.scanId}-${new Date().getTime()}.csv`,
        };
      } catch (error) {
        console.error("CSV export error:", error);
        throw new Error(`Failed to export CSV: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  // Export scan results as PDF
  exportPDF: protectedProcedure
    .input(z.object({
      scanId: z.number(),
      includeAnalysis: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get scan data
        const scans: any = await getUserScans(ctx.user.id);
        const scan = scans?.find((s: any) => s.id === input.scanId);

        if (!scan) {
          throw new Error("Scan not found");
        }

        // Get related data
        const hosts = await getScanHosts(input.scanId);
        const domains = await getScanDomains(input.scanId);
        const profiles = await getScanProfiles(input.scanId);

        // Generate PDF report metadata
        const reportData = await generatePDFReport(
          scan,
          hosts || [],
          domains || [],
          profiles || [],
          input.includeAnalysis ? scan.analysisReport : undefined
        );

        // Create PDF document
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 20;

        // Add title
        doc.setFontSize(20);
        doc.text(reportData.title, 20, yPosition);
        yPosition += 15;

        // Add metadata
        doc.setFontSize(11);
        doc.text(`Scan Type: ${reportData.scanType}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Target: ${reportData.target}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Status: ${reportData.status}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Created: ${new Date(reportData.createdAt).toLocaleString()}`, 20, yPosition);
        yPosition += 10;

        // Add summary
        doc.setFontSize(12);
        doc.text("Summary", 20, yPosition);
        yPosition += 7;
        doc.setFontSize(10);
        doc.text(`Hosts Found: ${reportData.hostsCount}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Domains Found: ${reportData.domainsCount}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Profiles Found: ${reportData.profilesCount}`, 20, yPosition);
        yPosition += 10;

        // Add analysis if included
        if (input.includeAnalysis && reportData.analysis) {
          doc.setFontSize(12);
          doc.text("Analysis", 20, yPosition);
          yPosition += 7;
          doc.setFontSize(10);
          const analysisLines = doc.splitTextToSize(reportData.analysis, pageWidth - 40);
          doc.text(analysisLines, 20, yPosition);
          yPosition += analysisLines.length * 5 + 10;
        }

        // Add hosts section
        if (hosts && hosts.length > 0) {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFontSize(12);
          doc.text("Discovered Hosts", 20, yPosition);
          yPosition += 7;
          doc.setFontSize(9);

          const hostData = hosts.map((h: any) => [
            h.ipAddress || "N/A",
            h.hostname || "N/A",
            h.openPorts || "N/A",
            h.services || "N/A",
          ]);

          (doc as any).autoTable({
            head: [["IP Address", "Hostname", "Open Ports", "Services"]],
            body: hostData,
            startY: yPosition,
            margin: 20,
          });

          yPosition = (doc as any).lastAutoTable.finalY + 10;
        }

        // Add domains section
        if (domains && domains.length > 0) {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFontSize(12);
          doc.text("Domain Records", 20, yPosition);
          yPosition += 7;

          const domainData = domains.map((d: any) => [
            d.domain || "N/A",
            d.registrar || "N/A",
            d.registrationDate || "N/A",
            d.expirationDate || "N/A",
          ]);

          (doc as any).autoTable({
            head: [["Domain", "Registrar", "Registration Date", "Expiration Date"]],
            body: domainData,
            startY: yPosition,
            margin: 20,
          });

          yPosition = (doc as any).lastAutoTable.finalY + 10;
        }

        // Add profiles section
        if (profiles && profiles.length > 0) {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }
          doc.setFontSize(12);
          doc.text("Social Media Profiles", 20, yPosition);
          yPosition += 7;

          const profileData = profiles.map((p: any) => [
            p.username || "N/A",
            p.platform || "N/A",
            p.followers?.toString() || "N/A",
          ]);

          (doc as any).autoTable({
            head: [["Username", "Platform", "Followers"]],
            body: profileData,
            startY: yPosition,
            margin: 20,
          });
        }

        // Generate PDF as base64
        const pdfBase64 = doc.output("dataurlstring");

        return {
          success: true,
          data: pdfBase64,
          filename: `scan-${input.scanId}-${new Date().getTime()}.pdf`,
        };
      } catch (error) {
        console.error("PDF export error:", error);
        throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  // Export scan results as XLSX
  exportXLSX: protectedProcedure
    .input(z.object({
      scanId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get scan data
        const scans: any = await getUserScans(ctx.user.id);
        const scan = scans?.find((s: any) => s.id === input.scanId);

        if (!scan) {
          throw new Error("Scan not found");
        }

        // Get related data
        const hosts = await getScanHosts(input.scanId);
        const domains = await getScanDomains(input.scanId);
        const profiles = await getScanProfiles(input.scanId);

        // Generate XLSX report structure
        const reportData = await generateXLSXReport(scan, hosts || [], domains || [], profiles || []);

        // Create workbook
        const workbook = XLSX.utils.book_new();

        // Add each sheet
        reportData.sheets.forEach((sheet: any) => {
          const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
          XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
        });

        // Generate XLSX as base64
        const xlsxBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const xlsxBase64 = Buffer.from(xlsxBuffer).toString("base64");

        return {
          success: true,
          data: xlsxBase64,
          filename: `scan-${input.scanId}-${new Date().getTime()}.xlsx`,
        };
      } catch (error) {
        console.error("XLSX export error:", error);
        throw new Error(`Failed to export XLSX: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),
});
