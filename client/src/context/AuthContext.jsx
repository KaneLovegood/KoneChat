import axios from "axios";
import { createContext, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// Sử dụng biến môi trường hoặc fallback về localhost
const backendURL = "https://konechat.onrender.com" ;
console.log("Backend URL:", backendURL);

// Cấu hình axios
axios.defaults.baseURL = backendURL;
axios.defaults.headers.common["Content-Type"] = "application/json";

// Thêm interceptor để tự động thêm token vào mọi request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socket, setSocket] = useState(null);

  //check authenticated
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  //login function

  const login = async (state, credentials) => {
    try {
      // Kiểm tra credentials
      console.log("Credentials received:", credentials);
      if (!credentials.email || !credentials.pw) {
        toast.error("Email and password are required");
        return;
      }

      // Chỉ xóa token nếu đã có token cũ
      if (localStorage.getItem("token")) {
        delete axios.defaults.headers.common["token"];
      }

      const url = `/api/auth/${state}`;
      console.log("Calling API:", backendURL + url);
      console.log("With credentials:", credentials);

      const response = await axios.post(url, credentials);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      console.log("Login response:", response.data);

      const { data } = response;

      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        const newToken = data.token;
        axios.defaults.headers.common["token"] = newToken;
        setToken(newToken);
        localStorage.setItem("token", newToken);
        toast.success(data.message || "Login successful");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      console.log("Error response:", error.response);
      console.log("Error message:", error.message);
      
      // Xử lý các trường hợp lỗi cụ thể
      if (error.response?.status === 401) {
        toast.error("Invalid email or password");
      } else if (error.response?.status === 404) {
        toast.error("User not found");
      } else {
        toast.error(error.response?.data?.message || "An error occurred during login");
      }
    }
  };

  //logout
  const logout = async () => {
    if (socket) {
      socket.disconnect();
    }
    axios.defaults.headers.common["token"] = null;
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUser([]);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("New profile updated");
        return data.user;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      throw error;
    }
  };

  //connect socket function to online users update
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendURL, {
      query: { userId: userData._id },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("Online users:", userIds);
      setOnlineUser(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    }
  }, [token, checkAuth]);

  // Handle socket connection
  useEffect(() => {
    if (authUser && !socket) {
      connectSocket(authUser);
    }
    return () => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [authUser]);

  const value = {
    axios,
    authUser,
    onlineUser,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
