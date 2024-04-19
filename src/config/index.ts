import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwt: {
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_password_token_secret: process.env.RESET_PASSWORD_TOKEN_SECRET,
    reset_password_token_expires_in: process.env.RESET_PASSWORD_EXPIRES_IN,
  },
  reset_password_link: process.env.RESET_PASSWORD_LINK,
  emailSender: {
    email_sender: process.env.EMAIL_SENDER,
    email_sender_pass: process.env.EAMIL_SENDER_PASS,
  },
  ssl: {
    storeId: process.env.STORE_ID,
    storePass: process.env.STORE_PASS,
    successUrl: process.env.SUCCESS_URL,
    failUrl: process.env.FAIL_URL,
    cancelUrl: process.env.CANCEL_URL,
    sslPaymentApi: process.env.SSL_PAYMENT_API,
    sslValidationApi: process.env.SSL_VALIDATION_API,
  },
};
