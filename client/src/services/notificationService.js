import { toast } from 'sonner';

class NotificationService {
  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  }

  // Show success notification
  success(message, options = {}) {
    if (this.shouldShowNotification(message)) {
      toast.success(message, {
        duration: options.duration || 4000,
        position: options.position || 'top-right',
        ...options
      });
    }
  }

  // Show error notification
  error(message, options = {}) {
    if (this.shouldShowNotification(message)) {
      toast.error(message, {
        duration: options.duration || 5000,
        position: options.position || 'top-right',
        ...options
      });
    }
  }

  // Show info notification
  info(message, options = {}) {
    if (this.shouldShowNotification(message)) {
      toast.info(message, {
        duration: options.duration || 4000,
        position: options.position || 'top-right',
        ...options
      });
    }
  }

  // Show warning notification
  warning(message, options = {}) {
    if (this.shouldShowNotification(message)) {
      toast.warning(message, {
        duration: options.duration || 4000,
        position: options.position || 'top-right',
        ...options
      });
    }
  }

  // Show loading notification
  loading(message, options = {}) {
    if (this.shouldShowNotification(message)) {
      return toast.loading(message, {
        duration: options.duration || Infinity,
        position: options.position || 'top-right',
        ...options
      });
    }
    return null;
  }

  // Dismiss notification
  dismiss(toastId) {
    if (toastId) {
      toast.dismiss(toastId);
    }
  }

  // Check if notification should be shown (filter out localhost references)
  shouldShowNotification(message) {
    if (!message) return false;
    
    const localhostPatterns = [
      /localhost/i,
      /127\.0\.0\.1/i,
      /0\.0\.0\.0/i,
      /development server/i,
      /dev server/i,
      /webpack/i,
      /hot reload/i,
      /hmr/i
    ];

    // In production, filter out localhost-related messages
    if (this.isProduction) {
      return !localhostPatterns.some(pattern => pattern.test(message));
    }

    // In development, show all notifications
    return true;
  }

  // Booking-specific notifications
  bookingSuccess(bookingId) {
    this.success(`Booking confirmed successfully! Booking ID: ${bookingId}`, {
      duration: 6000
    });
  }

  bookingError(error) {
    const message = this.sanitizeErrorMessage(error);
    this.error(`Booking failed: ${message}`);
  }

  paymentSuccess(amount) {
    this.success(`Payment of ₹${amount} processed successfully!`, {
      duration: 5000
    });
  }

  paymentError(error) {
    const message = this.sanitizeErrorMessage(error);
    this.error(`Payment failed: ${message}`);
  }

  profileUpdateSuccess() {
    this.success('Profile updated successfully!');
  }

  profileUpdateError(error) {
    const message = this.sanitizeErrorMessage(error);
    this.error(`Failed to update profile: ${message}`);
  }

  vehicleAddedSuccess(vehicleName) {
    this.success(`Vehicle "${vehicleName}" added successfully!`);
  }

  vehicleDeletedSuccess(vehicleName) {
    this.success(`Vehicle "${vehicleName}" deleted successfully!`);
  }

  // Email notifications
  emailSentSuccess(type = 'Email') {
    this.success(`${type} sent successfully!`);
  }

  emailSentError(type = 'Email') {
    this.error(`Failed to send ${type.toLowerCase()}. Please try again.`);
  }

  // Connection status notifications
  connectionLost() {
    this.warning('Connection lost. Some features may not work properly.', {
      duration: 8000
    });
  }

  connectionRestored() {
    this.success('Connection restored!');
  }

  // Sanitize error messages to remove localhost references
  sanitizeErrorMessage(error) {
    if (!error) return 'Unknown error occurred';
    
    let message = typeof error === 'string' ? error : error.message || 'Unknown error';
    
    // Remove localhost references
    message = message.replace(/localhost:\d+/g, 'server');
    message = message.replace(/127\.0\.0\.1:\d+/g, 'server');
    message = message.replace(/http:\/\/localhost/g, 'server');
    message = message.replace(/https:\/\/localhost/g, 'server');
    
    // Remove technical stack traces in production
    if (this.isProduction) {
      message = message.split('\n')[0]; // Only show first line
      message = message.replace(/at .*/g, ''); // Remove stack trace references
    }
    
    return message.trim();
  }

  // Network error handling
  handleNetworkError(error) {
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      this.error('Network error. Please check your internet connection.');
    } else if (error.status === 404) {
      this.error('Service not found. Please try again later.');
    } else if (error.status === 500) {
      this.error('Server error. Please try again later.');
    } else if (error.status === 401) {
      this.error('Authentication required. Please log in again.');
    } else if (error.status === 403) {
      this.error('Access denied. You do not have permission for this action.');
    } else {
      this.error(this.sanitizeErrorMessage(error));
    }
  }

  // API response notifications
  handleApiResponse(response, successMessage, errorMessage) {
    if (response.success) {
      if (successMessage) {
        this.success(successMessage);
      }
      return true;
    } else {
      const message = errorMessage || response.message || 'Operation failed';
      this.error(this.sanitizeErrorMessage(message));
      return false;
    }
  }

  // Batch operations
  batchOperationStart(operation, count) {
    return this.loading(`Processing ${count} ${operation}...`);
  }

  batchOperationComplete(operation, successCount, totalCount) {
    if (successCount === totalCount) {
      this.success(`All ${totalCount} ${operation} completed successfully!`);
    } else {
      this.warning(`${successCount} of ${totalCount} ${operation} completed successfully.`);
    }
  }

  // Form validation notifications
  validationError(field, message) {
    this.error(`${field}: ${message}`);
  }

  // File upload notifications
  uploadStart(fileName) {
    return this.loading(`Uploading ${fileName}...`);
  }

  uploadSuccess(fileName) {
    this.success(`${fileName} uploaded successfully!`);
  }

  uploadError(fileName, error) {
    const message = this.sanitizeErrorMessage(error);
    this.error(`Failed to upload ${fileName}: ${message}`);
  }

  // Data sync notifications
  syncStart() {
    return this.loading('Syncing data...');
  }

  syncComplete() {
    this.success('Data synchronized successfully!');
  }

  syncError(error) {
    const message = this.sanitizeErrorMessage(error);
    this.error(`Sync failed: ${message}`);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;

// Export individual methods for convenience
export const {
  success,
  error,
  info,
  warning,
  loading,
  dismiss,
  bookingSuccess,
  bookingError,
  paymentSuccess,
  paymentError,
  profileUpdateSuccess,
  profileUpdateError,
  vehicleAddedSuccess,
  vehicleDeletedSuccess,
  emailSentSuccess,
  emailSentError,
  connectionLost,
  connectionRestored,
  handleNetworkError,
  handleApiResponse,
  batchOperationStart,
  batchOperationComplete,
  validationError,
  uploadStart,
  uploadSuccess,
  uploadError,
  syncStart,
  syncComplete,
  syncError
} = notificationService;