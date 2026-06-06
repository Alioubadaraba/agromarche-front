import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ nom:"", email:"", mot_de_passe:"", confirmer_mdp:"", role:"agriculteur", region:"dakar" });
  const [erreur, setErreur] = useState("");
  const navigate = useNavigate();

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setErreur("");
    if (mode === "register") {
      if (!form.nom || !form.email || !form.mot_de_passe) { setErreur("Veuillez remplir tous les champs."); return; }
      if (form.mot_de_passe !== form.confirmer_mdp) { setErreur("Les mots de passe ne correspondent pas."); return; }
      if (form.mot_de_passe.length < 6) { setErreur("Mot de passe trop court (6 caractères minimum)."); return; }
    }
    try {
      const url = mode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(url, form);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.utilisateur));
      navigate("/dashboard");
    } catch {
      setErreur(mode === "login" ? "Email ou mot de passe incorrect." : "Erreur. Email déjà utilisé ?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:"linear-gradient(135deg,#1D6A3A 0%,#D97706 100%)"}}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌱</div>
          <h1 className="text-2xl font-bold text-green-700">AgroMarché</h1>
          <p className="text-gray-500 text-sm">Connectez agriculteurs et marchés</p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
          <button onClick={() => setMode("login")} className={`flex-1 py-2 text-sm font-medium transition ${mode==="login" ? "bg-green-700 text-white" : "text-gray-500"}`}>Connexion</button>
          <button onClick={() => setMode("register")} className={`flex-1 py-2 text-sm font-medium transition ${mode==="register" ? "bg-green-700 text-white" : "text-gray-500"}`}>Inscription</button>
        </div>

        {mode === "register" && (
          <input name="nom" placeholder="Nom complet *" onChange={handle}
            className="w-full border rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        )}

        <input name="email" type="email" placeholder="Email *" onChange={handle}
          className="w-full border rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />

        <input name="mot_de_passe" type="password" placeholder="Mot de passe *" onChange={handle}
          className="w-full border rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />

        {mode === "register" && (
          <>
            <div className="mb-3">
              <input name="confirmer_mdp" type="password" placeholder="Confirmer le mot de passe *" onChange={handle}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  form.confirmer_mdp && form.mot_de_passe !== form.confirmer_mdp ? "border-red-400 bg-red-50" :
                  form.confirmer_mdp && form.mot_de_passe === form.confirmer_mdp ? "border-green-400 bg-green-50" : ""
                }`} />
              {form.confirmer_mdp && form.mot_de_passe !== form.confirmer_mdp && <p className="text-red-500 text-xs mt-1">❌ Les mots de passe ne correspondent pas</p>}
              {form.confirmer_mdp && form.mot_de_passe === form.confirmer_mdp && <p className="text-green-600 text-xs mt-1">✅ Mots de passe identiques</p>}
            </div>

            <select name="role" onChange={handle} className="w-full border rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="agriculteur">🌱 Agriculteur</option>
              <option value="acheteur">🤝 Acheteur</option>
            </select>

            <select name="region" onChange={handle} className="w-full border rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="dakar">Dakar</option>
              <option value="thies">Thiès</option>
              <option value="kaolack">Kaolack</option>
              <option value="ziguinchor">Ziguinchor</option>
              <option value="saint-louis">Saint-Louis</option>
            </select>
          </>
        )}

        {erreur && <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded-lg">⚠️ {erreur}</p>}

        <button onClick={submit} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition">
          {mode === "login" ? "Se connecter" : "Créer mon compte"}
        </button>
      </div>
    </div>
  );
}
