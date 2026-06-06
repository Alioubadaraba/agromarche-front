import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const REGIONS = ["dakar","thies","kaolack","ziguinchor","saint-louis"];
const PRODUITS = ["Tomates","Oignons","Mil","Maïs","Arachides","Riz local","Mangues","Niébé","Manioc","Aubergines","Choux","Pastèques"];

export default function DashboardAcheteur() {
  const [onglet, setOnglet]     = useState("marche");
  const [region, setRegion]     = useState("dakar");
  const [prix, setPrix]         = useState([]);
  const [meteo, setMeteo]       = useState(null);
  const [offres, setOffres]     = useState([]);
  const [mlProduit, setMlProduit] = useState("Tomates");
  const [mlData, setMlData]     = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [newOffre, setNewOffre] = useState({
    produit:"Tomates", quantite_kg:"", prix_propose:"",
    region:"dakar", description:"",
    acheteur_wa:"", acheteur_tel:""
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => { chargerPrix(); chargerMeteo(); chargerOffres(); }, [region]);

  const chargerPrix   = async () => { try { const {data} = await api.get(`/prix/${region}`); setPrix(data); } catch { setPrix([]); }};
  const chargerMeteo  = async () => { try { const {data} = await api.get(`/meteo/${region}`); setMeteo(data); } catch { setMeteo(null); }};
  const chargerOffres = async () => { try { const {data} = await api.get(`/offres/?region=${region}`); setOffres(data); } catch { setOffres([]); }};

  const publierOffre = async () => {
    if (!newOffre.quantite_kg || !newOffre.prix_propose) {
      alert("Veuillez remplir la quantité et le prix."); return;
    }
    if (!newOffre.acheteur_wa && !newOffre.acheteur_tel) {
      alert("Veuillez entrer au moins un numéro de contact (WhatsApp ou téléphone)."); return;
    }
    setSaving(true);
    try {
      await api.post("/offres/", {
        ...newOffre,
        acheteur_nom: user.nom,
        quantite_kg: parseFloat(newOffre.quantite_kg),
        prix_propose: parseFloat(newOffre.prix_propose),
      });
      setNewOffre({ produit:"Tomates", quantite_kg:"", prix_propose:"", region:"dakar", description:"", acheteur_wa:"", acheteur_tel:"" });
      chargerOffres();
      alert("✅ Offre publiée ! Les agriculteurs peuvent vous contacter.");
    } catch { alert("Erreur lors de la publication."); }
    setSaving(false);
  };

  const fermerOffre = async (id) => {
    try { await api.delete(`/offres/${id}`); chargerOffres(); } catch {}
  };

  const lancerPrediction = async () => {
    setMlLoading(true); setMlData(null);
    try {
      await api.post(`/ml/train?produit=${mlProduit}&region=${region}`);
      const {data} = await api.get(`/ml/predict?produit=${mlProduit}&region=${region}`);
      setMlData(data);
    } catch {}
    setMlLoading(false);
  };

  const deconnexion = () => { localStorage.clear(); navigate("/"); };

  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{background:"linear-gradient(90deg,#185FA5,#1a6db5)"}} className="text-white px-4 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤝</span>
          <div>
            <h1 className="font-bold text-lg leading-none">AgroMarché</h1>
            <p className="text-xs text-blue-200">Acheteur — {user.nom} 👋</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={region} onChange={e=>setRegion(e.target.value)} className="text-sm bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 focus:outline-none">
            {REGIONS.map(r=><option key={r} value={r} className="text-black">{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
          </select>
          <button onClick={deconnexion} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg">Quitter</button>
        </div>
      </header>

      {meteo && (
        <div style={{background:"linear-gradient(90deg,#185FA5,#0f4a8a)"}} className="text-white px-4 py-2 flex items-center gap-4 text-sm flex-wrap">
          <span>🌤 {meteo.temperature}°C — {meteo.description}</span>
          <span>💧 {meteo.humidite}%</span>
          <span>🌬 {meteo.vent_kmh} km/h</span>
        </div>
      )}

      <nav className="bg-white border-b flex overflow-x-auto">
        {[["marche","📊 Marchés"],["offres","📢 Mes Offres"],["negocier","💰 Négocier"],["meteo","🌦 Météo"]].map(([id,label])=>(
          <button key={id} onClick={()=>setOnglet(id)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition ${onglet===id?"border-blue-600 text-blue-600":"border-transparent text-gray-500"}`}>
            {label}
          </button>
        ))}
      </nav>

      <main className="max-w-2xl mx-auto p-4">

        {onglet==="marche" && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-1">Prix du marché — {region.charAt(0).toUpperCase()+region.slice(1)}</h2>
            <p className="text-xs text-gray-400 mb-4">Comparez les prix avant de négocier</p>
            {prix.length===0 ? (
              <div className="text-center py-12 bg-white rounded-xl border"><p className="text-4xl mb-3">📊</p><p className="text-gray-500">Aucun prix disponible</p></div>
            ) : (
              <div className="space-y-3">
                {prix.map((p,i)=>(
                  <div key={i} className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">🌿</div>
                      <div><p className="font-semibold text-gray-800">{p.produit}</p><p className="text-xs text-gray-400">par {p.unite}</p></div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{p.prix} FCFA</p>
                      {p.tendance!==null && <p className={`text-xs font-medium ${p.tendance>=0?"text-green-600":"text-red-500"}`}>{p.tendance>=0?"↑":"↓"} {Math.abs(p.tendance)}%</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {onglet==="offres" && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-1">Publier une offre d'achat</h2>
            <p className="text-xs text-gray-400 mb-4">Les agriculteurs verront votre offre et vous contacteront</p>

            <div className="bg-white rounded-xl border p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Produit recherché</label>
                  <select value={newOffre.produit} onChange={e=>setNewOffre({...newOffre, produit:e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {PRODUITS.map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Région cible</label>
                  <select value={newOffre.region} onChange={e=>setNewOffre({...newOffre, region:e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {REGIONS.map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Quantité (kg)</label>
                  <input type="number" placeholder="ex: 500" value={newOffre.quantite_kg}
                    onChange={e=>setNewOffre({...newOffre, quantite_kg:e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Prix proposé (FCFA/kg)</label>
                  <input type="number" placeholder="ex: 400" value={newOffre.prix_propose}
                    onChange={e=>setNewOffre({...newOffre, prix_propose:e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>

              {/* Contacts — obligatoires */}
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-blue-700 mb-2">📞 Vos contacts (les agriculteurs vous appelleront)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">WhatsApp *</label>
                    <input type="tel" placeholder="ex: 221771234567" value={newOffre.acheteur_wa}
                      onChange={e=>setNewOffre({...newOffre, acheteur_wa:e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"/>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Téléphone</label>
                    <input type="tel" placeholder="ex: +221771234567" value={newOffre.acheteur_tel}
                      onChange={e=>setNewOffre({...newOffre, acheteur_tel:e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"/>
                  </div>
                </div>
              </div>

              <input placeholder="Description (optionnel) — ex: tomates fraîches, livraison possible" value={newOffre.description}
                onChange={e=>setNewOffre({...newOffre, description:e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>

              <button onClick={publierOffre} disabled={saving}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition disabled:opacity-50">
                {saving ? "Publication..." : "📢 Publier l'offre"}
              </button>
            </div>

            <h3 className="font-medium text-gray-600 mb-3">Mes offres actives</h3>
            {offres.filter(o=>o.acheteur_nom===user.nom).length===0 ? (
              <div className="text-center py-8 bg-white rounded-xl border"><p className="text-4xl mb-3">📢</p><p className="text-gray-500 text-sm">Aucune offre publiée</p></div>
            ) : (
              <div className="space-y-3">
                {offres.filter(o=>o.acheteur_nom===user.nom).map((o,i)=>(
                  <div key={i} className="bg-white rounded-xl border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{o.produit}</span>
                      <button onClick={()=>fermerOffre(o.id)} className="text-xs text-red-500 hover:text-red-700">Fermer ✕</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mb-2">
                      <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Quantité</p><p className="font-semibold text-sm">{o.quantite_kg} kg</p></div>
                      <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Prix offert</p><p className="font-semibold text-sm">{o.prix_propose} FCFA</p></div>
                      <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-400">Région</p><p className="font-semibold text-sm">{o.region}</p></div>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-400">
                      {o.acheteur_wa && <span>💬 {o.acheteur_wa}</span>}
                      {o.acheteur_tel && <span>📞 {o.acheteur_tel}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {onglet==="negocier" && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-1">Aide à la négociation IA</h2>
            <p className="text-xs text-gray-400 mb-4">Connaissez le prix futur avant de négocier</p>
            <div className="bg-white rounded-xl border p-4 mb-4">
              <div className="flex gap-3">
                <select value={mlProduit} onChange={e=>setMlProduit(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {PRODUITS.map(p=><option key={p}>{p}</option>)}
                </select>
                <button onClick={lancerPrediction} disabled={mlLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition disabled:opacity-50">
                  {mlLoading ? "⏳..." : "🤖 Analyser"}
                </button>
              </div>
            </div>
            {mlData && (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-xl border p-3 text-center"><p className="text-xs text-gray-400 mb-1">Prix actuel</p><p className="text-lg font-bold text-gray-800">{mlData.prix_actuel}</p><p className="text-xs text-gray-400">FCFA/kg</p></div>
                  <div className="bg-white rounded-xl border p-3 text-center"><p className="text-xs text-gray-400 mb-1">Dans 30 jours</p><p className={`text-lg font-bold ${mlData.variation_pct>=0?"text-red-500":"text-green-600"}`}>{mlData.prix_predit_j30}</p><p className="text-xs text-gray-400">FCFA/kg</p></div>
                  <div className="bg-white rounded-xl border p-3 text-center"><p className="text-xs text-gray-400 mb-1">Variation</p><p className={`text-lg font-bold ${mlData.variation_pct>=0?"text-red-500":"text-green-600"}`}>{mlData.variation_pct>=0?"+":""}{mlData.variation_pct}%</p><p className="text-xs text-gray-400">{mlData.tendance}</p></div>
                </div>
                <div className={`rounded-xl p-4 ${mlData.variation_pct>=2?"bg-red-50 border border-red-200":"bg-green-50 border border-green-200"}`}>
                  <p className={`text-sm font-semibold mb-1 ${mlData.variation_pct>=2?"text-red-700":"text-green-700"}`}>💡 Conseil négociation</p>
                  <p className={`text-sm ${mlData.variation_pct>=2?"text-red-600":"text-green-600"}`}>
                    {mlData.variation_pct >= 2
                      ? `⚠️ Prix en hausse. Achetez maintenant à ${mlData.prix_actuel} FCFA avant que ça monte !`
                      : `✅ Prix en baisse. Attendez — vous économiserez ~${Math.abs(mlData.prix_actuel - mlData.prix_predit_j30)} FCFA/kg.`}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {onglet==="meteo" && meteo && (
          <div>
            <div style={{background:"linear-gradient(135deg,#185FA5,#0f4a8a)"}} className="rounded-2xl text-white p-6 mb-4 text-center shadow">
              <p className="text-sm opacity-80 mb-1">📍 {meteo.ville}</p>
              <p className="text-6xl font-bold">{meteo.temperature}°C</p>
              <p className="text-lg mt-1">{meteo.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[["💧","Humidité",`${meteo.humidite}%`],["🌬","Vent",`${meteo.vent_kmh} km/h`],["🌧","Pluie",`${meteo.pluie_prob}%`]].map(([icon,label,val])=>(
                <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm border"><p className="text-2xl">{icon}</p><p className="font-bold text-gray-800 text-sm">{val}</p><p className="text-xs text-gray-400">{label}</p></div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
