import React, { useState } from "react";
import "./Chatbot.css"; // Optionally, you can add some basic styling for the chatbot UI.

interface Message {
  text: string;
  sender: "user" | "bot";
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  // Function to simulate bot response (this is where AI API integration would go)
  const botResponse = (userMessage: string) => {
    let response = "";
    if (userMessage.toLowerCase().includes("hello")) {
      response = "Hi there! How can I help you today?";
    } else if (userMessage.toLowerCase().includes("how are you")) {
      response = "I'm just a bot, but I'm doing well, thanks for asking!";
    } else {
      response = "Sorry, I didn't quite understand that.";
    }
    return response;
  };

  // Handle user message and bot response
  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessages = [
        ...messages,
        { text: input, sender: "user" },
        { text: botResponse(input), sender: "bot" },
      ];
      setMessages(newMessages);
      setInput("");
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;