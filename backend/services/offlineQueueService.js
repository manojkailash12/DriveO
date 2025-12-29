import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUEUE_DIR = path.join(__dirname, '../offline-queue');
const EMAIL_QUEUE_FILE = path.join(QUEUE_DIR, 'email-queue.json');
const SYNC_QUEUE_FILE = path.join(QUEUE_DIR, 'sync-queue.json');

// Ensure queue directory exists
const ensureQueueDir = async () => {
  try {
    await fs.access(QUEUE_DIR);
    console.log('Queue directory exists:', QUEUE_DIR);
  } catch {
    try {
      await fs.mkdir(QUEUE_DIR, { recursive: true });
      console.log('Queue directory created:', QUEUE_DIR);
    } catch (mkdirError) {
      console.error('Error creating queue directory:', mkdirError);
      throw mkdirError;
    }
  }
};

// Initialize queue files
const initializeQueue = async (filePath) => {
  try {
    await fs.access(filePath);
    console.log('Queue file exists:', filePath);
  } catch {
    try {
      await fs.writeFile(filePath, JSON.stringify([]));
      console.log('Queue file created:', filePath);
    } catch (writeError) {
      console.error('Error creating queue file:', writeError);
      throw writeError;
    }
  }
};

// Read queue
const readQueue = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Write queue
const writeQueue = async (filePath, queue) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(queue, null, 2));
  } catch (error) {
    console.error('Error writing queue file:', error);
    // Ensure directory exists and retry
    await ensureQueueDir();
    await fs.writeFile(filePath, JSON.stringify(queue, null, 2));
  }
};

// Add email to offline queue
export const queueEmail = async (emailData) => {
  try {
    await ensureQueueDir();
    await initializeQueue(EMAIL_QUEUE_FILE);
    
    const queue = await readQueue(EMAIL_QUEUE_FILE);
    
    const queueItem = {
      id: Date.now() + Math.random().toString(36).substring(2, 11),
      type: 'email',
      data: emailData,
      timestamp: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3,
      status: 'pending'
    };
    
    queue.push(queueItem);
    await writeQueue(EMAIL_QUEUE_FILE, queue);
    
    console.log('Email queued for offline processing:', queueItem.id);
    return queueItem.id;
  } catch (error) {
    console.error('Error queuing email:', error);
    throw error;
  }
};

// Add sync operation to queue
export const queueSync = async (syncData) => {
  try {
    await ensureQueueDir();
    await initializeQueue(SYNC_QUEUE_FILE);
    
    const queue = await readQueue(SYNC_QUEUE_FILE);
    
    const queueItem = {
      id: Date.now() + Math.random().toString(36).substring(2, 11),
      type: 'sync',
      data: syncData,
      timestamp: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 5,
      status: 'pending'
    };
    
    queue.push(queueItem);
    await writeQueue(SYNC_QUEUE_FILE, queue);
    
    console.log('Sync operation queued:', queueItem.id);
    return queueItem.id;
  } catch (error) {
    console.error('Error queuing sync operation:', error);
    throw error;
  }
};

// Process email queue when online
export const processEmailQueue = async () => {
  try {
    // Ensure directory and file exist before processing
    await ensureQueueDir();
    await initializeQueue(EMAIL_QUEUE_FILE);
    
    const queue = await readQueue(EMAIL_QUEUE_FILE);
    const pendingEmails = queue.filter(item => item.status === 'pending' && item.attempts < item.maxAttempts);
    
    console.log(`Processing ${pendingEmails.length} queued emails...`);
    
    if (pendingEmails.length === 0) {
      console.log('No pending emails to process');
      return;
    }
    
    for (const emailItem of pendingEmails) {
      try {
        // Import email service dynamically to avoid circular dependencies
        const { sendQueuedEmail } = await import('./emailService.js');
        
        await sendQueuedEmail(emailItem.data);
        
        // Mark as completed
        emailItem.status = 'completed';
        emailItem.completedAt = new Date().toISOString();
        
        console.log('Email sent successfully:', emailItem.id);
      } catch (error) {
        console.error('Error sending queued email:', emailItem.id, error);
        
        emailItem.attempts += 1;
        emailItem.lastError = error.message;
        emailItem.lastAttempt = new Date().toISOString();
        
        if (emailItem.attempts >= emailItem.maxAttempts) {
          emailItem.status = 'failed';
          console.log(`Email failed after ${emailItem.maxAttempts} attempts:`, emailItem.id);
        }
      }
    }
    
    // Save updated queue with proper error handling
    try {
      await writeQueue(EMAIL_QUEUE_FILE, queue);
      console.log('Queue updated successfully');
    } catch (writeError) {
      console.error('Error writing queue file:', writeError);
      // Try to recreate directory and file
      await ensureQueueDir();
      await writeQueue(EMAIL_QUEUE_FILE, queue);
      console.log('Queue file recreated and updated');
    }
    
    // Clean up completed items older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const cleanedQueue = queue.filter(item => {
      if (item.status === 'completed' && item.completedAt && new Date(item.completedAt) < oneDayAgo) {
        return false;
      }
      return true;
    });
    
    if (cleanedQueue.length !== queue.length) {
      try {
        await writeQueue(EMAIL_QUEUE_FILE, cleanedQueue);
        console.log(`Cleaned up ${queue.length - cleanedQueue.length} completed email queue items`);
      } catch (cleanupError) {
        console.error('Error during queue cleanup:', cleanupError);
      }
    }
    
  } catch (error) {
    console.error('Error processing email queue:', error);
    
    // Try to recover by ensuring directory exists
    try {
      await ensureQueueDir();
      await initializeQueue(EMAIL_QUEUE_FILE);
      console.log('Queue directory and file recovered');
    } catch (recoveryError) {
      console.error('Failed to recover queue system:', recoveryError);
    }
    
    // Don't throw error, just log it to prevent server crashes
  }
};

// Get queue status
export const getQueueStatus = async () => {
  try {
    const emailQueue = await readQueue(EMAIL_QUEUE_FILE);
    const syncQueue = await readQueue(SYNC_QUEUE_FILE);
    
    return {
      emails: {
        total: emailQueue.length,
        pending: emailQueue.filter(item => item.status === 'pending').length,
        completed: emailQueue.filter(item => item.status === 'completed').length,
        failed: emailQueue.filter(item => item.status === 'failed').length
      },
      sync: {
        total: syncQueue.length,
        pending: syncQueue.filter(item => item.status === 'pending').length,
        completed: syncQueue.filter(item => item.status === 'completed').length,
        failed: syncQueue.filter(item => item.status === 'failed').length
      }
    };
  } catch (error) {
    console.error('Error getting queue status:', error);
    return { emails: {}, sync: {} };
  }
};

// Check internet connectivity
export const checkInternetConnection = async () => {
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      timeout: 5000 
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Auto-process queues when internet is available
export const startQueueProcessor = () => {
  const processQueues = async () => {
    const isOnline = await checkInternetConnection();
    
    if (isOnline) {
      console.log('Internet connection detected, processing queues...');
      await processEmailQueue();
      // Add sync queue processing here if needed
    } else {
      console.log('No internet connection, queues will be processed when online');
    }
  };
  
  // Process immediately
  processQueues();
  
  // Process every 5 minutes
  setInterval(processQueues, 5 * 60 * 1000);
  
  console.log('Queue processor started - checking every 5 minutes');
};