import React, { useState } from "react";
import axios from "axios";

const About = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    try {
      const res = await axios.post("http://localhost:8080/generate", {
        prompt: input,
        n_predict: 100
      });

      setResponse(res.data.output || "No response from AI");
    } catch (error) {
      console.error("Error:", error);
      setResponse("Error fetching response");
    }
  };

  return (
    <div>
      <h2>About Solo AI</h2>
      <input 
        type="text" 
        placeholder="Ask something..." 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleGenerate}>Generate</button>
      {response && <p><strong>Response:</strong> {response}</p>}
    </div>
  );
};

export default About;
