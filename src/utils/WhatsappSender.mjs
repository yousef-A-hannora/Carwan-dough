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
      source: SOURCE_NUMBER,
      destination: `2${destination}`,
      message: JSON.stringify({
        type: 'text',
        text: `*${code}* is your verification code.\nThis code expires in 3 minutes.`
      }),
      'src.name': 'carwan Dough'
    });
    
    console.log({
      channel: 'whatsapp',
      source: SOURCE_NUMBER,
      destination: `2${destination}`,
      message: JSON.stringify({
        type: 'text',
        text: `*${code}* is your verification code.\nThis code expires in 3 minutes.`
      }),
      'src.name': 'carwan Dough'
    });

    const response = await axios.post(GUPSHUP_API_URL, data, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': GUPSHUP_API_KEY
      }
    });

    console.log('Message sent successfully:', response.data);

    return response.data;

  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
};

export default sendMessage;
