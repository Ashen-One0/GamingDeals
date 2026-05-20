import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const AuthCallback = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const { t } = useTranslation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const hash = window.location.hash || "";
    const m = hash.match(/session_id=([^&]+)/);
    if (!m) {
      navigate("/login", { replace: true });
      return;
    }
    const sessionId = m[1];
    (async () => {
      try {
        const r = await axios.post(`${API}/auth/session-process`, {}, {
          headers: { "X-Session-ID": sessionId },
          withCredentials: true,
        });
        await refresh();
        navigate("/", { replace: true, state: { user: r.data.user } });
      } catch (e) {
        console.error(e);
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate, refresh]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-zinc-500">
      {t("auth.signing_in")}
    </div>
  );
};

export default AuthCallback;
