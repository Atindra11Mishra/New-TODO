
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Todo from "./Todo";

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (token) {
      axios
        .get("http://localhost:5000/api/auth/Home", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(({ data }) => setUser(data)) 
        .catch((error) => {
          console.error("Error:", error.response?.data || error.message);
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate("/"); 
        });
    } else {
      navigate("/"); 
    }
  }, [navigate]);
  


  return (
    <>
    <Todo/>
    </>
  );
}

export default Home;
