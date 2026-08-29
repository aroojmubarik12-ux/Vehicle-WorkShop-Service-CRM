import app from "./app";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";

const startServer = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`=========================================`);
    console.log(`🚗 Vehicle CRM Backend Server Running!`);
    console.log(`🌐 URL: http://localhost:${ENV.PORT}`);
    console.log(`⚙️  Environment: ${ENV.NODE_ENV}`);
    console.log(`=========================================`);
  });
};

startServer();
