// import OpenAI from "openai";
// //can also provide multiple images and also uploading your own image based on 64 encoding
// const imageDescription = async () => {
//   const configuration = {
//     organization: process.env.ORGANIZATION_ID,
//     apiKey: process.env.OPENAI_API_KEY,
//   };
//   const openai = new OpenAI(configuration);
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4-vision-preview",
//       max_tokens: 200,
//       messages: [
//         {
//           role: "user",
//           content: [
//             { type: "text", text: "What’s in this image?" },
//             {
//               type: "image_url",
//               image_url: {
//                 url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
//               },
//             },
//           ],
//         },
//       ],
//     });
//     return response.choices[0].message.content;
//   } catch (e) {
//     console.log(e.message);
//   }
// };

// export default imageDescription;
