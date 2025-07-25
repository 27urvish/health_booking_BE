// import nodemailer from "nodemailer"

// // Create a transporter object
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || "smtp.gmail.com",
//   port: process.env.EMAIL_PORT || 587,
//   secure: process.env.EMAIL_SECURE === "true",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// })

// /**
//  * Send an email
//  * @param {string} to - Recipient email address
//  * @param {string} subject - Email subject
//  * @param {string} html - Email body in HTML format
//  * @returns {Promise} - Resolves with info about the sent email
//  */
// export const sendEmail = async (to, subject, html) => {
//   try {
//     const mailOptions = {
//       from: `"Healthcare App" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     }

//     const info = await transporter.sendMail(mailOptions)
//     console.log("Email sent successfully:", info.messageId)
//     return info
//   } catch (error) {
//     console.error("Error sending email:", error)
//     throw error
//   }
// }

import nodemailer from "nodemailer"

// Create a transporter object with error handling
const createTransporter = () => {
  try {
    // Check if required environment variables are present
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("⚠️ Missing email credentials")
        return null
      }
    const requiredVars = ["EMAIL_HOST", "EMAIL_USER", "EMAIL_PASS"]
    const missingVars = requiredVars.filter((varName) => !process.env[varName])
    
    if (missingVars.length > 0) {
      console.warn(`Email service missing environment variables: ${missingVars.join(", ")}`)
      return null
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Use your App Password here
        },
        tls: {
          rejectUnauthorized: false, // Helps prevent some SSL errors
        },
    })
  } catch (error) {
    console.error("Failed to create email transporter:", error)
    return null
  }
}

/**
 * Send an email with error handling
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML format
 * @returns {Promise} - Resolves with info about the sent email or null if sending failed
 */
    export const sendEmail = async (to, subject, html) => {
    try {
        // Validate inputs
        if (!to || !subject || !html) {
        console.warn("Missing required email parameters")
        return null
        }
    console.log("---------------->????",to , subject , html)
        // Create transporter (or get null if configuration is invalid)
        const transporter = createTransporter()
        if (!transporter) {
        console.warn("Email transporter not available - skipping email send")
        return null
        }

        const mailOptions = {
        from: `"Healthcare App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        }
    console.log("mailOptionsmailOptions",mailOptions)
        const info = await transporter.sendMail(mailOptions)
        console.log("Email sent successfully:", info.messageId)
        return info
    } catch (error) {
        console.error("Error sending email:", error)
        // Return null instead of throwing to prevent 500 errors
        return error
    }
    }


