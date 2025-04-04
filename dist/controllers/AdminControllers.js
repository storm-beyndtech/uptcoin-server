"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminMail = void 0;
const emailService_1 = require("../services/emailService");
const sendAdminMail = async (req, res) => {
    try {
        const { recipients, subject, message } = req.body;
        // Validate required fields
        if (!recipients || !subject || !message) {
            return res.status(400).json({ message: "Recipients, subject, and message are required." });
        }
        // Send email(s)
        await (0, emailService_1.adminMail)(recipients, subject, message);
        res.status(200).json({ message: "Email sent successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.sendAdminMail = sendAdminMail;
