const transport = require('../config/nodemailer');
module.exports.sendResetPasswordEmail = (email, token) => {
  try {
    transport.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      html: ` <h1>Reset Password Email</h1>
              <p>clicking on the following link and follow the instruactions to reset your password</p>
              <a href=${process.env.BASE_URL}/change_password?token=${token}>Click here</a>
            `,
    });
  } catch (error) {
    throw error;
  }
};