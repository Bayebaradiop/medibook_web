import axios from "axios";
import { BASE_URL } from "@/constantes/global";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Envoie le cookie HttpOnly automatiquement
});

// Intercepteur réponse — gérer les erreurs globales
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
