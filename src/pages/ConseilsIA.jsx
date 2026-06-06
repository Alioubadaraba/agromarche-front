import { useState } from "react";

const SUGGESTIONS = [
  "Quand planter les tomates à Dakar ?",
  "Comment lutter contre les pucerons ?",
  "Quelle culture est profitable en hivernage ?",
  "Comment conserver mes arachides après récolte ?",
  "Quel engrais naturel utiliser pour le mil ?",
];

export default function ConseilsIA({ region }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Bonjour ! Je suis votre conseiller agricole IA 🌱. Posez-moi vos questions sur l'agriculture au Sénégal — cultures, maladies, calendrier agricole, irrigation, etc.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const envoyer = async (question) => {
    const q = question || input.trim();
    if (!q) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `Tu es un conseiller agricole expert spécialisé dans l'agriculture sénégalaise. 
Tu connais parfaitement les cultures du Sénégal (mil, sorgho, arachides, tomates, oignons, riz, mangues, niébé, manioc), 
les saisons (hivernage de juin à octobre, saison sèche froide de novembre à février, saison sèche chaude de mars à mai),
les techniques adaptées au climat sahélien, et les marchés locaux.
La région de l'utilisateur est: ${region}.
Réponds en français, de façon pratique et concise. 
Donne des conseils adaptés au contexte sénégalais avec des solutions locales accessibles aux petits agriculteurs.
Utilise des emojis pour rendre la réponse plus lisible.`,
          messages: [{ role: "user", content: q }]
        })
      });
      const data = await response.json();
      const reponse = data.content?.[0]?.text || "Désolé, je n'ai pas pu répondre. Réessayez.";
      setMessages(prev => [...prev, { role: "assistant", text: reponse }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "❌ Erreur de connexion. Vérifiez votre connexion internet." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="font-semibold text-gray-700 mb-1">Conseiller Agricole IA</h2>
      <p className="text-xs text-gray-400 mb-3">Posez vos questions sur l'agriculture au Sénégal</p>

      {/* Suggestions */}
      <div className="flex gap-2 flex-wrap mb-3">
        {SUGGESTIONS.map((s,i) => (
          <button key={i} onClick={() => envoyer(s)}
            className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full hover:bg-green-100 transition">
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-xl border p-3 mb-3 overflow-y-auto space-y-3" style={{minHeight:"300px", maxHeight:"400px"}}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-xl px-3 py-2 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-green-700 text-white rounded-br-none"
                : "bg-gray-100 text-gray-800 rounded-bl-none"
            }`}>
              {m.role === "assistant" && <span className="text-lg mr-1">🌱</span>}
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-500">
              🌱 En train de réfléchir...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && envoyer()}
          placeholder="Posez votre question agricole..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button onClick={() => envoyer()} disabled={loading || !input.trim()}
          className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm rounded-lg disabled:opacity-50 transition">
          Envoyer
        </button>
      </div>
    </div>
  );
}
