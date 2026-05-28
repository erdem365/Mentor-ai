
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Target, TrendingUp, Briefcase, Search, Award, 
  Cpu, Zap, MessageSquare, BarChart3, ChevronRight, 
  ShieldCheck, User, Flame, Smile, Play, Volume2,
  AlertTriangle, DollarSign, Share2, Layout, Copy, Eye, ExternalLink,
  Settings, Home, Lock, CheckCircle2, MoreHorizontal, Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  analyzeCV, compareWithJob, speakInterviewQuestion, 
  getSalaryAdvice, generateLinkedInPost, generatePortfolioCode 
} from './geminiService';
import { CVAnalysisResult, JobComparisonResult, UserState, SkillPoint, SalaryAdvice, UserProfile } from './types';

// Constants
const ACCENT_NEON_GREEN = "#00FFA3";
const ACCENT_ELECTRIC_PURPLE = "#BF40BF";
const BG_DARK = "#0E1117";

const LOADING_MESSAGES = [
  "Yapay zeka CV'ni okuyor...",
  "GitHub profiline gizlice bakılıyor...",
  "Rakip analizi yapılıyor...",
  "Strateji kartları karıştırılıyor...",
  "Mülakat soruları bileniyor..."
];

const RadarChart = ({ data }: { data: SkillPoint[] }) => {
  const size = 260;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / data.length;
  const getPoint = (val: number, i: number) => {
    const r = (val / 100) * radius;
    const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
    const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
    return `${x},${y}`;
  };
  const currentPoints = data.map((d, i) => getPoint(d.current, i)).join(' ');
  const targetPoints = data.map((d, i) => getPoint(d.target, i)).join(' ');
  return (
    <div className="flex flex-col items-center bg-slate-900/50 p-4 rounded-3xl border border-slate-800 backdrop-blur-sm">
      <svg width={size} height={size} className="overflow-visible">
        {[20, 40, 60, 80, 100].map(r => (
          <circle key={r} cx={center} cy={center} r={(r / 100) * radius} fill="none" stroke="#334155" strokeWidth="1" />
        ))}
        {data.map((d, i) => {
          const p = getPoint(100, i);
          const [px, py] = p.split(',');
          return (
            <g key={i}>
              <line x1={center} y1={center} x2={px} y2={py} stroke="#334155" strokeWidth="1" />
              <text x={px} y={Number(py) - 10} textAnchor="middle" fontSize="10" className="fill-slate-400 font-bold tracking-tighter uppercase">{d.subject}</text>
            </g>
          );
        })}
        <polygon points={targetPoints} fill="rgba(239, 68, 68, 0.05)" stroke="#ef4444" strokeWidth="1" strokeDasharray="3" />
        <polygon points={currentPoints} fill="rgba(0, 255, 163, 0.2)" stroke={ACCENT_NEON_GREEN} strokeWidth="2.5" />
      </svg>
      <div className="flex gap-4 mt-6 text-[10px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#00FFA3] rounded-sm"></div> Mevcut</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 border border-red-500 border-dashed rounded-sm"></div> Hedef</div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [userState, setUserState] = useState<UserState>({
    xp: 450, 
    level: 4, 
    badges: ['CV SİHİRBAZI', 'HIZLI BAŞLANGIÇ'], 
    mode: 'mentor',
    profile: {
      name: "Ahmet Yılmaz",
      title: "Full-Stack Geliştirici",
      email: "ahmet@mimari.ai",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmet"
    }
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'roast' | 'detective' | 'salary' | 'portfolio' | 'social' | 'interview' | 'settings'>('dashboard');
  const [cvText, setCvText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  
  const [analysis, setAnalysis] = useState<CVAnalysisResult | null>(null);
  const [jobResult, setJobResult] = useState<JobComparisonResult | null>(null);
  const [salaryResult, setSalaryResult] = useState<SalaryAdvice | null>(null);
  const [linkedinPost, setLinkedinPost] = useState('');
  const [portfolioCode, setPortfolioCode] = useState('');
  const [showPortfolioPreview, setShowPortfolioPreview] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [ACCENT_NEON_GREEN, ACCENT_ELECTRIC_PURPLE, '#FFFFFF']
    });
  };

  const handleStartAnalysis = async () => {
    if (!cvText) return;
    setLoading(true);
    try {
      const res = await analyzeCV(cvText);
      setAnalysis(res);
      setUserState(prev => ({ ...prev, xp: prev.xp + 50 }));
      triggerConfetti();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleJobCompare = async () => {
    if (!cvText || !jobDesc) return;
    setLoading(true);
    try {
      const res = await compareWithJob(cvText, jobDesc);
      setJobResult(res);
      setUserState(prev => ({ ...prev, xp: prev.xp + 40 }));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSalaryAdvice = async () => {
    setLoading(true);
    try {
      const res = await getSalaryAdvice("Yazılım Geliştirici", "İstanbul");
      setSalaryResult(res);
      setUserState(prev => ({ ...prev, xp: prev.xp + 20 }));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleLinkedInGhostwriter = async () => {
    if (!cvText) return;
    setLoading(true);
    try {
      const res = await generateLinkedInPost(cvText);
      setLinkedinPost(res);
      setUserState(prev => ({ ...prev, xp: prev.xp + 15 }));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handlePortfolioGen = async () => {
    if (!cvText) return;
    setLoading(true);
    try {
      const res = await generatePortfolioCode(cvText);
      setPortfolioCode(res);
      setShowPortfolioPreview(true);
      setUserState(prev => ({ ...prev, xp: prev.xp + 100 }));
      triggerConfetti();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleInterview = async () => {
    setLoading(true);
    setPlayingAudio(true);
    try {
      const base64 = await speakInterviewQuestion(userState.mode);
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audio.onended = () => setPlayingAudio(false);
      audio.play();
    } catch (e) { console.error(e); setPlayingAudio(false); } finally { setLoading(false); }
  };

  const isRoast = userState.mode === 'roast';

  return (
    <div className={`flex min-h-screen ${isRoast ? 'bg-[#0E1117]' : 'bg-slate-50'} text-slate-100`}>
      
      {/* Block 1: Left Sidebar */}
      <aside className="w-72 bg-[#12161E] border-r border-slate-800 flex flex-col h-screen sticky top-0 z-50">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 rounded-xl ${isRoast ? 'bg-rose-600 shadow-[0_0_15px_#e11d48]' : 'bg-indigo-600 shadow-[0_0_15px_#4f46e5]'}`}>
              <Cpu className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">MİMARİ.AI</span>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 mb-8">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-600 relative group cursor-pointer">
              <img src={userState.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="font-black text-sm text-white leading-none mb-1">{userState.profile.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Lv. {userState.level} Çırak</p>
              <div className="w-20 h-1.5 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-[#00FFA3]" style={{ width: `${userState.xp % 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Kokpit', icon: Home },
            { id: 'roast', label: 'CV Analiz', icon: FileText },
            { id: 'detective', label: 'Şirket Dedektifi', icon: Search },
            { id: 'interview', label: 'Mülakat Sim.', icon: Volume2 },
            { id: 'salary', label: 'Maaş Koçu', icon: DollarSign },
            { id: 'portfolio', label: 'Portfolyo Kur', icon: Layout },
            { id: 'social', label: 'Ghostwriter', icon: Share2 },
            { id: 'settings', label: 'Profil Ayarları', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${
                activeTab === item.id 
                  ? 'bg-slate-800 text-white border-l-4 border-[#00FFA3]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#00FFA3]' : ''}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-800">
          <div 
            onClick={() => setUserState(p => ({...p, mode: p.mode === 'mentor' ? 'roast' : 'mentor'}))}
            className={`cursor-pointer p-4 rounded-2xl flex items-center justify-between transition-all ${
              isRoast ? 'bg-rose-950/20 border border-rose-900/40' : 'bg-emerald-950/20 border border-emerald-900/40'
            }`}
          >
            <div className="flex items-center gap-3">
              {isRoast ? <Flame className="w-5 h-5 text-rose-500" /> : <Smile className="w-5 h-5 text-emerald-500" />}
              <span className={`text-xs font-black uppercase tracking-widest ${isRoast ? 'text-rose-500' : 'text-emerald-500'}`}>
                {isRoast ? 'Roast Modu' : 'Mentor Modu'}
              </span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-all ${isRoast ? 'bg-rose-600' : 'bg-emerald-600'}`}>
              <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${isRoast ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Block 2 & 3: Main Content + Right Panel Area */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto relative no-scrollbar">
        
        {/* Top Bar (Status & Gamification) */}
        <header className="sticky top-0 z-40 bg-[#0E1117]/80 backdrop-blur-xl border-b border-slate-800 px-10 py-5 flex items-center justify-between">
          <div className="flex gap-10">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bugün Kazanılan</p>
              <p className="text-xl font-black text-[#00FFA3]">+45 XP 🔥</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Hedef Şirket Uyumu</p>
              <p className="text-xl font-black text-white">{jobResult ? `%${jobResult.matchRate}` : '--'} 📈</p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="bg-indigo-600/10 border border-indigo-500/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-black text-indigo-400">#1 YÜKSELEN</span>
             </div>
          </div>
        </header>

        {loading && (
          <div className="absolute inset-0 z-[100] bg-[#0E1117]/95 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-24 h-24 border-8 border-slate-800 border-t-[#00FFA3] rounded-full animate-spin mb-8"></div>
            <p className="text-2xl font-black tracking-tighter text-white animate-pulse">{LOADING_MESSAGES[loadingMsgIdx]}</p>
          </div>
        )}

        <div className="p-10 max-w-6xl mx-auto">
          
          {/* Dashboard / Kokpit */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
               <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 bg-gradient-to-br from-indigo-600 to-purple-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                     <div className="relative z-10">
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Geleceğin Mimarı <br/> Olmaya Hazır Mısın?</h2>
                        <p className="text-white/70 max-w-sm mb-8 font-medium">CV'ni analiz ederek başla ve sana özel kariyer rotanı anında oluştur.</p>
                        <button onClick={() => setActiveTab('roast')} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">HEMEN BAŞLA</button>
                     </div>
                     <Zap className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] flex flex-col justify-between">
                     <div className="flex justify-between items-start">
                        <Award className="w-12 h-12 text-yellow-500" />
                        <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black px-3 py-1 rounded-full border border-yellow-500/20">PREMIUM</span>
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-400 mb-1">TOPLAM XP</p>
                        <p className="text-4xl font-black text-white">{userState.xp}</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-sm">
                    <h3 className="font-black text-xl mb-6 flex items-center gap-2"><TrendingUp className="text-[#00FFA3]" /> Aktif Görevler</h3>
                    <div className="space-y-4">
                      {[
                        { t: '1 CV Analizi Yap', x: 50, d: !!analysis },
                        { t: 'Maaş Beklentini Hesapla', x: 20, d: !!salaryResult },
                        { t: 'Mülakat Provası Yap', x: 30, d: false }
                      ].map((g, i) => (
                        <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${g.d ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/40 border-slate-700'}`}>
                          <div className="flex items-center gap-3">
                            {g.d ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-600" />}
                            <span className={`text-sm font-bold ${g.d ? 'text-emerald-100' : 'text-slate-400'}`}>{g.t}</span>
                          </div>
                          <span className="text-xs font-black text-[#00FFA3]">+{g.x} XP</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-sm">
                    <h3 className="font-black text-xl mb-6 flex items-center gap-2"><Award className="text-yellow-500" /> Rozetlerin</h3>
                    <div className="flex flex-wrap gap-3">
                      {userState.badges.map((b, i) => (
                        <div key={i} className="px-5 py-2.5 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 flex items-center gap-2 group cursor-default">
                           <Award className="w-4 h-4 text-yellow-500 group-hover:scale-125 transition-transform" />
                           <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">{b}</span>
                        </div>
                      ))}
                      <div className="px-5 py-2.5 bg-slate-800/40 rounded-2xl border border-slate-700 flex items-center gap-2 opacity-30">
                         <Lock className="w-4 h-4 text-slate-500" />
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">KİLİTLİ</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* CV Roast / Analiz */}
          {activeTab === 'roast' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
              <section className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 backdrop-blur-md">
                <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                  <FileText className={isRoast ? 'text-rose-500' : 'text-[#00FFA3]'} /> CV'ni {isRoast ? 'Parçala' : 'Analiz Et'}
                </h2>
                <textarea 
                  className="w-full h-56 bg-slate-800/50 border-2 border-slate-700 rounded-3xl p-6 text-lg font-medium outline-none focus:border-[#00FFA3] transition-all mb-6 placeholder:text-slate-600"
                  placeholder="CV metnini buraya yapıştır..."
                  value={cvText}
                  onChange={e => setCvText(e.target.value)}
                />
                <button onClick={handleStartAnalysis} disabled={loading} className={`w-full py-5 rounded-3xl font-black text-xl transition-all shadow-2xl ${
                  isRoast ? 'bg-rose-600 shadow-rose-900/20' : 'bg-emerald-600 shadow-emerald-900/20'
                } text-white`}>
                  ANALİZİ BAŞLAT 🔥
                </button>
              </section>

              {analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-5 space-y-10">
                    <RadarChart data={analysis.radarData} />
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 text-center relative overflow-hidden">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">ATS Skoru</p>
                       <p className="text-6xl font-black text-[#00FFA3]">{analysis.atsScore}</p>
                       <p className="text-sm font-bold text-slate-500 mt-2 tracking-tighter">100 ÜZERİNDEN</p>
                       <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-[#00FFA3]/5 rounded-full blur-2xl"></div>
                    </div>
                  </div>
                  <div className="lg:col-span-7 space-y-8">
                    <div className={`p-8 rounded-[2.5rem] border-l-8 ${isRoast ? 'bg-rose-950/20 border-rose-600 text-rose-100' : 'bg-emerald-950/20 border-emerald-600 text-emerald-100'} italic font-bold leading-relaxed`}>
                      <p className="text-xl mb-4">{isRoast ? '🔥 ROAST MODU AKTİF:' : '😇 MENTOR ÖĞÜDÜ:'}</p>
                      "{isRoast ? analysis.roast : analysis.mentorAdvice}"
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                       {analysis.actionCards.map((card, idx) => (
                         <div key={idx} className={`p-6 rounded-3xl border transition-all hover:scale-[1.02] flex gap-5 ${
                           card.type === 'fix' ? 'bg-red-950/20 border-red-500/30' : 
                           card.type === 'improve' ? 'bg-amber-950/20 border-amber-500/30' : 
                           'bg-emerald-950/20 border-emerald-500/30'
                         }`}>
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                             card.type === 'fix' ? 'bg-red-600' : 
                             card.type === 'improve' ? 'bg-amber-600' : 
                             'bg-emerald-600'
                           }`}>
                             {card.type === 'fix' ? <AlertTriangle className="text-white" /> : 
                              card.type === 'improve' ? <Zap className="text-white" /> : 
                              <ShieldCheck className="text-white" />}
                           </div>
                           <div>
                              <h4 className="font-black text-white text-lg mb-1 uppercase tracking-tighter">{card.title}</h4>
                              <p className="text-sm text-slate-400 font-medium leading-relaxed">{card.message}</p>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Şirket Dedektifi / Detective */}
          {activeTab === 'detective' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
              <section className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 backdrop-blur-md">
                 <h2 className="text-3xl font-black mb-8 flex items-center gap-3"><AlertTriangle className="text-orange-500" /> Şirket Dedektifi</h2>
                 <p className="text-slate-500 mb-8 font-medium">İş ilanındaki gizli "Red Flag"leri ve kültür sinyallerini yakalayalım.</p>
                 <textarea 
                  className="w-full h-44 bg-slate-800/50 border-2 border-slate-700 rounded-3xl p-6 text-lg font-medium outline-none focus:border-orange-500 transition-all mb-6"
                  placeholder="İş ilanı metnini buraya yapıştır..."
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                />
                <button onClick={handleJobCompare} disabled={loading || !cvText} className="w-full py-5 rounded-3xl font-black text-xl bg-orange-600 text-white shadow-xl hover:bg-orange-700 transition-all">
                  İLANIN RÖNTGENİNİ ÇEK 🕵️‍♂️
                </button>
              </section>

              {jobResult && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   <div className="lg:col-span-8 space-y-8">
                      <h3 className="text-2xl font-black">Tespit Edilen Kırmızı Bayraklar</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {jobResult.redFlags.map((flag, idx) => (
                           <div key={idx} className={`p-6 rounded-[2rem] border transition-all ${
                             flag.severity === 'high' ? 'bg-red-950/20 border-red-500/30' : 'bg-amber-950/20 border-amber-500/30'
                           }`}>
                             <div className="flex justify-between items-start mb-4">
                               <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                 flag.severity === 'high' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                               }`}>
                                 {flag.severity === 'high' ? 'KRİTİK UYARI' : 'DİKKAT'}
                               </div>
                               <AlertTriangle className={flag.severity === 'high' ? 'text-red-500' : 'text-amber-500'} />
                             </div>
                             <h4 className="font-black text-lg mb-2">{flag.title}</h4>
                             <p className="text-sm font-medium text-slate-400 leading-relaxed italic">"{flag.description}"</p>
                           </div>
                        ))}
                      </div>
                   </div>
                   <div className="lg:col-span-4 space-y-8">
                      <h3 className="text-2xl font-black">Kariyer Hattı (Metro)</h3>
                      <div className="relative pl-10 border-l-4 border-slate-800 space-y-12">
                         {jobResult.roadmap.map((step, idx) => (
                           <div key={idx} className="relative">
                              <div className={`absolute -left-[54px] w-8 h-8 rounded-full border-8 bg-slate-950 ${
                                idx === 0 ? 'border-[#00FFA3]' : 'border-slate-800'
                              }`}></div>
                              <h4 className={`font-black text-lg mb-1 ${idx === 0 ? 'text-[#00FFA3]' : 'text-white'}`}>{step.title}</h4>
                              <p className="text-xs font-medium text-slate-500">{step.description}</p>
                              {idx > 0 && <Lock className="absolute right-0 top-1 w-4 h-4 text-slate-700" />}
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Maaş / Salary */}
          {activeTab === 'salary' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
                <section className="bg-emerald-950/20 p-12 rounded-[3.5rem] border border-emerald-900/30 text-center relative overflow-hidden">
                   <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40">
                      <DollarSign className="w-12 h-12 text-white" />
                   </div>
                   <h2 className="text-4xl font-black mb-4">Pazarlık Gücünü Hesapla</h2>
                   <p className="text-emerald-400/70 max-w-sm mx-auto font-medium mb-10">Piyasa değerini bilmeden masaya oturma. AI ile en adil teklifi belirleyelim.</p>
                   <button onClick={handleSalaryAdvice} disabled={loading} className="px-12 py-5 bg-emerald-600 text-white rounded-3xl font-black text-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/30">
                     MAAŞ ARALIĞIMI GÖSTER 💰
                   </button>
                </section>

                {salaryResult && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="p-10 bg-slate-900 border border-slate-800 rounded-[2.5rem] relative">
                       <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Tahmini Net Aralığı</p>
                       <p className="text-5xl font-black text-[#00FFA3] mb-4">{salaryResult.range}</p>
                       <p className="text-sm text-slate-400 font-medium leading-relaxed">{salaryResult.marketContext}</p>
                    </div>
                    <div className="space-y-4">
                       <h3 className="font-black text-xl mb-4 uppercase tracking-tighter">İK Senaryoları</h3>
                       {salaryResult.scripts.map((s, i) => (
                         <div key={i} className="group p-6 bg-slate-800/40 border border-slate-700 rounded-3xl relative">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">{s.title}</p>
                            <p className="text-sm italic font-medium text-slate-300">"{s.text}"</p>
                            <button onClick={() => {navigator.clipboard.writeText(s.text); triggerConfetti();}} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all">
                               <Copy className="w-4 h-4 text-[#00FFA3]" />
                            </button>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
             </div>
          )}

          {/* Portfolyo / Portfolio */}
          {activeTab === 'portfolio' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
                <section className="bg-slate-900/50 p-12 rounded-[3.5rem] border border-slate-800 backdrop-blur-md text-center">
                   <Layout className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
                   <h2 className="text-4xl font-black mb-4">Tek Tıkla Portfolyo</h2>
                   <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium">CV'ndeki projeleri modern, responsive ve yayınlanmaya hazır bir web sitesine dönüştürelim.</p>
                   <button onClick={handlePortfolioGen} disabled={loading || !cvText} className="px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl">
                     SİTEMİ OLUŞTUR 🌐
                   </button>
                </section>

                {portfolioCode && (
                  <div className="bg-slate-900 p-8 rounded-[3.5rem] border border-slate-800">
                    <div className="flex justify-between items-center mb-8">
                       <div className="flex gap-4">
                          <button onClick={() => setShowPortfolioPreview(true)} className={`px-6 py-2.5 rounded-2xl font-black text-xs transition-all ${showPortfolioPreview ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>ÖNİZLEME</button>
                          <button onClick={() => setShowPortfolioPreview(false)} className={`px-6 py-2.5 rounded-2xl font-black text-xs transition-all ${!showPortfolioPreview ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>KODLAR</button>
                       </div>
                       <button onClick={() => navigator.clipboard.writeText(portfolioCode)} className="flex items-center gap-2 px-6 py-2.5 bg-[#00FFA3]/10 border border-[#00FFA3]/20 text-[#00FFA3] rounded-2xl font-black text-xs">
                         KODU KOPYALA <Copy className="w-4 h-4" />
                       </button>
                    </div>
                    {showPortfolioPreview ? (
                      <div className="h-[700px] border-8 border-slate-800 rounded-[2.5rem] overflow-hidden bg-white">
                         <iframe srcDoc={portfolioCode} className="w-full h-full border-none" title="Portfolio Preview" />
                      </div>
                    ) : (
                      <div className="h-[700px] bg-slate-950 p-8 rounded-[2.5rem] overflow-y-auto no-scrollbar border border-slate-800">
                         <pre className="text-xs font-mono text-indigo-400 leading-relaxed">{portfolioCode}</pre>
                      </div>
                    )}
                  </div>
                )}
             </div>
          )}

          {/* Ayarlar / Settings */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5">
               <h2 className="text-3xl font-black mb-8 flex items-center gap-3"><Settings className="text-slate-500" /> Profil Ayarları</h2>
               <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800 space-y-8">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-[#00FFA3] relative group">
                       <img src={userState.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Camera className="w-6 h-6 text-white" />
                       </div>
                    </div>
                    <div>
                      <h3 className="font-black text-xl mb-1">{userState.profile.name}</h3>
                      <p className="text-sm font-bold text-slate-500">Avatarını güncellemek için tıkla.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">TAM İSİM</label>
                      <input 
                        type="text" 
                        value={userState.profile.name} 
                        onChange={e => setUserState(p => ({...p, profile: {...p.profile, name: e.target.value}}))}
                        className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none focus:border-[#00FFA3] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">BAŞLIK / UNVAN</label>
                      <input 
                        type="text" 
                        value={userState.profile.title} 
                        onChange={e => setUserState(p => ({...p, profile: {...p.profile, title: e.target.value}}))}
                        className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none focus:border-[#00FFA3] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4">E-POSTA</label>
                      <input 
                        type="email" 
                        value={userState.profile.email} 
                        onChange={e => setUserState(p => ({...p, profile: {...p.profile, email: e.target.value}}))}
                        className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-2xl px-6 py-4 font-bold outline-none focus:border-[#00FFA3] transition-all"
                      />
                    </div>
                  </div>

                  <button onClick={() => {triggerConfetti(); alert("Profil güncellendi!");}} className="w-full py-5 bg-[#00FFA3] text-black font-black text-lg rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-emerald-500/20">
                    DEĞİŞİKLİKLERİ KAYDET
                  </button>
               </div>
            </div>
          )}

          {/* LinkedIn Ghostwriter */}
          {activeTab === 'social' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
                <section className="bg-sky-950/20 p-12 rounded-[3.5rem] border border-sky-900/30 text-center">
                   <div className="w-20 h-20 bg-sky-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                      <Share2 className="w-10 h-10 text-white" />
                   </div>
                   <h2 className="text-4xl font-black mb-4">LinkedIn Ghostwriter</h2>
                   <p className="text-sky-400/70 max-w-md mx-auto mb-10 font-medium">Başarılarını, projelerini ve sertifikalarını viral olacak LinkedIn postlarına dönüştürelim.</p>
                   <button onClick={handleLinkedInGhostwriter} disabled={loading || !cvText} className="px-12 py-5 bg-sky-600 text-white rounded-3xl font-black text-xl hover:bg-sky-700 transition-all shadow-2xl">
                     POST TASLAĞI ÜRET ✍️
                   </button>
                </section>

                {linkedinPost && (
                  <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-slate-800 relative group animate-in zoom-in duration-300">
                     <p className="text-sm font-black text-sky-500 uppercase tracking-widest mb-4">Taslak Hazır!</p>
                     <div className="text-lg font-medium text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                        {linkedinPost}
                     </div>
                     <button onClick={() => {navigator.clipboard.writeText(linkedinPost); triggerConfetti();}} className="absolute top-10 right-10 p-3 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                        <Copy className="w-5 h-5 text-white" />
                     </button>
                     <div className="mt-8 flex justify-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tavsiye: Kopyala ve LinkedIn'de Paylaş!</span>
                     </div>
                  </div>
                )}
             </div>
          )}

          {/* Sesli Mülakat / Interview */}
          {activeTab === 'interview' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5">
              <section className="bg-slate-900/50 p-16 rounded-[4rem] border border-slate-800 text-center relative overflow-hidden backdrop-blur-md">
                 <div className="absolute top-0 left-0 w-64 h-64 bg-rose-600/5 rounded-full blur-[100px] animate-blob"></div>
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>

                 <div className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center mb-10 border-8 transition-all duration-700 relative z-10 ${
                   playingAudio ? 'border-rose-500 shadow-[0_0_60px_rgba(239,68,68,0.2)]' : 'border-slate-800'
                 }`}>
                   {playingAudio ? <Volume2 className="w-16 h-16 text-rose-500" /> : <Play className="w-16 h-16 text-slate-700" />}
                 </div>
                 <h2 className="text-4xl font-black mb-6 relative z-10">Sesli Mülakat Provası</h2>
                 <p className="text-slate-400 mb-12 max-w-sm mx-auto font-bold text-lg leading-relaxed relative z-10">
                   {isRoast 
                    ? "Dikkat! Gemini senin en zayıf noktanı bulup oradan saldıracak. Hazır mısın?" 
                    : "Profesyonel bir mülakat deneyimi için koltuğuna yaslan ve soruyu bekle."}
                 </p>
                 <button onClick={handleInterview} disabled={loading || playingAudio} className={`px-20 py-6 rounded-3xl font-black text-2xl text-white transition-all shadow-2xl relative z-10 ${
                   isRoast ? 'bg-rose-600 shadow-rose-900/40' : 'bg-indigo-600 shadow-indigo-900/40'
                 }`}>
                   {loading ? 'HAZIRLANIYOR...' : 'PROVAYI BAŞLAT 🎙️'}
                 </button>
              </section>
            </div>
          )}

        </div>

        {/* Global Floating Decor */}
        <div className="fixed top-20 right-20 w-96 h-96 bg-[#00FFA3]/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-blob"></div>
        <div className="fixed bottom-20 left-20 w-96 h-96 bg-[#BF40BF]/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-blob animation-delay-4000"></div>
      </main>

    </div>
  );
};

export default App;
