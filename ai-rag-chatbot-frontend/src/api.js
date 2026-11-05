import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
).replace(/\/$/, "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60000
});

function getErrorMessage(error) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  if (error?.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }
  if (!error?.response) {
    return "Cannot reach the backend. Make sure Spring Boot is running at " + API_BASE_URL + ".";
  }
  return `Request failed (${error.response.status}). Please try again.`;
}

async function request(promise) {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export const getSessions = () => request(apiClient.get("/sessions"));

export const createSession = (title = "New conversation") =>
  request(apiClient.post("/sessions", { title }));

export const getMessages = (sessionId) =>
  request(apiClient.get(`/sessions/${encodeURIComponent(sessionId)}/messages`));

export const deleteSession = (sessionId) =>
  request(apiClient.delete(`/sessions/${encodeURIComponent(sessionId)}`));

export const sendMessage = ({ sessionId, message }) =>
  request(
    apiClient.post("/chat", {
      sessionId,
      message,
      provider: "GEMINI"
    })
  );

export const getDocuments = () => request(apiClient.get("/documents"));
export const uploadDocument = (file) => {
  const form = new FormData();
  form.append("file", file);
  return request(apiClient.post("/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" }, timeout: 180000
  }));
};
export const deleteDocument = (documentId) => request(apiClient.delete(`/documents/${encodeURIComponent(documentId)}`));
