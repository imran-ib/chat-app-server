// import twilio from "twilio";

// const TwillioClient = twilio(
//   process.env.TWILIO_ACCOUNT_ID,
//   process.env.TWILIO_TOKEN
// );

// const SendSms = (to: string, body: string) => {
//   return TwillioClient.messages.create({
//     body,
//     to,
//     from: process.env.TWILIO_NUMBER
//   });
// };

// export const SendVericficationSms = (to: string, key: string) => {
//   return SendSms(to, `Your Phone Varification code is ${key}`);
// };
