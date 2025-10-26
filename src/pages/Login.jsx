import { useEffect } from "react";
import { keycloakConfig } from "../config/keycloakConfig";
import { generateCodeVerifier, generateCodeChallenge } from "../utils/pkce";

export default function Login() {
  useEffect(() => {
    const initiateLogin = async () => {
      
      const verifier = generateCodeVerifier();
      localStorage.setItem("pkce_verifier", verifier);

      const challenge = await generateCodeChallenge(verifier);
      const { url, clientId, redirectUri } = keycloakConfig;

      const authUrl = `${url}/auth?client_id=${clientId}&response_type=code&scope=openid profile email&redirect_uri=${redirectUri}&code_challenge=${challenge}&code_challenge_method=S256`;

      window.location.href = authUrl;
    };

    initiateLogin();
  }, []);

  return <p></p>;
}
