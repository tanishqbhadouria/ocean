import axios from "axios";
const SOLO_SERVER_URL = "http://localhost:11434/api/chat";

export const getChat = async (req, res) => {
  try {
    const { message } = req.body;

    const payload = {
      model: "llama3.2",
      messages: [{ role: "user", content: message }],
    };

    const response = await axios.post(SOLO_SERVER_URL, payload, {
      responseType: "stream",
    });

    let fullResponse = "";
    response.data.on("data", (chunk) => {
      const lines = chunk.toString().split("\n");
      for (let line of lines) {
        if (line.trim()) {
          try {
            const json = JSON.parse(line);
            fullResponse += json.message?.content || "";
          } catch (err) {
            console.error("Error parsing response:", err);
          }
        }
      }
    });

    response.data.on("end", () => res.json({ response: fullResponse }));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
