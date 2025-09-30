import axios from 'axios';

export async function initiateClickPesaPayment(orderData: any) {
  // Replace with your actual ClickPesa credentials
  const CLICKPESA_API_URL = 'https://api.clickpesa.com/webshop/generate-checkout-url';
  const MERCHANT_ID = process.env.CLICKPESA_MERCHANT_ID;
  const PAYBILL_NUMBER = process.env.CLICKPESA_PAYBILL_NUMBER;

  try {
    const response = await axios.post(
      CLICKPESA_API_URL,
      {
        ...orderData,
        paybill_number: PAYBILL_NUMBER,
      },
      {
        headers: {
          'x-merchant-id': MERCHANT_ID,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
}
