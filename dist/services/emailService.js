"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeMail = welcomeMail;
exports.passwordResetMail = passwordResetMail;
exports.verificationCodeMail = verificationCodeMail;
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
        <p>Best regards,</p>
        <p>The Uptcoin Team</p>
      </td>
    `;
        let mailOptions = {
            from: `Uptcoin <support@prowealth-inc.com>`,
            to: userEmail,
            subject: "Welcome to Uptcoin!",
            html: (0, emailTemplate_1.emailTemplate)("Welcome to Uptcoin", bodyContent),
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
      </td>
    `;
        let mailOptions = {
            from: `Uptcoin <support@prowealth-inc.com>`,
            to: userEmail,
            subject: "Password Reset Request",
            html: (0, emailTemplate_1.emailTemplate)("Password Reset", bodyContent),
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
        <p>If you didn’t request this, please ignore this email.</p>
      </td>
    `;
        let mailOptions = {
            from: `Uptcoin <support@prowealth-inc.com>`,
            to: userEmail,
            subject: "Your Uptcoin Verification Code",
            html: (0, emailTemplate_1.emailTemplate)("Verification Code", bodyContent),
        };
        return await sendMailWithRetry(mailOptions);
    }
    catch (error) {
        return { error: error instanceof Error && error.message };
    }
}
