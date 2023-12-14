// import OpenAI from "openai";

// const streamText = async (prompt, onText) => {
//   try {
//     const configuration = {
//       organization: process.env.ORGANIZATION_ID,
//       apiKey: process.env.OPENAI_API_KEY,
//     };
//     const openai = new OpenAI(configuration);
//     const res = await openai.createChatCompletion(
//       {
//         model: "text-davinci-003",
//         prompt: prompt,
//         max_tokens: 300,
//         stream: true,
//       },
//       { responseType: "stream" }
//     );

//     res.data.on("data", (data) => {
//       const lines = data
//         .toString()
//         .split("\n")
//         .filter((line) => line.trim() !== "");
//       for (const line of lines) {
//         const message = line.replace(/^data: /, "");
//         if (message === "[DONE]") {
//           return; // Stream finished
//         }
//         try {
//           const parsed = JSON.parse(message);
//           onText(parsed.choices[0].text);
//         } catch (error) {
//           console.error("Could not JSON parse stream message", message, error);
//         }
//       }
//     });
//   } catch (error) {
//     if (error.response?.status) {
//       console.error(error.response.status, error.message);
//       error.response.data.on("data", (data) => {
//         const message = data.toString();
//         try {
//           const parsed = JSON.parse(message);
//           console.error("An error occurred during OpenAI request: ", parsed);
//         } catch (error) {
//           console.error("An error occurred during OpenAI request: ", message);
//         }
//       });
//     } else {
//       console.error("An error occurred during OpenAI request", error);
//     }
//   }
// };

// export default streamText;
