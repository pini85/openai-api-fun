// import OpenAI from "openai";
// const customerReviewSummary = async () => {
//   const reviews = [
//     {
//       review:
//         "Nintendo's 8-bit Mario game is a masterpiece in classic gaming. The gameplay is challenging yet engaging, offering a perfect balance of difficulty and enjoyment. The levels are well-designed, encouraging strategic thinking and quick reflexes. However, newcomers to the 8-bit era might find the controls a bit rigid compared to modern games",
//     },
//     {
//       review:
//         "As a retro game enthusiast, I appreciate the vintage charm of Mario's 8-bit graphics. The pixel art is iconic and has a certain nostalgic appeal. However, for those used to high-definition graphics, it might seem overly simplistic. The visual style, though, is a true representation of video gaming history.",
//     },
//     {
//       review:
//         "Playing the Nintendo 8-bit Mario game is like taking a trip down memory lane. It brings back memories of childhood gaming sessions. The game's legacy in shaping the platformer genre is undeniable. Its simple yet captivating storyline and character design have stood the test of time. This game is more about the experience and nostalgia than cutting-edge technology.",
//     },
//     {
//       review:
//         "While the 8-bit Mario game is praised for its historic value, I find its replay value limited due to repetitive level design and predictable challenges. The sound design, a key aspect of immersive gameplay, is monotonous and lacks variety. This, combined with the absence of an engaging storyline, makes the game less captivating for players seeking depth and innovation in their gaming experience.",
//     },
//   ];

//   let combinedReviews = reviews.map((review) => review.review).join("\n");
//   const delimiter = "####";
//   const prompt = `Summarize the following customer reviews (each separated by ${delimiter}) in 20 words or less:${delimiter}${combinedReviews}${delimiter}`;

//   const configuration = {
//     organization: process.env.ORGANIZATION_ID,
//     apiKey: process.env.OPENAI_API_KEY,
//   };
//   const openai = new OpenAI(configuration);
//   const completion = await openai.completions.create({
//     model: "text-davinci-003",
//     prompt: prompt,
//     max_tokens: 100,
//   });

//   const text = completion.choices[0].text.trim();
//   console.log({ text });
//   return text;
// };
// export default customerReviewSummary;
