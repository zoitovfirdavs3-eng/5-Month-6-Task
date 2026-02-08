require("dotenv").config();
const nodemailer = require("nodemailer");

const emailService = async (email, name, activationLink) => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

const html = `
<h2>Salom ${name}</h2>
<p>Activatsiya qilish uchun <a href="${activationLink}">bosing</a></p>
`;

  await transport.sendMail({
    from: `"Kutubxona" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Hisobni faollashtirish",
    html: html,
  });
};

module.exports = emailService;
