import React, { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import assets from "../assets/chat-app-assets/assets";
import KoneChatLogo from "../assets/KoneChatCircular.png";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { formatMessageTime } from "../lib/utils";

const ChatCointainer = () => {
  const { mess, selectedUser, setSelectedUser, getMessages, send } =
    useContext(ChatContext);
  const { authUser, onlineUser } = useContext(AuthContext);

  const [input, setInput] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    if (input.trim() === "") {
      return null;
    }
    try {
      await send({ text: input.trim() });
      setInput("");
    } catch (err) {
      console.error("Send message error:", err);
      toast.error("Failed to send message");
    }
  };

  const handleSendImg = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await send({ image: reader.result });
        e.target.value = "";
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Failed to upload image");
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  const scrollEnd = useRef();
  useEffect(() => {
    if (scrollEnd.current && mess) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mess]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 py-3 border-b border-stone-500 w-full  bg-gray-900/85 backdrop-blur-3xl">
        <img
          src={selectedUser.img || assets.avatar_icon}
          className="w-8 rounded-full mx-2"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {Array.isArray(onlineUser) && onlineUser.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          className="md:hidden max-w-7"
        />
        <img src={assets.help_icon} className="max-md:hidden max-w-5" />
      </div>
      {/* chat area */}
      <div className="flex flex-col h-[calc(100% - 120px)] min-h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {Array.isArray(mess) && mess.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            } `}
          >
            {msg.image ? (
              <img
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                src={msg.image}
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light 
                    rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                      msg.senderId === authUser._id
                        ? "rounded-br-none"
                        : "rounded-bl-none"
                    }`}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.img || assets.avatar_icon
                    : selectedUser?.img || assets.avatar_icon
                }
                className="w-7 rounded-full"
              />
              <p className="text-gray-500">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* bottom area */}
      <div className="sticky bottom-0 left-0 right-0 bg-gray-900/85 bg- backdrop-blur-3xl flex items-center gap-3 p-3 w-full z-50">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSend(e) : null)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input
            type="file"
            id="img"
            accept="image/png, image/jpeg"
            hidden
            onChange={handleSendImg}
          />
          <label htmlFor="img">
            <img
              src={assets.gallery_icon}
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSend}
          src={assets.send_button}
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={KoneChatLogo} className="max-w-24" />
      <p className="text-lg font-medium text-white">
        Every message carries a heartbeat.
      </p>
    </div>
  );
};

export default ChatCointainer;
