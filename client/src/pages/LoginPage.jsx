import React, { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import assets from "../assets/chat-app-assets/assets";
import KoneChatLogo from "../assets/KoneChatCircular.png";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  const [currentState, setCurrentState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const submitHandle = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    

    if (currentState === "Sign up") {
      if (!isDataSubmitted) {
        setIsDataSubmitted(true);
        setIsLoading(false);
        return;
      }

      try {
        await login("signup", { fullName, email, pw, bio });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        console.log("Login attempt with:", { email, pw });
        if (!email || !pw) {
          toast.error("Please enter both email and password");
          return;
        }
        await login("login", { email, pw });
      } catch (error) {
        console.error("Login failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      <Toaster position="top-center" />
      {/* left */}
      <img
        src={KoneChatLogo}
        className="w-[min(30vw,250px)]"
        alt="KoneChat Logo"
      ></img>
      {/* right */}
      <form
        onSubmit={submitHandle}
        className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currentState}
          {isDataSubmitted && (
            <img
              src={assets.arrow_icon}
              onClick={() => setIsDataSubmitted(false)}
              className="w-5 cursor-pointer"
            ></img>
          )}
        </h2>
        {currentState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
            placeholder="Full name"
            required
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            disabled={isLoading}
          ></input>
        )}

        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              required
              className="border p-2 border-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            ></input>

            <input
              onChange={(e) => setPw(e.target.value)}
              value={pw}
              type="password"
              placeholder="Password"
              required
              className="border p-2 border-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            ></input>
          </>
        )}

        {currentState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            name=""
            rows={4}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-indigo-500"
            placeholder="Provide a short bio..."
            required
            disabled={isLoading}
          ></textarea>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : (
            currentState === "Sign up" ? "Create account" : "Login"
          )}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" required disabled={isLoading} />
          <p>Agree to the terms of use & privacy</p>
        </div>
        <div className="flex flex-col gap-2">
          {currentState === "Sign up" ? (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrentState("Login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Create an account{" "}
              <span
                onClick={() => {
                  setCurrentState("Sign up");
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
