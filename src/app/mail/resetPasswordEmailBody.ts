const resetPasswordEmailBody = (name: string, resetCode: number) => `
  <html>
    <head>
      <style>
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f7f9fc;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #d9534f;
          padding: 20px;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          color: #ffffff;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
          color: #333333;
        }
        .content h2 {
          font-size: 22px;
          color: #333333;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .content p {
          font-size: 16px;
          color: #666666;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .reset-code {
          font-size: 28px;
          color: #d9534f;
          font-weight: 700;
          text-align: center;
          margin-bottom: 20px;
        }
        .footer {
          padding: 20px;
          font-size: 14px;
          color: #999999;
          text-align: center;
          background-color: #f7f9fc;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        .footer p {
          margin: 5px 0;
        }
        .footer a {
          color: #d9534f;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello, ${name}</h2>

          <p>We received a request to reset your password. Please use the code below to proceed with resetting your password:</p>
          <div class="reset-code">
            ${resetCode || "XXXXXX"}
          </div>
          <p>Enter this code on the password reset page within the next 10 minutes. If you didn't request a password reset, you can ignore this email.</p>
          <p>If you have any questions, feel free to contact us at <a href="mailto:maniksarker265@gmail.com">maniksarker265@gmail.com</a>.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Protipzz. All rights reserved.</p>
          <p><a href="https://yourwebsite.com/privacy">Privacy Policy</a> | <a href="https://yourwebsite.com/contact">Contact Us</a></p>
        </div>
      </div>
    </body>
  </html>
`;

export default resetPasswordEmailBody;
