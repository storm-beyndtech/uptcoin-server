import { emailTemplate } from "./emailTemplate";
import { transporter } from "./emailConfig";

const sendMail = (mailData: any) => {
	return new Promise((resolve, reject) => {
		transporter.sendMail(mailData, (err, info) => {
			if (err) {
				console.error(err);
				reject(err);
			} else {
				console.log(info);
				resolve(info);
			}
		});
	});
};

const sendMailWithRetry = async (mailData: any, retries = 3) => {
	for (let i = 0; i < retries; i++) {
		try {
			return await sendMail(mailData);
		} catch (error) {
			if (i === retries - 1) throw error;
			console.log(`Retrying sendMail... Attempt ${i + 1}`);
		}
	}
};

// Welcome Mail
export async function welcomeMail(userEmail: string, token: string) {
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
			from: `Uptcoin <support@uptcoin.com>`,
			to: userEmail,
			subject: "Welcome to Uptcoin!",
			html: emailTemplate("Welcome to Uptcoin", bodyContent),
		};

		return await sendMailWithRetry(mailOptions);
	} catch (error) {
		return { error: error instanceof Error && error.message };
	}
}

// Password Reset Mail
export async function passwordResetMail(userEmail: string, resetToken: string) {
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
			from: `Uptcoin <support@uptcoin.com>`,
			to: userEmail,
			subject: "Password Reset Request",
			html: emailTemplate("Password Reset", bodyContent),
		};

		return await sendMailWithRetry(mailOptions);
	} catch (error) {
		return { error: error instanceof Error && error.message };
	}
}

// Verification Code Mail
export async function verificationCodeMail(userEmail: string, verificationCode: string) {
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
			from: `Uptcoin <support@uptcoin.com>`,
			to: userEmail,
			subject: "Your Uptcoin Verification Code",
			html: emailTemplate("Verification Code", bodyContent),
		};

		return await sendMailWithRetry(mailOptions);
	} catch (error) {
		return { error: error instanceof Error && error.message };
	}
}

// Admin Transaction Approval Mail
export async function adminTransactionAlert(userEmail: string, amount: number, currency: string) {
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
			html: emailTemplate("Transaction Approval Alert", bodyContent),
		};

		return await sendMailWithRetry(mailOptions);
	} catch (error) {
		return { error: error instanceof Error && error.message };
	}
}

// Transaction Status Update Mail
export async function transactionStatusMail(
	userEmail: string,
	type: string,
	amount: number,
	currency: string,
	status: string,
) {
	try {
		let bodyContent = `
      <td style="padding: 20px; line-height: 1.8;">
        <p>Your ${type} of <b>${amount} ${currency}</b> has been ${status}.</p>
      </td>
    `;

		let mailOptions = {
			from: `Uptcoin <support@uptcoin.com>`,
			to: userEmail,
			subject: `${type} ${status}`,
			html: emailTemplate(`${type} ${status}`, bodyContent),
		};

		return await sendMailWithRetry(mailOptions);
	} catch (error) {
		return { error: error instanceof Error && error.message };
	}
}
