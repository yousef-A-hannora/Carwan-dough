import dotenv from "dotenv"
import axios from "axios"

dotenv.config()

const GUPSHUP_API_URL = process.env.GUPSHUP_API_URL;
const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY;
const SOURCE_NUMBER = process.env.GUPSHUP_SOURCE_NUMBER;


const sendMessage = async (destination, code) => {
  try {
    const data = new URLSearchParams({
      channel: 'whatsapp',
      source: '201096738872',
      destination: `2${destination}`,
      message: JSON.stringify({
          type: 'text',
          text: `*${code}* is your verification code.\nThis code expires in 3 minutes. | [copy code,https://www.whatsapp.com/otp/code/?otp_type=COPY_CODE&code_expiration_minutes=3&code=otp${code}]`
      }),
      'src.name': 'carwan Dough'
    });

    const config = {
      headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apikey': GUPSHUP_API_KEY
      }
    };

  axios.post(GUPSHUP_API_URL, data, config)
    .then(response => {
        console.log('Response:', response.data);
    })
    .catch(error => {
        console.error('Error:', error.response ? error.response.data : error.message);
    });
    console.log('Message sent successfully:', response.data);

  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
};


export default sendMessage