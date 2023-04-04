import { toast } from "react-toastify";
import { toastMessage } from "~/utils/toast";

const sgMail = require('@sendgrid/mail')
export default async function(req, res) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  const { email, message } = req.body

  const msg = {
    to: 'sjcaffery01@gmail.com', // Change to your recipient
    from: 'usafprojectmanagementdashboard@gmail.com', // Change to your verified sender
    subject: 'New Project Added',
    text: 'New project added in METIS dashboard.',
  }

  try {
    await sgMail.send(msg)
    res.status(200).send('Message sent successfully.')
  } catch (error) {
    console.log('ERROR', error)
    res.status(400).send('Message not sent.')
  }
}

//--------------------------------------------------------------------------------
// const sgMail = require('@sendgrid/mail')
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY)
//     const msg = {
//       to: 'sjcaffery01@gmail.com', // Change to your recipient
//       from: 'usafprojectmanagementdashboard@gmail.com', // Change to your verified sender
//       subject: 'New Project Added',
//       text: 'New project added in METIS dashboard.',
//     }

//     sgMail
//     .send(msg)
//     .then(() => {
//       toast.success(
//         toastMessage("Email Sent", "NICE")
//       )
//       console.log('Email sent')
//     })
//     .catch((error: any) => {
//       toast.error(
//         toastMessage("Email FAILED", "FAILURE")
//       )
//       console.error(error)
//     })