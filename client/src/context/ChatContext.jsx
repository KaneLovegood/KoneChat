import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
  const [mess, setMess] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMess, setUnseenMess] = useState({});
  const { socket, axios } = useContext(AuthContext);

  //get all users for sidebar
  const getUsers = async () => {
    try {
      console.log("Fetching users...");
      const { data } = await axios.get("/api/messages/users");
      console.log("API Response:", data);
      if (data.success) {
        setUsers(data.users);
        setUnseenMess(data.unseenMess || {});
      } else {
        setUnseenMess({});
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.message);
      setUnseenMess({});
    }
  };

  //get message for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMess(Array.isArray(data.messages) ? data.messages : []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error.message);
      setMess([]);
    }
  };

  //send to selected user
  const send = async (messData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messData
      );
      if (data.success && data.newMessage) {
        setMess((prevMess) => {
          const currentMess = Array.isArray(prevMess) ? prevMess : [];
          return [...currentMess, data.newMessage];
        });
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message);
    }
  };

  // subscribe to messages for selected user
  const subscribeToMess = () => {
    if (!socket) return;

    socket.on("new_message", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        setMess((prevMess) => {
          const currentMess = Array.isArray(prevMess) ? prevMess : [];
          return [...currentMess, newMessage];
        });
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMess((prevMess) => ({
          ...prevMess,
          [newMessage.senderId]: (prevMess[newMessage.senderId] || 0) + 1,
        }));
      }
    });
  };

  //unsubscribe from messages
  const unsubFromMess = () => {
    if (socket) socket.off("new_message");
  };

  useEffect(() => {
    subscribeToMess();
    return () => unsubFromMess();
  }, [socket, selectedUser]);

  const value = {
    mess,
    users,
    selectedUser,
    getUsers,
    setMess,
    send,
    setSelectedUser,
    unseenMess,
    setUnseenMess,
    getMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
