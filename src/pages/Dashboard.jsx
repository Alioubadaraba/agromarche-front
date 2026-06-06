import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import ConseilsIA from './ConseilsIA';
import ConseilsIA from './ConseilsIA';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const REGIONS = ["dakar","thies","kaolack","ziguinchor","saint-louis"];
const PRODUITS = ["Tomates","Oignons","Mil","Maïs","Arachides","Riz local","Mangues","Niébé","Manioc","Aubergines","Choux","Pastèques"];

export default function Dashboard() {
  const [onglet, setOnglet]       = useState("meteo");
  const [region, setRegion]       = useState("dakar");
  const [prix, setPrix]           = useState([]);
  const [meteo, setMeteo]         = useState(null);
  const [acheteurs, setAcheteurs] = useState([]);
  const [conseils, setConseils]   = useState([]);
  const [offres, setOffres]       = useState([]);
  const [mlProduit, setMlProduit] = useState("Tomates");
  const [mlData, setMlData]       = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlErreur, setMlErreur]   = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => { chargerMeteo(); chargerConseils(); chargerPrix(); chargerAcheteurs(); chargerOffres(); }, [region]);

  const chargerPrix      = async () => { try { const {data} = await api.get(`/prix/${region}`); setPrix(data); } catch { setPrix([]); }};
  const chargerMeteo     = async () => { try { const {data} = await api.get(`/meteo/${region}`); setMeteo(data); } catch { setMeteo(null); }};
  const chargerAcheteurs = async () => { try { const {data} = await api.get(`/acheteurs/?region=${region}`); setAcheteurs(data); } catch { setAcheteurs([]); }};
  const chargerConseils  = async () => { try { const {data} = await api.get(`/conseils/`); setConseils(data.conseils||[]); } catch { setConseils([]); }};
  const chargerOffres    = async () => { try { const {data} = await api.get(`/offres/?region=${region}`); setOffres(data); } catch { setOffres([]); }};

  const lancerPrediction = async () => {
    setMlLoading(true); setMlErreur(""); setMlData(null);
    try {
      await api.post(`/ml/train?produit=${mlProduit}&region=${region}`);
      const {data} = await api.get(`/ml/predict?produit=${mlProduit}&region=${region}`);
      setMlData(data);
    } catch { setMlErreur("Erreur lors de la prédiction."); }
    setMlLoading(false);
  };

  const deconnexion = () => { localStorage.clear(); navigate("/"); };

  const BADGE = { Saison:"bg-yellow-100 text-yellow-800", Sol:"bg-green-100 text-green-800", Santé:"bg-red-100 text-red-800", Eau:"bg-blue-100 text-blue-800", Récolte:"bg-orange-100 text-orange-800", Maraîchage:"bg-teal-100 text-teal-800" };

  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{background:"linear-gradient(90deg,#1D6A3A,#2d8a50)"}} className="text-white px-4 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <div><h1 className="font-bold text-lg leading-none">AgroMarché</h1><p className="text-xs text-green-200">Bonjour, {user.nom || "Agriculteur"} 👋</p></div>
        </div>
        <div className="flex items-center gap-3">
          <select value={region} onChange={e=>setRegion(e.target.value)} className="text-sm bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 focus:outline-none">
            {REGIONS.map(r=><option key={r} value={r} className="text-black">{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
          </select>
          <button onClick={deconnexion} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg">Quitter</button>
        </div>
      </header>

      {meteo && (
        <div style={{background:"linear-gradient(90deg,#D97706,#C2681A)"}} className="text-white px-4 py-2 flex items-center gap-4 text-sm flex-wrap">
          <span>🌤 {meteo.temperature}°C — {meteo.description}</span>
          <span>💧 {meteo.humidite}%</span>
          <span>🌬 {meteo.vent_kmh} km/h</span>
          <span className="text-yellow-200 text-xs hidden md:block">💡 {meteo.conseil}</span>
        </div>
      )}

      <nav className="bg-white border-b flex overflow-x-auto">
        {[["prix","💰 Prix"],["offres","📢 Offres"],["acheteurs","🤝 Acheteurs"],["meteo","🌦 Météo"],["ml","🤖 IA Prix"],["conseils","💡 Conseils"]].map(([id,label])=>(
          <button key={id} onClick={()=>setOnglet(id)}
            className={`flex-shrink-0 px-3 py-3 text-sm font-medium border-b-2 transition ${onglet===id?"border-green-600 text-green-600":"border-transparent text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </nav>

      <main className="max-w-2xl mx-auto p-4">

        {onglet==="prix" && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-3">Prix du marché — {region.charAt(0).toUpperCase()+region.slice(1)}</h2>
            {prix.length===0 ? (
              <div className="text-center py-12 bg-white rounded-xl border"><p className="text-4xl mb-3">📊</p><p className="text-gray-500 font-medium">Aucun prix disponible</p></div>
            ) : (
              <div className="space-y-3">
                {prix.map((p,i)=>(
                  <div key={i} className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-xl">🌿</div>
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
            <h2 className="font-semibold text-gray-700 mb-1">Offres d'achat disponibles</h2>
            <p className="text-xs text-gray-400 mb-4">Des acheteurs cherchent vos produits — contactez-les directement</p>
            {offres.length===0 ? (
              <div className="text-center py-12 bg-white rounded-xl border"><p className="text-4xl mb-3">📢</p><p className="text-gray-500 font-medium">Aucune offre disponible</p><p className="text-gray-400 text-sm mt-1">Les acheteurs n'ont pas encore publié d'offres pour cette région</p></div>
            ) : (
              <div className="space-y-3">
                {offres.map((o,i)=>(
                  <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">{o.acheteur_nom.charAt(0)}</div>
                        <div><p className="font-semibold text-gray-800">{o.acheteur_nom}</p><p className="text-xs text-gray-400">Acheteur — {o.region}</p></div>
                      </div>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Active</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-green-50 rounded-lg p-2"><p className="text-xs text-gray-400">Produit</p><p className="font-semibold text-sm text-green-700">{o.produit}</p></div>
                      <div className="bg-green-50 rounded-lg p-2"><p className="text-xs text-gray-400">Quantité</p><p className="font-semibold text-sm text-green-700">{o.quantite_kg} kg</p></div>
                      <div className="bg-green-50 rounded-lg p-2"><p className="text-xs text-gray-400">Prix offert</p><p className="font-semibold text-sm text-green-700">{o.prix_propose} FCFA</p></div>
                    </div>
                    {o.description && <p className="text-xs text-gray-500 mb-3 italic">"{o.description}"</p>}
                    <div className="flex gap-2">
                      {o.acheteur_wa && <a href={`https://wa.me/${o.acheteur_wa}?text=Bonjour, j'ai vu votre offre pour ${o.produit} sur AgroMarché. Je suis intéressé !`} target="_blank" rel="noreferrer" className="flex-1 text-center text-xs bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition">💬 WhatsApp</a>}
                      {o.acheteur_tel && <a href={`tel:${o.acheteur_tel}`} className="flex-1 text-center text-xs bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg transition">📞 Appeler</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {onglet==="acheteurs" && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-3">Acheteurs disponibles</h2>
            {acheteurs.length===0 ? (
              <div className="text-center py-12 bg-white rounded-xl border"><p className="text-4xl mb-3">🤝</p><p className="text-gray-500">Aucun acheteur pour cette région</p></div>
            ) : (
              <div className="space-y-3">
                {acheteurs.map((a,i)=>(
                  <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">{a.nom.charAt(0)}</div>
                      <div><p className="font-semibold text-gray-800">{a.nom}</p><p className="text-xs text-gray-400">{a.type} — {a.region}</p></div>
                      {a.distance_km && <span className="ml-auto text-xs text-gray-400">📍 {a.distance_km} km</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">{a.produits.map((p,j)=><span key={j} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{p}</span>)}</div>
                    <div className="flex gap-2">
                      {a.whatsapp && <a href={`https://wa.me/${a.whatsapp}`} target="_blank" rel="noreferrer" className="flex-1 text-center text-xs bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition">💬 WhatsApp</a>}
                      {a.telephone && <a href={`tel:${a.telephone}`} className="flex-1 text-center text-xs bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg transition">📞 Appeler</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {onglet==="meteo" && (
          <div>
            {meteo ? (
              <>
                <div style={{background:"linear-gradient(135deg,#D97706,#1D6A3A)"}} className="rounded-2xl text-white p-6 mb-4 text-center shadow">
                  <p className="text-sm opacity-80 mb-1">📍 {meteo.ville}</p>
                  <p className="text-6xl font-bold">{meteo.temperature}°C</p>
                  <p className="text-lg mt-1">{meteo.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[["💧","Humidité",`${meteo.humidite}%`],["🌬","Vent",`${meteo.vent_kmh} km/h`],["🌧","Pluie",`${meteo.pluie_prob}%`]].map(([icon,label,val])=>(
                    <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm border"><p className="text-2xl">{icon}</p><p className="font-bold text-gray-800 text-sm">{val}</p><p className="text-xs text-gray-400">{label}</p></div>
                  ))}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">💡 Conseil du jour</p>
                  <p className="text-sm text-yellow-700">{meteo.conseil}</p>
                </div>
              </>
            ) : <div className="text-center py-12 bg-white rounded-xl border"><p className="text-4xl mb-3">🌦</p><p className="text-gray-500">Données météo indisponibles</p></div>}
          </div>
        )}

        {onglet==="ml" && (
          <div>
            <h2 className="font-semibold text-gray-700 mb-1">Prédiction IA des prix</h2>
            <p className="text-xs text-gray-400 mb-4">Basée sur 6 mois d'historique</p>
            <div className="bg-white rounded-xl border p-4 mb-4">
              <div className="flex gap-3 flex-wrap mb-4">
                <select value={mlProduit} onChange={e=>setMlProduit(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {PRODUITS.map(p=><option key={p}>{p}</option>)}
                </select>
                <button onClick={lancerPrediction} disabled={mlLoading} className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white text-sm rounded-lg font-medium transition disabled:opacity-50">
                  {mlLoading ? "⏳ Analyse..." : "🤖 Prédire"}
                </button>
              </div>
              {mlErreur && <p className="text-red-500 text-sm">{mlErreur}</p>}
            </div>
            {mlData && (
              <>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-xl border p-3 text-center"><p className="text-xs text-gray-400 mb-1">Prix actuel</p><p className="text-lg font-bold text-gray-800">{mlData.prix_actuel}</p><p className="text-xs text-gray-400">FCFA/kg</p></div>
                  <div className="bg-white rounded-xl border p-3 text-center"><p className="text-xs text-gray-400 mb-1">Dans 30 jours</p><p className={`text-lg font-bold ${mlData.variation_pct>=0?"text-green-600":"text-red-500"}`}>{mlData.prix_predit_j30}</p><p className="text-xs text-gray-400">FCFA/kg</p></div>
                  <div className="bg-white rounded-xl border p-3 text-center"><p className="text-xs text-gray-400 mb-1">Variation</p><p className={`text-lg font-bold ${mlData.variation_pct>=0?"text-green-600":"text-red-500"}`}>{mlData.variation_pct>=0?"+":""}{mlData.variation_pct}%</p><p className="text-xs text-gray-400">{mlData.tendance}</p></div>
                </div>
                <div className="bg-white rounded-xl border p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">📈 Évolution prédite sur 30 jours</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={mlData.predictions_30j}>
                      <XAxis dataKey="jour" tick={{fontSize:11}}/>
                      <YAxis tick={{fontSize:11}} domain={["auto","auto"]}/>
                      <Tooltip formatter={(v)=>`${v} FCFA`} labelFormatter={(l)=>`Jour ${l}`}/>
                      <ReferenceLine y={mlData.prix_actuel} stroke="#D97706" strokeDasharray="4 4"/>
                      <Line type="monotone" dataKey="prix_predit" stroke="#1D6A3A" strokeWidth={2} dot={false} name="Prix prédit"/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {mlData.meilleur_moment && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center"><p className="text-xs text-green-600 font-medium mb-1">✅ Meilleur moment</p><p className="text-lg font-bold text-green-700">Jour {mlData.meilleur_moment.jour}</p><p className="text-sm text-green-600">{mlData.meilleur_moment.prix_predit} FCFA</p></div>}
                  {mlData.pire_moment && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center"><p className="text-xs text-red-500 font-medium mb-1">⚠️ Pire moment</p><p className="text-lg font-bold text-red-600">Jour {mlData.pire_moment.jour}</p><p className="text-sm text-red-500">{mlData.pire_moment.prix_predit} FCFA</p></div>}
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">💡 Conseil IA</p>
                  <p className="text-sm text-yellow-700">{mlData.conseil}</p>
                </div>
              </>
            )}
          </div>
        )}

        {onglet==="conseils" && (
          <ConseilsIA region={region} />
        )}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
// Patch applied
