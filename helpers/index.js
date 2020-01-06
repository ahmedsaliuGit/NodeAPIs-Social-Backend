const nodeMailer = require("nodemailer");

const defaultEmailData = { from: "noreply@mynodereact.com" };

exports.sendEmail = emailData => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "saliu.lito@gmail.com",
      pass: "icqhrsyppcxpuuqh" // windows: icqhrsyppcxpuuqh || Mac: pvxjzzuotjbtndwo
    }
  });
  return transporter
    .sendMail(emailData)
    .then(info => console.log(`Message sent: ${info.response}`))
    .catch(err => console.log(`Problem sending email: ${err}`));
};
