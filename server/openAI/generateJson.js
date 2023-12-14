import OpenAI from "openai";
const generateJson = async () => {
  try {
    const configuration = {
      organization: process.env.ORGANIZATION_ID,
      apiKey: process.env.OPENAI_API_KEY,
    };
    const openai = new OpenAI(configuration);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        {
          role: "system",
          content:
            "Give me the question, the topic, the answer and the source of questions I ask you. Provide it in JSON format",
        },
        { role: "user", content: "Who won the world series in 2020?" },
      ],
      model: "gpt-3.5-turbo-1106",
      //   seed: 50,
      response_format: { type: "json_object" },
    });
    // console.log(completion);
    const result = completion.choices[0].message.content;
    console.log(result);
    return result;
  } catch (e) {
    console.log(e.message);
  }
};
export default generateJson;
