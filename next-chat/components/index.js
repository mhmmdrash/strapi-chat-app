import React, { useEffect, useState, useMemo, useRef } from "react";
import { Input } from "antd";
import "antd/dist/antd.css";
// import "font-awesome/css/font-awesome.min.css";
import Header from "./Header";
import Messages from "./Messages";
import List from "./List";
import io from "socket.io-client";
import {
  ChatContainer,
  StyledContainer,
  ChatBox,
  StyledButton,
  SendIcon,
} from "../pages/chat/styles";

function ChatRoom({ username, id }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const buttonRef = useRef(null);

  // instantiating event listeners
  const socket = useMemo(() => {
    return io("http://localhost:1337");
  }, []);
  // socket.on("disconnect", () => {
  //   socket.off();
  //   location.replace("http://localhost:3000/");
  //   console.log("disconnected");
  // });

  socket.on("message", async (data) => {
    const msg = {
      user: data.user,
      message: data.message,
    };
    setMessages((prevMessages) => [...prevMessages, msg]);
  });

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:1337/api/messages?sort=id:asc&pagination[pageSize]=400");
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await res.json();
      const formattedMessages = data.data.map((one) => ({
        user: one.attributes.user,
        message: one.attributes.message,
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        buttonRef.current.click();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    console.log("Socket connection status:", socket.connected);
  }, [messages])

  useEffect(() => {
    socket.connect()
    console.log("Socket connection status:", socket.connected);
    function onMessage(data) {
      console.log("message received", data.message)
      const msg = {
        user: data.user,
        message: data.message,
      };
      setMessages((prevMessages) => [...prevMessages, msg]); 
    }
    socket.on("message", onMessage);

    // Clean up event listener when component unmounts
    return () => {
      console.log("Cleaning event listener")
      socket.off("message", onMessage);
      socket.disconnect()
    };
  }, [socket]); // Include socket in the dependency array 

  useEffect(() => {
    console.log("Socket connection status:", socket.connected);
    fetchData();

    socket.emit("join", { username }, (error) => {
      if (error) return alert(error);
    });

    socket.on("welcome", async (data) => {
      let welcomeMessage = {
        user: data.user,
        message: data.text,
      };
      setMessages((allMessages) => [welcomeMessage, ...allMessages])
  });
  }, []);
  
  const sendMessage = (message) => {
    if (message) {
      console.log("Socket connection status:", socket.connected);
      socket.emit("sendMessage", { message, user: username }, (error) => {
        if (error) {
          alert(error);
        }
      });
      setMessage("");
    } else {
      alert("Message can't be empty");
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleClick = () => {
    sendMessage(message);
  };

  return (
    <ChatContainer>
      <Header room="Bot Chat" />
      <StyledContainer>
        <List users={users} id={id} username={username} />
        <ChatBox>
          <Messages messages={messages} username={username} />
          <Input
            type="text"
            placeholder="Type your message"
            value={message}
            onChange={handleChange}
          />
          <StyledButton onClick={handleClick} ref={buttonRef}>
            <SendIcon>
              Send
              <i className="fa fa-paper-plane" />
            </SendIcon>
          </StyledButton>
        </ChatBox>
      </StyledContainer>
    </ChatContainer>
  );
}

export default ChatRoom;
