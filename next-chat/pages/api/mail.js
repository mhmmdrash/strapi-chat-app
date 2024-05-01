export default function (req, res) {
  const nodemailer = require("nodemailer");

  // Validate req.body
  if (!req.body || !req.body.email || !req.body.message) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  const transporter = nodemailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    secure: true,
    auth: {
      user: "mohammadrasheed56@gmail.com",
      pass: "a$$dropped333@",
    },
  });

  const mailData = {
    from: "Chat API",
    to: req.body.email,
    subject: `Verify your email`,
    text: req.body.message,
  };
  transporter.sendMail(mailData, function (err, info) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: `an error occurred ${err}` });
    }
    res.status(200).json({ message: info });
  });
}
