import axios from "axios";

import { auth } from "@/lib/firebase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const getLocaleFromCookie = () => {
  if (typeof document === "undefined") {
    return "vi";
  }

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("NEXT_LOCALE="));

  return match?.split("=")[1] || "vi";
};

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  if ((config.method || "get").toLowerCase() === "get") {
    const lang = getLocaleFromCookie();

    if (config.params instanceof URLSearchParams) {
      if (!config.params.has("lang")) {
        config.params.set("lang", lang);
      }
    } else {
      config.params = {
        ...(config.params || {}),
        lang: config.params?.lang || lang,
      };
    }
  }

  return config;
});

export default api;
