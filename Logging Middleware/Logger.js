// src/middleware/logger.js
const logger = (message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data);
};

export default logger;
