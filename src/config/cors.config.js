const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.CLIENT_URL,
        "http://localhost:5173", // Vite
        "http://localhost:3000", // React
      ];
  
      if (!origin) return callback(null, true);
  
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  };
  
  export default corsOptions;