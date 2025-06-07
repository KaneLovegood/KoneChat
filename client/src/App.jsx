import React, { useContext } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Profile from "./pages/ProfilePage";
import {Toaster} from 'react-hot-toast'
import { AuthContext } from "../src/context/AuthContext";

const App = () => {
  const {authUser} = useContext(AuthContext)
  const navi = useNavigate()
  return (
    <div  className="bg-[url('/bgImage.svg')] bg-contain ">
      <Toaster/>

      <Routes>
        <Route path="/" element={authUser? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser?<LoginPage /> : <Navigate to="/" /> }/>
        <Route path="/profile" element={authUser? <Profile /> :<Navigate to="/login"/> } />
      </Routes>
    </div>
  );
};

export default App;
