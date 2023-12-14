// import OpenAI from "openai";
// const generateText = async (myPrompt) => {
//   const configuration = {
//     organization: process.env.ORGANIZATION_ID,
//     apiKey: process.env.OPENAI_API_KEY,
//   };
//   const openai = new OpenAI(configuration);

//   try {
//     const completion = await openai.completions.create({
//       // gpt-3.5-turbo-instruct
//       model: "text-davinci-003",
//       prompt: myPrompt,
//       max_tokens: 100,
//       // temperature: 1,
//       // stop: ":",
//       // presence_penalty: 2,
//       // seed: 42,
//     });

//     const text = completion.choices[0].text;

//     return text;
//   } catch (e) {
//     console.log(e.message);
//   }
// };
// export default generateText;
