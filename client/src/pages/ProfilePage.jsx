import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/chat-app-assets/assets";
import KoneChatLogo from "../assets/KoneChatCircular.png";
import { AuthContext } from "../context/AuthContext";

// Hàm nén ảnh
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
    };
  });
};

const Profile = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const [img, setImg] = useState(authUser.img);
  const navi = useNavigate();
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await updateProfile(
        img ? { img, fullName: name, bio } : { fullName: name, bio }
      );

      if (updatedUser) {
        // Đợi state được cập nhật
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <img
          onClick={() => navi("/")}
          src={assets.arrow_icon}
          className="absolute top-0 left-0 w-5 mt-2 ml-2 cursor-pointer"
        />
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const compressedImage = await compressImage(file);
                  setImg(compressedImage);
                }
              }}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            ></input>
            <img
              src={img || assets.avatar_icon}
              className={`w-12 h-12 ${img && "rounded-full"}`}
            ></img>
            upload profile image
          </label>

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            required
            placeholder="Your name"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          ></input>
          <textarea
            rows={4}
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            required
            placeholder="Write profile bio"
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <button
            type="submit"
            disabled={loading}
            className={`bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg  ${
              loading ? "opacity-50 cursor-not-allowed " : "cursor-pointer"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
        <img
          src={authUser.img || KoneChatLogo}
          // onClick={() => navi("/")}
          className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 cursor-pointer ${
            img && "rounded-full"
          }`}
        />
      </div>
    </div>
  );
};

export default Profile;
