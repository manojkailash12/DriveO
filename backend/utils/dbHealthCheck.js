import mongoose from 'mongoose';

// Database health check utility
export const checkDatabaseHealth = async () => {
  try {
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    
    return {
      status: 'healthy',
      ping: result,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      readyState: mongoose.connection.readyState
    };
  }
};

// Connection state checker
export const getConnectionState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[mongoose.connection.readyState],
    readyState: mongoose.connection.readyState
  };
};

// Query performance monitor
export const monitorQuery = (queryName, promise) => {
  const startTime = Date.now();
  
  return promise
    .then(result => {
      const duration = Date.now() - startTime;
      console.log(`✅ Query "${queryName}" completed in ${duration}ms`);
      return result;
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      console.error(`❌ Query "${queryName}" failed after ${duration}ms:`, error.message);
      throw error;
    });
};

// Timeout wrapper for database operations
export const withTimeout = (promise, timeoutMs = 30000, operationName = 'Database operation') => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
};

// Retry mechanism for failed operations
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};