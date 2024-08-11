import { mailtrapClient, sender } from "./mailtrap.config.js";
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";

export const sendVerificationEmail = async (email, veryficationToken) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", veryficationToken),
            category: "Email Verification"
        });

        console.log("Email sent success", response);
    } catch (err) {
        console.log("Error sending verification email", err.message);
        throw new Error(`Error sending verification email: ${err.message}`);
    }
};


















