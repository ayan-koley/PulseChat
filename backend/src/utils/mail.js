import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const emailVerificationMailgenContent = ({ username, verificationUrl }) => {
  return {
    body: {
      name: username,
      intro:
        "Welcome to Project Management! We're very excited to have you on board.",
      action: {
        instructions:
          "To get started with Project Management, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help or have question ? Just reply to this email, we'd love to help",
    },
  };
};

const forgotPasswordMailgenContent = ({ username, passwordResetUrl }) => {
  return {
    body: {
      name: username,
      intro:
        "We received a request to reset the password for your Project Management account.",
      action: {
        instructions: "To continue, please click the button below:",
        button: {
          color: "#0e68e6ff", // Optional action button color
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro: [
        "Need help or have question ? Just reply to this email, we'd love to help",
        "Best regards",
        "Project Management App Team",
      ],
    },
  };
};

// to send email provide mailGencontent, email(reciever email), subject
const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Project Management",
      link: "https://projectmanagement.com",
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(options.mailGenContent);
  const emailHtml = mailGenerator.generate(options.mailGenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.MAILTRAP_SMTP_USERNAME,
      pass: process.env.MAILTRAP_SMTP_PASSWORD,
    },
  });

  const mail = {
    from: '"Porject Management" <projectmanagement@gmail.com',
    to: options.email,
    subject: options.subject,
    text: emailTextual,
    html: emailHtml,
  };

  await transporter
    .sendMail(mail)
    .then((info) => {
      console.log("Message Send ", info.messageId);
    })
    .catch((err) => {
      console.error("Email services failed silently. ", err.message);
      console.log("ERROR: ", err);
    });
};

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};
