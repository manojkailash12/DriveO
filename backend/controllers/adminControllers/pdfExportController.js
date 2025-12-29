import { generateInvoicePDF } from '../../services/pdfService.js';
import { generateOfflinePDF } from '../../services/offlinePdfService.js';
import { 
  generateFastFinancialPDF, 
  generateFastUsersPDF, 
  generateFastCustomersPDF, 
  generateFastBookingsPDF 
} from '../../services/fastAdminPdfService.js';

// Export PDF reports for admin pages using Fast PDF Service
export const exportPDF = async (req, res, next) => {
  try {
    const { type, data, title, period, status } = req.body;

    console.log(`Starting FAST PDF export for type: ${type}`);

    let pdfBuffer;
    let filename = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;

    // Use fast PDF service based on type
    try {
      switch (type) {
        case 'financial':
          pdfBuffer = await generateFastFinancialPDF(data, title, period, status);
          filename = `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'users':
          pdfBuffer = await generateFastUsersPDF(data, title);
          filename = `users-report-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'customers':
          pdfBuffer = await generateFastCustomersPDF(data, title);
          filename = `customers-report-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'bookings':
          pdfBuffer = await generateFastBookingsPDF(data, title);
          filename = `bookings-report-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'calendar':
          // Use bookings PDF for calendar data
          pdfBuffer = await generateFastBookingsPDF(data, 'Calendar Bookings Report');
          filename = `calendar-report-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        case 'analytics':
        case 'travel-analytics':
          // Handle analytics reports
          pdfBuffer = await generateFastBookingsPDF(data, title || 'DriveO Analytics Report');
          filename = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
        default:
          // Default to bookings report for unknown types
          pdfBuffer = await generateFastBookingsPDF(data, title || 'DriveO Report');
          filename = `report-${new Date().toISOString().split('T')[0]}.pdf`;
          break;
      }
      
      console.log(`FAST PDF generated successfully, buffer size: ${pdfBuffer.length} bytes`);
      
      // Ensure we have a valid PDF buffer
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Generated PDF buffer is empty');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Send the PDF buffer directly
      res.end(pdfBuffer);
      
    } catch (pdfError) {
      console.error('FAST PDF generation failed:', pdfError);
      
      // Return error response
      res.status(500).json({
        success: false,
        message: 'PDF generation failed. Please try again.',
        error: pdfError.message
      });
    }
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report',
      error: error.message
    });
  }
};