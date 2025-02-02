import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Función para verificar si el token sigue siendo válido
export const checkAuth = async () => {
  try {
    const response = await api.get("/user", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

export const logout=()=> {
    api.post("/logout", null, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    .then(() => {
      localStorage.removeItem("token");
      this.$router.push("/login");
    })
    .catch(error => {
      console.error("Error en logout:", error);
    });
  }
  

export default api;