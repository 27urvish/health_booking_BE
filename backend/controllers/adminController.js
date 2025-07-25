// import jwt from "jsonwebtoken";
// import appointmentModel from "../models/appointmentModel.js";
// import doctorModel from "../models/doctorModel.js";
// import bcrypt from "bcrypt";
// import validator from "validator";
// import { v2 as cloudinary } from "cloudinary";
// import userModel from "../models/userModel.js";

// // API for admin login
// const loginAdmin = async (req, res) => {
//     try {

//         const { email, password } = req.body

//         if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
//             const token = jwt.sign(email + password, process.env.JWT_SECRET)
//             res.json({ success: true, token })
//         } else {
//             res.json({ success: false, message: "Invalid credentials" })
//         }

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }

// }


// // API to get all appointments list
// const appointmentsAdmin = async (req, res) => {
//     try {

//         const appointments = await appointmentModel.find({})
//         res.json({ success: true, appointments })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }

// }

// // API for appointment cancellation
// const appointmentCancel = async (req, res) => {
//     try {

//         const { appointmentId } = req.body
//         await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

//         res.json({ success: true, message: 'Appointment Cancelled' })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }

// }
// const appointmentComplete = async (req, res) => {
//     try {
//         const { appointmentId } = req.body;
        
//         // Check if appointment exists
//         const appointment = await appointmentModel.findById(appointmentId);
//         if (!appointment) {
//             return res.status(404).json({ success: false, message: "Appointment not found" });
//         }

//         // Update the appointment status to completed
//         await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });

//         res.json({ success: true, message: "Appointment Completed" });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// };
// // API for adding Doctor
// const addDoctor = async (req, res) => {

//     try {

//         const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
//         const imageFile = req.file

//         // checking for all data to add doctor
//         if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
//             return res.json({ success: false, message: "Missing Details" })
//         }

//         // validating email format
//         if (!validator.isEmail(email)) {
//             return res.json({ success: false, message: "Please enter a valid email" })
//         }

//         // validating strong password
//         if (password.length < 8) {
//             return res.json({ success: false, message: "Please enter a strong password" })
//         }

//         // hashing user password
//         const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
//         const hashedPassword = await bcrypt.hash(password, salt)

//         // upload image to cloudinary
//         const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
//         const imageUrl = imageUpload.secure_url

//         const doctorData = {
//             name,
//             email,
//             image: imageUrl,
//             password: hashedPassword,
//             speciality,
//             degree,
//             experience,
//             about,
//             fees,
//             address: JSON.parse(address),
//             date: Date.now()
//         }

//         const newDoctor = new doctorModel(doctorData)
//         await newDoctor.save()
//         res.json({ success: true, message: 'Doctor Added' })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// // API to get all doctors list for admin panel
// const allDoctors = async (req, res) => {
//     try {

//         const doctors = await doctorModel.find({}).select('-password')
//         res.json({ success: true, doctors })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// // API to get dashboard data for admin panel
// const adminDashboard = async (req, res) => {
//     try {

//         const doctors = await doctorModel.find({})
//         const users = await userModel.find({})
//         const appointments = await appointmentModel.find({})

//         const dashData = {
//             doctors: doctors.length,
//             appointments: appointments.length,
//             patients: users.length,
//             latestAppointments: appointments.reverse()
//         }

//         res.json({ success: true, dashData })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// export {
//     loginAdmin,
//     appointmentsAdmin,
//     appointmentCancel,
//     addDoctor,
//     allDoctors,
//     adminDashboard,
//     appointmentComplete
// }

import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js"
import doctorModel from "../models/doctorModel.js"
import bcrypt from "bcrypt"
import validator from "validator"
import { v2 as cloudinary } from "cloudinary"
import userModel from "../models/userModel.js"
import { sendEmail } from "../utils/emailService.js"

// API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET)
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: "Invalid credentials" })
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({})
    res.json({ success: true, appointments })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body

    // Get appointment data to access user email
    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" })
    }

    // Update appointment status
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    // Send email notification to user
    const userEmail = appointment.userData.email
    const doctorName = appointment.docData.name
    const appointmentDate = appointment.slotDate
    const appointmentTime = appointment.slotTime

    const emailSubject = "Appointment Cancellation Notification"
    const emailBody = `
            <h2>Appointment Cancellation</h2>
            <p>Dear ${appointment.userData.name},</p>
            <p>We regret to inform you that your appointment with Dr. ${doctorName} scheduled for ${appointmentDate} at ${appointmentTime} has been cancelled.</p>
            <p>Please contact our support team if you have any questions or would like to reschedule.</p>
            <p>Thank you for your understanding.</p>
        `

    await sendEmail(userEmail, emailSubject, emailBody)

    res.json({ success: true, message: "Appointment Cancelled" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body
     console.log("++++++++++++++++");
     
    // Check if appointment exists and get user data
    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" })
    }

    // Update the appointment status to completed
    const UpdateApmnt= await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
    console.log("+++++++++++",UpdateApmnt);
    if(UpdateApmnt){
     console.log(UpdateApmnt);
     
        const userEmail = appointment.userData.email;
        const doctorName = appointment.docData.name;
        const appointmentDate = appointment.slotDate;
        const appointmentTime = appointment.slotTime;


    
        const emailSubject = "Appointment Completed"
        const emailBody = `
                <h2>Appointment Completed</h2>
                <px>Dear ${appointment.userData.name},</px>
                <p>Your appointment with Dr. ${doctorName} scheduled for ${appointmentDate} at ${appointmentTime} has been marked as completed.</p>
                <p>Thank you for choosing our healthcare services.</p>
                <p>If you have any feedback or questions, please don't hesitate to contact us.</p>
            `
    
      const res=  await sendEmail(userEmail, emailSubject, emailBody)

      console.log("ressssssssssss-------->",res);
      

    }

    // Send email notification to user
    

    res.json({ success: true, message: "Appointment Completed" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// API for adding Doctor
const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
    const imageFile = req.file

    // checking for all data to add doctor
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.json({ success: false, message: "Missing Details" })
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" })
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" })
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10) // the more no. round the more time it will take
    const hashedPassword = await bcrypt.hash(password, salt)

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
    const imageUrl = imageUpload.secure_url

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    }

    const newDoctor = new doctorModel(doctorData)
    await newDoctor.save()
    res.json({ success: true, message: "Doctor Added" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password")
    res.json({ success: true, doctors })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({})
    const users = await userModel.find({})
    const appointments = await appointmentModel.find({})

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse(),
    }

    res.json({ success: true, dashData })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { loginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, allDoctors, adminDashboard, appointmentComplete }

