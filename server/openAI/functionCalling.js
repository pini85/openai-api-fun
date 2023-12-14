import OpenAI from "openai";

const functionCalling = async () => {
  const conversation = [
    {
      role: "system",
      content:
        "You are a helpful assistant booking a flight. get all the infromation you need. deprarrue date, destination.",
    },
    { role: "user", content: "Hello, I'd like to book a flight." },
    {
      role: "assistant",
      content: "Of course! Could you please tell me your departure city?",
    },
    { role: "user", content: "I'll be leaving from New York." },
    { role: "assistant", content: "Great! And where will you be flying to?" },
    { role: "user", content: "I need to go to Los Angeles." },
    { role: "assistant", content: "Sounds good. When do you plan on leaving?" },
    { role: "user", content: "I want to leave on June 25th." },
    { role: "assistant", content: "And when will you be returning?" },
    { role: "user", content: "I'll return on July 2nd." },
    {
      role: "assistant",
      content:
        "Alright. Do you have any special requirements or requests for your flight?",
    },
    {
      role: "user",
      content:
        "I'd like to have a vegetarian meal and a window seat if possible.",
    },
    {
      role: "assistant",
      content:
        "Understood. Would you also like to opt in for travel insurance? It's highly recommended.",
    },
    {
      role: "user",
      content: "Yes, please add travel insurance to my booking.",
    },
    {
      role: "assistant",
      content:
        "Great. Just to confirm, you're looking for a flight from New York to Los Angeles departing on June 25th and returning on July 2nd, with a vegetarian meal, a window seat, and travel insurance, correct?",
    },
    { role: "user", content: "Yes, that's correct." },
    {
      role: "assistant",
      content: "Perfect, I'll get that information for you right away.",
    },
  ];
  const functions = [
    {
      name: "bookFlight",
      description: "Book a flight with the given details",
      parameters: {
        type: "object",
        properties: {
          departureCity: { type: "string" },
          destinationCity: { type: "string" },
          departureDate: { type: "string" },
          returnDate: { type: "string" },
          mealPreference: { type: "string" },
          seatPreference: { type: "string" },
          travelInsurance: { type: "boolean" },
        },
      },
    },
  ];
  try {
    const configuration = {
      organization: process.env.ORGANIZATION_ID,
      apiKey: process.env.OPENAI_API_KEY,
    };
    const openai = new OpenAI(configuration);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation,
      functions: functions,
    });

    const message = response.choices[0].message;

    if (message.function_call && message.function_call.name === "bookFlight") {
      const bookingDetails = JSON.parse(message.function_call.arguments);
      return bookingDetails;
    }
    //also possible now to call mutiple functions in parallel

    return null;
  } catch (e) {
    console.error(e.message);
    return null;
  }
};
export default functionCalling;
