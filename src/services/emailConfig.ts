import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  pool: true,
  host: "mail.privateemail.com",
  port: 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  secure: true,
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 10000, // 10 seconds
});

export const verifyTransporter = async (retries = 3, delay = 5000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await transporter.verify();
      console.log("Transporter Verified");
      return;
    } catch (error) {
      console.error(
        `Transporter verification failed on attempt ${attempt}`,
        error instanceof Error && error.message,
      );

      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("All attempts to verify transporter failed. Exiting...");
        process.exit(1);
      }
    }
  }
};
