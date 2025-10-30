import nodemailer from "nodemailer";



export class CommunicationCenter{
    async sendSMS(target,message){
        try{
            const responce = await fetch(`https://plus.smssmartegypt.com/api/PlusSMS/SendSMS?username=${process.env.SMSmisrUsername}&password=${process.env.SMSmisrPassword}&sendername=Reedy%20ph&message=${message}&mobiles=2${target}`)
            const jsonResponce = await responce.json()
            if(jsonResponce.error){
                throw new Error(jsonResponce.error.msg)
            }
            return jsonResponce
        }catch(err){
            // better to throw or return the error,
            // so when this method is called, you can throw the
            // error in json response for the front
            console.log(err)
        }
    }

    sendEmail = async (email,subject, message) => {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail', // or 'hotmail', 'yahoo', or use SMTP config
                auth: {
                    user: process.env.EMAIL_USER, // email
                    pass: process.env.EMAIL_PASS, // email app password
                }
                });

            const mailOptions = {
                from: `${process.env.EMAIL_USER}`,
                to: email,
                subject: subject,
                text: message,
                // html: `<p>Your OTP code is: <b>${otp}</b>. It expires in 5 minutes.</p>`,
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Error sending email:", error);
        }
    };

    
}