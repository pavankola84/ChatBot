import React, { useState, useRef, useEffect } from "react";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import CachedIcon from "@mui/icons-material/Cached";
import "./ChatBot.css";

const API_KEY = "Your_API_Key";

const Chatbot = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { content: "Hi there 👋 How can I help you today?", className: "incoming" },
  ]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatboxRef = useRef(null);

  const toggleChatbot = () => {
    setShowChatbot((prevState) => !prevState);
  };

  const handleInputChange = (e) => {
    setUserMessage(e.target.value);
  };

  const refreshChat = () => {
    setChatMessages([
      chatMessages[0]
    ]);
  };
  
  const handleSendChat = () => {
    if (!userMessage.trim()) return;

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { content: userMessage, className: "outgoing" },
      { content: "...", className: "incoming" },
    ]);
    setUserMessage("");

    generateResponse(userMessage);
  };

  const generateResponse = async (message) => {
    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        method: "post",
        data: { contents: [{ parts: [{ text: message }] }] },
      });
      const responseData = response.data.candidates[0].content.parts[0].text;
      setChatMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { content: responseData.trim(), className: "incoming" },
      ]);
      scrollChatToBottom();
    } catch (error) {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          content: "Oops! Something went wrong. Please try again.",
          className: "error",
        },
      ]);
    }
  };

  const scrollChatToBottom = () => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollChatToBottom();
  }, [chatMessages]);

  return (
    <>
      {showChatbot && (
        <div className="chatbot">
          <header>
            <h2>Chatbot</h2>
          </header>
          <ul className="chatbox" ref={chatboxRef}>
            {chatMessages.map((message, index) => (
              <li key={index} className={`chat ${message.className}`}>
                {message.className === "incoming" && (
                  <span className="icon">
                    <SmartToyIcon style={{ marginTop: "4px" }} />
                  </span>
                )}
                <p>{message.content}</p>
              </li>
            ))}
          </ul>
          <div className="chat-input">
            <div id="Refresh-btn" onClick={refreshChat}>
              <CachedIcon />
            </div>
            <textarea
              value={userMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChat();
                }
              }}
              placeholder="Enter a message..."
              spellCheck="false"
              required
            />

            <span id="send-btn" onClick={handleSendChat}>
              <SendIcon />
            </span>
          </div>
        </div>
      )}
      <div className="toggle-icon" onClick={toggleChatbot}>
        {showChatbot ? <CloseIcon /> : <SmartToyIcon />}
      </div>
    </>
  );
};

export default Chatbot;
