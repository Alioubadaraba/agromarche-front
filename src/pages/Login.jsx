import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ nom: "", email: "", mot_de_passe: "", role: "agriculteur", region: "dakar" });
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    try {
      const url = mode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(url, form);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.utilisateur));
      navigate("/dashboard");
    } catch {
      setErreur("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"linear-gradient(135deg,#1D6A3A 0%,#D97706 100%)"}}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌱</div>
          <h1 className="text-2xl font-bold text-vert-500">AgroMarché</h1>
          <p className="text-gray-500 text-sm">Connectez agriculteurs et marchés</p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
          <button onClick={() => setMode("login")} className={`flex-1 py-2 text-sm font-medium transition ${mode==="login" ? "bg-vert-500 text-white" : "text-gray-500"}`}>Connexion</button>
          <button onClick={() => setMode("register")} className={`flex-1 py-2 text-sm font-medium transition ${mode==="register" ? "bg-vert-500 text-white" : "text-gray-500"}`}>Inscription</button>
        </div>

        {mode === "register" && (
          <input name="nom" placeholder="Nom complet" onChange={handle}
            className="w-full border rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-vert-500" />
        )}
        <input name="email" type="email" placeholder="Email" onChange={handle}
          className="w-full border rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-vert-500" />
        <input name="mot_de_passe" type="password" placeholder="Mot de passe" onChange={handle}
          className="w-full border rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-vert-500" />

        {mode === "register" && (
          <>
            <select name="role" onChange={handle} className="w-full border rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-vert-500">
              <option value="agriculteur">Agriculteur</option>
              <option value="acheteur">Acheteur</option>
            </select>
            <select name="region" onChange={handle} className="w-full border rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-vert-500">
              <option value="dakar">Dakar</option>
              <option value="thies">Thiès</option>
              <option value="kaolack">Kaolack</option>
              <option value="ziguinchor">Ziguinchor</option>
              <option value="saint-louis">Saint-Louis</option>
            </select>
          </>
        )}

        {erreur && <p className="text-red-500 text-sm mb-3">{erreur}</p>}

        <button onClick={submit} className="w-full bg-vert-500 hover:bg-vert-600 text-white font-semibold py-3 rounded-lg transition">
          {mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </div>
    </div>
  );
}
