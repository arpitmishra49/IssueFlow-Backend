/**
 * Recursively sanitize object to prevent NoSQL injection
 * Removes keys starting with '$' or containing '.'
 */
const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
  
    for (const key in obj) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitizeObject(obj[key]);
      }
    }
  
    return obj;
  };
  
  /**
   * Middleware to sanitize req.body, req.query, req.params
   */
  const sanitizeMiddleware = (req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
  
    next();
  };
  
  export default sanitizeMiddleware;