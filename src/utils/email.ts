import sgMail from "@sendgrid/mail"
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "")


export async function sendEmail(to: string, subject: string, content:string ){
    const msg = {
        to: to, 
        from: 'usafprojectmanagementdashboard@gmail.com', 
        subject: subject,
        text: content,
      }
    
      try {
        await sgMail.send(msg)
        return ('Message sent successfully.')
      } catch (error) {
        console.log('ERROR', error)
         return ('Message not sent.')
      }

}

