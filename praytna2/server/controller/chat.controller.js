import axios from "axios";
const SOLO_SERVER_URL = "http://localhost:11434/api/chat";

export const getChat = async (req, res) => {
  try {
    const { message } = req.body;

    // System Prompt
    const systemPrompt = {
      role: "system",
      content: `You are an AI assistant specialized in maritime navigation and real-time ship route optimization. 
      Your purpose is to assist users with insights related to fuel-efficient, safe, and time-optimized oceanic routes, 
      using real-time weather and oceanic data.

      Project Scope:
      - Optimize ship routes for fuel efficiency, safety, and voyage time.
      - Dynamically adjust routes using real-time meteorological data.
      - Use SHP files to extract navigable ocean paths, create a graph, and apply Dijkstra’s Algorithm for shortest paths.
      - Adjust route weights based on weather API data and recalculate paths iteratively.
      - Final route should be the most optimal, considering efficiency and safety.

      Respond only with information relevant to ship route optimization and maritime navigation. Do not provide general AI-related discussions outside this scope.`
    };

    const payload = {
      model: "llama3.2",
      messages: [
        systemPrompt,  // Include the system prompt first
        { role: "user", content: message }
      ],
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
