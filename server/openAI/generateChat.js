// import OpenAI from "openai";

// const systemMessage = {
//   role: "system",
//   content: "You are a helpful assistant.",
// };

// /*
// [
//   {role: "system", content: "You are a helpful assistant."},
//   {role: "user", content: "Hi"},
//   {role: "assistant", content: "Hello! How can I assist you today?"},
//   {},
//   {
// ]
// */

// const conversation = [systemMessage];

// export async function generateChat(userInput) {
//   conversation.push({ role: "user", content: userInput });

//   try {
//     const configuration = {
//       organization: process.env.ORGANIZATION_ID,
//       apiKey: process.env.OPENAI_API_KEY,
//     };
//     const openai = new OpenAI(configuration);

//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: conversation,
//       max_tokens: 250,
//     });
//     const assistantResponse = response.choices[0].message;
//     // console.log(assistantResponse);

//     conversation.push(assistantResponse);
//     return assistantResponse.content;
//   } catch (e) {
//     console.log(e.message);
//   }
// }
