"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeMail = welcomeMail;
exports.passwordResetMail = passwordResetMail;
exports.verificationCodeMail = verificationCodeMail;
exports.adminTransactionAlert = adminTransactionAlert;
exports.transactionStatusMail = transactionStatusMail;
exports.adminMail = adminMail;
exports.loginAlertMail = loginAlertMail;
const emailTemplate_1 = require("./emailTemplate");
const emailConfig_1 = require("./emailConfig");
const sendMail = (mailData) => {
    return new Promise((resolve, reject) => {
        emailConfig_1.transporter.sendMail(mailData, (err, info) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                console.log(info);
                resolve(info);
            }
        });
    });
};
const sendMailWithRetry = async (mailData, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await sendMail(mailData);
        }
        catch (error) {
            if (i === retries - 1)
                throw error;
            console.log(`Retrying sendMail... Attempt ${i + 1}`);
        }
    }
};
// Welcome Mail
async function welcomeMail(userEmail, token) {
    const verificationLink = `https://uptcoin.com/verify-email/${token}`;
    try {
        let bodyContent = `
      <td style="padding: 20px; line-height: 1.8;">
        <p>Welcome to Uptcoin!</p>
        <p>We're thrilled to have you as part of our community. At Uptcoin, we are dedicated to providing the best services and support to our users.</p>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      <p>Best regards,<br />The Uptcoin Team</p>
      </td>
    `;
        let mailOptions = {
            from: `Uptcoin <support@uptcoin.com>`,
            to: userEmail,
            subject: "Welcome to Uptcoin!",
            html: (0, emailTemplate_1.emailTemplate)(bodyContent),
        };
        return await sendMailWithRetry(mailOptions);
    }
    catch (error) {
        return { error: error instanceof Error && error.message };
    }
}
// Password Reset Mail
async function passwordResetMail(userEmail, resetToken) {
    const resetLink = `https://uptcoin.com/reset-password/${resetToken}`;
    try {
        let bodyContent = `
      <td style="padding: 20px; line-height: 1.8;">
        <p>A request was sent for a password reset. If this wasn't you, please contact our customer service.</p>
        <p>Click the reset link below to proceed:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 15px 30px; border-radius: 30px; background-color: #114000; color: #fafafa; text-decoration: none;">Reset Password</a>
      <p>Best regards,<br />The Uptcoin Team</p>
      </td>
    `;
        let mailOptions = {
            from: `Uptcoin <support@uptcoin.com>`,
            to: userEmail,
            subject: "Password Reset Request",
            html: (0, emailTemplate_1.emailTemplate)(bodyContent),
        };
        return await sendMailWithRetry(mailOptions);
    }
    catch (error) {
        return { error: error instanceof Error && error.message };
    }
}
// Verification Code Mail
async function verificationCodeMail(userEmail, verificationCode) {
    try {
        let bodyContent = `
      <td style="padding: 20px; line-height: 1.8;">
        <p>Use the code below to complete your registration:</p>
        <h2 style="text-align: center; font-size: 24px;">${verificationCode}</h2>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>

      <p>Best regards,<br />The Uptcoin Team</p>
      </td>
    `;
        let mailOptions = {
            from: `Uptcoin <support@uptcoin.com>`,
            to: userEmail,
            subject: "Your Uptcoin Verification Code",
            html: (0, emailTemplate_1.emailTemplate)(bodyContent),
        };
        return await sendMailWithRetry(mailOptions);
    }
    catch (error) {
        return { error: error instanceof Error && error.message };
    }
}
// Admin Transaction Approval Mail
async function adminTransactionAlert(userEmail, amount, currency) {
    try {
        let bodyContent = `
      <td style="padding: 20px; line-height: 1.8;">
        <p>A new transaction requires approval.</p>
        <p>User Email: ${userEmail}</p>
        <p>Amount: ${amount} ${currency}</p>
        <p>Please review and approve or reject the transaction.</p>
      </td>
    `;
        let mailOptions = {
            from: `Uptcoin <support@uptcoin.com>`,
            to: "support@uptcoin.com",
            subject: "Transaction Approval Required",
            html: (0, emailTemplate_1.emailTemplate)(bodyContent),
        };
        return await sendMailWithRetry(mailOptions);
    }
    catch (error) {
        return { error: error instanceof Error && error.message };
    }
}
// Transaction Status Update Mail
async function transactionStatusMail(userEmail, type, amount, currency, status) {
    try {
        let bodyContent = `
    <td style="padding: 20px; line-height: 1.8; font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <p>Dear Customer,</p>
  
      <p>We would like to inform you that your <strong>${type.toLowerCase()}</strong> request for <strong>${amount} ${currency}</strong> has been <strong>${status.toLowerCase()}</strong>.</p>
  
      <p>If you initiated this transaction, no further action is required.</p>
  
      <p>If you did <strong>not</strong> authorize this request or believe this was done in error, please contact our support team immediately.</p>
  
      <p>Thank you for choosing Uptcoin.</p>
  
      <p>Best regards,<br />The Uptcoin Team</p>
    </td>
  `;
        let mailOptions = {
            from: `Uptcoin <support@uptcoin.com>`,
            to: userEmail,
            subject: `${type} ${status}`,
            html: (0, emailTemplate_1.emailTemplate)(bodyContent),
        };
        return await sendMailWithRetry(mailOptions);
    }
    catch (error) {
        return { error: error instanceof Error && error.message };
    }
}
// Admin Mail
async function adminMail(recipients, subject, bodyContent) {
    try {
        // Ensure recipients is an array for bulk sending
        const recipientList = Array.isArray(recipients) ? recipients : [recipients];
        // Construct mail options
        let mailOptions = {
            from: `Uptcoin Admin`,
            to: recipientList.join(","),
            subject,
            html: (0, emailTemplate_1.emailTemplate)(bodyContent),
        };
        // Send email and return the result
        return await sendMailWithRetry(mailOptions);
    }
    catch (error) {
        return { error: error instanceof Error && error.message };
    }
}
// Login Alert Mail
async function loginAlertMail(userEmail, ipAddress) {
    const loginDate = new Date();
    const formattedDate = loginDate.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    const bodyContent = `
    <td style="padding: 20px; line-height: 1.8;">
      <p>Hello,</p>
      <p>Your account was just logged into on <strong>${formattedDate}</strong>${ipAddress ? ` from IP address <strong>${ipAddress}</strong>` : ""}.</p>
      <p>If this was you, no action is required.</p>
      <p><strong>If this wasn't you</strong>, please change your password immediately and contact support.</p>
    </td>
  `;
    const mailOptions = {
        from: `Uptcoin <support@uptcoin.com>`,
        to: userEmail,
        subject: `Login Alert - Uptcoin`,
        html: (0, emailTemplate_1.emailTemplate)(bodyContent),
    };
    return await sendMailWithRetry(mailOptions);
}
