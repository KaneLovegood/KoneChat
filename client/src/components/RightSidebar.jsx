import React, { useContext, useEffect, useState } from "react";
import assets from "../assets/chat-app-assets/assets";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const RightSidebar = () => {
  const { selectedUser, mess } = useContext(ChatContext);
  const { logout, onlineUser } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  //get images
  useEffect(() => {
    setMsgImages(mess.filter((msg) => msg.image).map((msg) => msg.image));
  }, [mess]);

  return (
    selectedUser && (
      <div
        className="bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white max-md:hidden"
      >
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto h-full">
          <img
            className="w-20 aspect-[1/1] rounded-full"
            src={selectedUser?.img || assets.avatar_icon}
          />
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            {onlineUser.includes(selectedUser._id) && (
              <p className="w-2 h-2 rounded-full bg-green-500"></p>
            )}
            {selectedUser.fullName}
          </h1>

          <p className="px-10 mx-auto">{selectedUser.bio}</p>
          <hr className="border-[#ffffff50] my-4 w-full" />

          <div className="px-5 text-xs flex-1">
            <p>Media</p>
            <div className="mt-2 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-4 opacity-80">
              {msgImages.map((url, index) => (
                <div
                  key={index}
                  onClick={() => window.open(url)}
                  className="cursor-pointer rounded"
                >
                  <img src={url} className="h-full rounded-md" />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer mt-auto"
          >
            Logout
          </button>
        </div>
      </div>
    )
  );
};

export default RightSidebar;