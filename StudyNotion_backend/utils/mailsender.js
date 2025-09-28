const nodemailer = require('nodemailer');

const mailSender = async(email, title, content) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: process.env.EMAIL_HOST,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: title,
            text: content
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info);
    } catch (error) {
        console.log("Error in mail sender util", error);
    }
}

module.exports = mailSender;