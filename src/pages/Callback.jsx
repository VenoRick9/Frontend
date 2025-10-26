import { useEffect, useState } from "react";
import axios from "axios";
import { keycloakConfig } from "../config/keycloakConfig";

export default function Callback() {
  const [status, setStatus] = useState("Exchanging code...");

  useEffect(() => {
    const exchangeToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) return setStatus("No authorization code found");

      const verifier = localStorage.getItem("pkce_verifier");
      const { url, clientId, redirectUri } = keycloakConfig;

      try {
        const res = await axios.post(`${url}/token`, new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          code,
          redirect_uri: redirectUri,
          code_verifier: verifier,
        }));

        localStorage.setItem("accessToken", res.data.access_token);
        localStorage.setItem("refreshToken", res.data.refresh_token);

        setStatus("Authenticated!");
        window.location.href = "/items";
      } catch (err) {
        console.error(err);
        setStatus("Token exchange failed");
      }
    };

    exchangeToken();
  }, []);

  return <p></p>;
}
