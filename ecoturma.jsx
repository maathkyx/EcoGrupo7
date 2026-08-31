import { useState, useEffect, useMemo } from 'react';
import { Zap, Droplet, Recycle, Bus, ShoppingBag, Loader2, Sprout, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'energia', label: 'Energia', points: 10, color: '#E3B23C', Icon: Zap },
  { id: 'agua', label: 'Água', points: 10, color: '#4A7C8C', Icon: Droplet },
  { id: 'residuos', label: 'Resíduos', points: 15, color: '#3F7A52', Icon: Recycle },
  { id: 'transporte', label: 'Transporte', points: 20, color: '#A15C34', Icon: Bus },
  { id: 'consumo', label: 'Consumo consciente', points: 10, color: '#7A5C3F', Icon: ShoppingBag },
];

const ACTIONS_KEY = 'ecoturma:actions';
const USER_KEY = 'ecoturma:current-user';

function catInfo(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

export default function EcoTurma() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actions, setActions] = useState([]);
  const [name, setName] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        try {
          const u = await window.storage.get(USER_KEY, false);
          if (u?.value) setName(u.value);
        } catch {}
        try {
          const a = await window.storage.get(ACTIONS_KEY, true);
          if (a?.value) setActions(JSON.parse(a.value));
        } catch {}
      } catch (e) {
        setError('Não foi possível carregar os dados salvos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveName(e) {
    e.preventDefault();
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    setName(trimmed);
    setNameDraft('');
    try {
      await window.storage.set(USER_KEY, trimmed, false);
    } catch {}
  }

  async function logAction(e) {
    e.preventDefault();
    if (!name || !description.trim()) return;
    setSubmitting(true);
    const cat = catInfo(category);
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      category: cat.id,
      points: cat.points,
      description: description.trim(),
      date: new Date().toISOString(),
    };
    const updated = [entry, ...actions];
    setActions(updated);
    setDescription('');
    try {
      await window.storage.set(ACTIONS_KEY, JSON.stringify(updated), true);
    } catch {
      setError('A ação foi registrada aqui, mas não foi possível salvar para o grupo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function resetAll() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setActions([]);
    setConfirmReset(false);
    try {
      await window.storage.set(ACTIONS_KEY, JSON.stringify([]), true);
    } catch {}
  }

  const totalPoints = useMemo(() => actions.reduce((s, a) => s + a.points, 0), [actions]);
  const participants = useMemo(() => new Set(actions.map((a) => a.name)).size, [actions]);

  const byCategory = useMemo(() => {
    const map = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
    actions.forEach((a) => { map[a.category] = (map[a.category] || 0) + a.points; });
    const max = Math.max(1, ...Object.values(map));
    return CATEGORIES.map((c) => ({ ...c, value: map[c.id], pct: Math.round((map[c.id] / max) * 100) }));
  }, [actions]);

  const leaderboard = useMemo(() => {
    const map = {};
    actions.forEach((a) => { map[a.name] = (map[a.name] || 0) + a.points; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [actions]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#EFF1E9', color: '#15291F', minHeight: '100%' }} className="w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
        .eco-display { font-family: 'Fraunces', serif; }
        .eco-input {
          width: 100%; padding: 10px 12px; border: 1px solid #C7CDBB; border-radius: 6px;
          background: #FBFAF5; color: #15291F; font-family: 'Inter', sans-serif; font-size: 14px;
        }
        .eco-input:focus { outline: none; border-color: #3F7A52; box-shadow: 0 0 0 3px rgba(63,122,82,0.15); }
        .eco-btn {
          background: #15291F; color: #EFF1E9; border: none; border-radius: 6px;
          padding: 10px 16px; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px;
          cursor: pointer; transition: background 0.15s ease;
        }
        .eco-btn:hover:not(:disabled) { background: #3F7A52; }
        .eco-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .eco-cat-btn {
          display: flex; align-items: center; gap: 6px; padding: 7px 10px; border-radius: 6px;
          border: 1.5px solid transparent; font-size: 13px; font-weight: 500; cursor: pointer;
          background: #FBFAF5; color: #15291F; transition: border-color 0.15s ease;
        }
        .eco-feed-item { border-left: 3px solid; padding: 10px 14px; background: #FBFAF5; border-radius: 0 6px 6px 0; }
        .eco-bar-track { background: #E2E4D6; border-radius: 4px; height: 8px; overflow: hidden; }
        .eco-bar-fill { height: 100%; border-radius: 4px; }
      `}</style>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sprout size={22} color="#3F7A52" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#3F7A52', letterSpacing: '0.02em' }}>Projeto de sustentabilidade</span>
          </div>
          <h1 className="eco-display" style={{ fontSize: 34, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>EcoTurma</h1>
          <p style={{ marginTop: 8, color: '#4A5548', fontSize: 14.5, maxWidth: 560, lineHeight: 1.5 }}>
            Registro coletivo de ações sustentáveis do grupo. Cada pessoa anota o que fez, e o sistema soma o impacto de todo mundo.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#4A5548', padding: '40px 0' }}>
            <Loader2 size={18} className="animate-spin" />
            <span>Carregando dados do grupo…</span>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ background: '#F6E9DD', border: '1px solid #A15C34', color: '#5A3417', padding: '10px 14px', borderRadius: 6, fontSize: 13.5, marginBottom: 20 }}>
                {error}
              </div>
            )}

            {/* Hero stats */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', padding: '20px 0 28px', borderBottom: '1px solid #D7DBC8', marginBottom: 28 }}>
              <div>
                <div className="eco-display" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{totalPoints}</div>
                <div style={{ fontSize: 13, color: '#4A5548', marginTop: 4 }}>pontos acumulados</div>
              </div>
              <div>
                <div className="eco-display" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{actions.length}</div>
                <div style={{ fontSize: 13, color: '#4A5548', marginTop: 4 }}>ações registradas</div>
              </div>
              <div>
                <div className="eco-display" style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>{participants}</div>
                <div style={{ fontSize: 13, color: '#4A5548', marginTop: 4 }}>participantes ativos</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left: register */}
              <div style={{ gridColumn: 'span 1' }}>
                {!name ? (
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Quem é você?</h2>
                    <form onSubmit={saveName} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input className="eco-input" placeholder="Seu nome" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
                      <button className="eco-btn" type="submit">Entrar</button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 13, color: '#4A5548', marginBottom: 12 }}>
                      Registrando como <strong style={{ color: '#15291F' }}>{name}</strong>{' '}
                      <button onClick={() => setName('')} style={{ background: 'none', border: 'none', color: '#3F7A52', fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>trocar</button>
                    </div>
                    <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Registrar uma ação</h2>
                    <form onSubmit={logAction} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {CATEGORIES.map((c) => (
                          <button
                            type="button"
                            key={c.id}
                            className="eco-cat-btn"
                            onClick={() => setCategory(c.id)}
                            style={{ borderColor: category === c.id ? c.color : 'transparent', color: category === c.id ? c.color : '#15291F' }}
                          >
                            <c.Icon size={14} /> {c.label}
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="eco-input"
                        placeholder="O que você fez? Ex: fui de bicicleta para a escola"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ resize: 'vertical' }}
                      />
                      <button className="eco-btn" type="submit" disabled={submitting || !description.trim()}>
                        {submitting ? 'Salvando…' : `Registrar (+${catInfo(category).points} pts)`}
                      </button>
                    </form>
                  </div>
                )}

                <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #D7DBC8' }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Impacto por categoria</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {byCategory.map((c) => (
                      <div key={c.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><c.Icon size={13} color={c.color} /> {c.label}</span>
                          <span style={{ color: '#4A5548' }}>{c.value} pts</span>
                        </div>
                        <div className="eco-bar-track">
                          <div className="eco-bar-fill" style={{ width: `${c.pct}%`, background: c.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: feed + leaderboard */}
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Atividade do grupo</h2>
                  {actions.length === 0 ? (
                    <div style={{ color: '#4A5548', fontSize: 13.5, padding: '16px 0' }}>
                      Nenhuma ação registrada ainda. Seja a primeira pessoa do grupo a contar o que fez.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                      {actions.map((a) => {
                        const c = catInfo(a.category);
                        return (
                          <div key={a.id} className="eco-feed-item" style={{ borderLeftColor: c.color }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{a.name}</span>
                              <span style={{ fontSize: 12, color: '#4A5548', whiteSpace: 'nowrap' }}>
                                {new Date(a.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                              </span>
                            </div>
                            <div style={{ fontSize: 13.5, color: '#2E3B2F', marginTop: 2 }}>{a.description}</div>
                            <div style={{ fontSize: 11.5, color: c.color, marginTop: 4, fontWeight: 600 }}>{c.label} · +{a.points} pts</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Ranking do grupo</h2>
                  {leaderboard.length === 0 ? (
                    <div style={{ color: '#4A5548', fontSize: 13.5 }}>O ranking aparece assim que houver ações registradas.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {leaderboard.map(([person, pts], i) => (
                        <div key={person} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 4px' }}>
                          <span className="eco-display" style={{ width: 22, fontSize: 15, color: i === 0 ? '#E3B23C' : '#4A5548' }}>{i + 1}º</span>
                          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{person}</span>
                          <span style={{ fontSize: 13.5, color: '#4A5548' }}>{pts} pts</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 44, paddingTop: 16, borderTop: '1px solid #D7DBC8', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={resetAll}
                style={{ background: 'none', border: 'none', color: confirmReset ? '#A15C34' : '#9AA290', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Trash2 size={12} /> {confirmReset ? 'Clique de novo para confirmar — apaga os dados de todo o grupo' : 'Reiniciar dados do grupo'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
