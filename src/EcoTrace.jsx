import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet marker icon resolution issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const greyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 50], iconAnchor: [15, 50], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const BASE_URL = "http://127.0.0.1:8000/api/users";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "🌍" },
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "ai-detect", label: "AI Detection", icon: "🤖" },
  { id: "map", label: "Recycling Centers", icon: "📍" },
  { id: "pickup", label: "Pickup Request", icon: "🚚" },
  { id: "rewards", label: "Rewards", icon: "🏆" },
  { id: "admin", label: "Admin Panel", icon: "⚙️" },
  { id: "education", label: "Learn", icon: "📚" },
];

const STATS = [
  { value: "53.6M", label: "Tonnes of e-waste generated yearly", icon: "⚠️" },
  { value: "17.4%", label: "Formally recycled globally", icon: "♻️" },
  { value: "$57B", label: "Value of raw materials wasted", icon: "💸" },
  { value: "1000+", label: "Toxic chemicals in e-waste", icon: "☣️" },
];

const RECYCLING_CENTERS = [
  { id: 1, name: "GreenCycle Hub", address: "42 Eco Street, Downtown", distance: "1.2 km", rating: 4.8, open: true, phone: "+1 555-0101", types: ["Phones", "Laptops", "Batteries"] },
  { id: 2, name: "EcoReclaim Center", address: "88 Sustainability Ave", distance: "2.7 km", rating: 4.5, open: true, phone: "+1 555-0102", types: ["TVs", "Appliances", "Cables"] },
  { id: 3, name: "TechDispose Pro", address: "15 Green Valley Rd", distance: "4.1 km", rating: 4.2, open: false, phone: "+1 555-0103", types: ["All Electronics"] },
  { id: 4, name: "CircularTech Depot", address: "200 Recycle Blvd", distance: "5.5 km", rating: 4.7, open: true, phone: "+1 555-0104", types: ["Phones", "Tablets", "Printers"] },
];



const PICKUP_REQUESTS = [
  { id: "ECO-001", device: "Laptop + Charger", date: "2024-01-15", status: "completed", address: "123 Main St" },
  { id: "ECO-002", device: "3x Mobile Phones", date: "2024-01-22", status: "in-transit", address: "456 Oak Ave" },
  { id: "ECO-003", device: "Old TV, Cables", date: "2024-01-28", status: "scheduled", address: "789 Pine Rd" },
];

const EDUCATION_CARDS = [
  { title: "Heavy Metal Hazards", icon: "⚗️", desc: "Lead, mercury, and cadmium in electronics poison soil and water for centuries.", color: "#ef4444" },
  { title: "Data Security", icon: "🔒", desc: "Improper disposal exposes personal data. Always wipe devices before recycling.", color: "#f59e0b" },
  { title: "Resource Recovery", icon: "💎", desc: "1 tonne of phones yields more gold than 1 tonne of gold ore.", color: "#10b981" },
  { title: "Climate Impact", icon: "🌡️", desc: "E-waste incineration releases greenhouse gases accelerating climate change.", color: "#3b82f6" },
  { title: "Circular Economy", icon: "🔄", desc: "Refurbishing and reusing electronics reduces demand for raw material mining.", color: "#8b5cf6" },
  { title: "Proper Disposal", icon: "✅", desc: "Use certified e-waste recyclers to ensure safe and legal processing.", color: "#06b6d4" },
];

const CHAT_RESPONSES = {
  "battery": "🔋 Batteries contain toxic chemicals like lithium and cadmium. Never throw them in regular trash! Drop them off at any certified recycling center. Use our Map section to find one near you.",
  "laptop": "💻 Before recycling your laptop, wipe all personal data first. Remove the battery if possible. Most recycling centers accept laptops. You'll earn 150 EcoPoints for each laptop recycled!",
  "phone": "📱 Old phones are goldmines — literally! They contain gold, silver, and rare earth metals. Drop it at a recycling center or schedule a pickup for 80 EcoPoints.",
  "tv": "📺 TVs contain lead and mercury in their screens. They require special handling. Schedule a pickup with us or find a certified center on our map.",
  "hello": "👋 Hello! I'm EcoBot, your AI recycling assistant. Ask me about recycling phones, laptops, batteries, TVs, or how to find nearby centers!",
  "default": "♻️ Great question! For best e-waste practices, always use certified recycling centers, wipe personal data, and earn EcoPoints for every item recycled. Type a device name for specific guidance!"
};

const ActivityChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "100px", padding: "8px 0" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <div style={{
            width: "100%", borderRadius: "6px 6px 0 0",
            height: `${(d.value / max) * 80}px`,
            background: `linear-gradient(180deg, #22c55e, #16a34a)`,
            transition: "height 0.8s cubic-bezier(.34,1.56,.64,1)",
            minHeight: "4px"
          }} />
          <span style={{ fontSize: "10px", color: "#6b7280", fontWeight: 600 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ percentage, color, size = 80 }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percentage / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }} />
    </svg>
  );
};

export default function EcoTrace() {
  const [activePage, setActivePage] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("access"));
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: "bot", text: "👋 Hi! I'm EcoBot. Ask me anything about e-waste recycling!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiFile, setAiFile] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [pickupStep, setPickupStep] = useState(1);
  const [pickupForm, setPickupForm] = useState({ device: "", qty: 1, address: "", date: "", notes: "" });
  const [pickupSubmitted, setPickupSubmitted] = useState(false);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [notification, setNotification] = useState(null);
  const [mapFilter, setMapFilter] = useState("all");
  const chatEndRef = useRef(null);
  const [trackingPickup, setTrackingPickup] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSubmissionId, setLastSubmissionId] = useState(null);
  const [rewardsList, setRewardsList] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [adminPickups, setAdminPickups] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const loadRewards = async () => {
    try {
      const res = await fetch(`${BASE_URL}/rewards/`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("access")}` }
      });
      if (res.ok) {
        setRewardsList(await res.json());
      }
    } catch (e) { }
  };

  const fetchTracking = async (trackingId) => {
    try {
      const res = await fetch(`${BASE_URL}/pickups/${trackingId}/`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("access")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTrackingPickup(data);
        return data;
      }
    } catch (e) { }
    return null;
  };

  const simulateProgress = async (trackingId) => {
    setIsSimulating(true);
    try {
      const res = await fetch(`${BASE_URL}/pickups/${trackingId}/advance/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTrackingPickup(data);
        loadPickupRequests();
        if (data.status === "processed") {
          showNotif("🎉 E-waste recycling complete! EcoPoints awarded.");
        }
      }
    } catch (e) { }
    setIsSimulating(false);
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const loadPickupRequests = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${BASE_URL}/pickups/`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("access")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPickupRequests(data);
      }
    } catch (e) {
      console.error("Failed to load pickps", e);
    }
  };

  useEffect(() => {
    if (activePage === "pickup" && isAuthenticated) {
      loadPickupRequests();
    }
    if (activePage === "rewards") {
      loadRewards();
    }
    if (activePage === "admin" && userProfile?.is_staff) {
      loadAdminData();
    }
  }, [activePage, isAuthenticated]);

  const loadAdminData = async () => {
    try {
      const headers = { "Authorization": `Bearer ${localStorage.getItem("access")}` };
      const [statsRes, pickupsRes, usersRes] = await Promise.all([
        fetch(`${BASE_URL}/admin/stats/`, { headers }),
        fetch(`${BASE_URL}/admin/pickups/`, { headers }),
        fetch(`${BASE_URL}/admin/users/`, { headers })
      ]);

      if (statsRes.ok) setAdminStats(await statsRes.json());
      if (pickupsRes.ok) setAdminPickups(await pickupsRes.json());
      if (usersRes.ok) setAdminUsers(await usersRes.json());
    } catch (e) {
      console.error("Failed to load admin data", e);
    }
  };

  const handleAdminPickupUpdate = async (id, status) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/pickups/${id}/update/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access")}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showNotif(`Pickup ${status} successfully`);
        loadAdminData();
      } else {
        const data = await res.json();
        showNotif(data.error || "Update failed", "error");
      }
    } catch (e) {
      showNotif("Network error", "error");
    }
  };

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        await fetch(`${BASE_URL}/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access")}`
          },
          body: JSON.stringify({ refresh })
        });
      }
    } catch (e) { }
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserProfile(null);
    setActivePage("home");
    showNotif("Logged out successfully");
  };

  const speak = (text) => {
    if (isMuted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showNotif("Speech recognition not supported in this browser", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      // Auto-send after a short delay to let user see what was captured
      setTimeout(() => {
        handleVoiceSend(transcript);
      }, 500);
    };

    recognition.start();
  };

  const handleVoiceSend = (text) => {
    if (!text.trim()) return;
    const userMsg = text.toLowerCase();
    setChatMessages(m => [...m, { role: "user", text: text }]);
    setChatInput("");
    setTimeout(() => {
      const key = Object.keys(CHAT_RESPONSES).find(k => userMsg.includes(k)) || "default";
      const botMsg = CHAT_RESPONSES[key];
      setChatMessages(m => [...m, { role: "bot", text: botMsg }]);
      speak(botMsg);
    }, 700);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.toLowerCase();
    setChatMessages(m => [...m, { role: "user", text: chatInput }]);
    setChatInput("");
    setTimeout(() => {
      const key = Object.keys(CHAT_RESPONSES).find(k => userMsg.includes(k)) || "default";
      const botMsg = CHAT_RESPONSES[key];
      setChatMessages(m => [...m, { role: "bot", text: botMsg }]);
      speak(botMsg);
    }, 700);
  };

  const runAiDetection = async () => {
    if (!aiFile) return;
    setAiLoading(true);
    setAiResult(null);

    const formData = new FormData();
    formData.append("image", aiFile);

    try {
      const res = await fetch(`${BASE_URL}/detect/`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setAiResult(data);
      } else {
        showNotif(data.error || "Failed to analyze image", "error");
      }
    } catch (err) {
      showNotif("Network error", "error");
    }

    setAiLoading(false);
  };

  const redeemReward = async (reward) => {
    if (!isAuthenticated) {
      showNotif("Please log in to redeem rewards", "error");
      setActivePage("login");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/rewards/redeem/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access")}`
        },
        body: JSON.stringify({ reward_id: reward.id })
      });
      const data = await res.json();
      if (res.ok) {
        showNotif(`🎉 ${data.message}`);
        loadRewards(); // Refresh redeemed status
        // Refresh profile to get updated points
        const profRes = await fetch(`${BASE_URL}/profile/`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("access")}` }
        });
        if (profRes.ok) setUserProfile(await profRes.json());
      } else {
        showNotif(data.error || "Redemption failed", "error");
      }
    } catch (e) {
      showNotif("Network error", "error");
    }
  };

  // === STYLES ===
  const colors = {
    bg: "#f0fdf4",
    sidebar: "#0f172a",
    primary: "#16a34a",
    primaryLight: "#22c55e",
    accent: "#0ea5e9",
    dark: "#0f172a",
    card: "#ffffff",
    text: "#1e293b",
    muted: "#64748b",
    border: "#e2e8f0",
  };

  const s = {
    app: { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: colors.bg, color: colors.text, position: "relative" },
    sidebar: {
      width: sidebarOpen ? "240px" : "64px", background: colors.sidebar, transition: "width 0.3s ease",
      display: "flex", flexDirection: "column", padding: "0", overflow: "hidden",
      position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100,
      boxShadow: "4px 0 24px rgba(0,0,0,0.15)"
    },
    sidebarLogo: {
      padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)",
      display: "flex", alignItems: "center", gap: "12px", cursor: "pointer"
    },
    navItem: (active) => ({
      display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px",
      cursor: "pointer", borderRadius: "0", transition: "all 0.2s",
      background: active ? "rgba(34,197,94,0.15)" : "transparent",
      borderLeft: active ? "3px solid #22c55e" : "3px solid transparent",
      color: active ? "#22c55e" : "rgba(255,255,255,0.65)",
      marginBottom: "2px",
    }),
    main: { flex: 1, marginLeft: sidebarOpen ? "240px" : "64px", transition: "margin-left 0.3s ease", display: "flex", flexDirection: "column", minHeight: "100vh" },
    topbar: {
      background: "#fff", borderBottom: `1px solid ${colors.border}`,
      padding: "0 24px", height: "64px", display: "flex", alignItems: "center",
      justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)"
    },
    content: { padding: "32px 28px", flex: 1 },
    card: { background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: `1px solid ${colors.border}` },
    statCard: (color) => ({ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", borderTop: `4px solid ${color}`, flex: 1 }),
    btn: (variant = "primary") => ({
      padding: variant === "sm" ? "8px 16px" : "12px 24px",
      borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: 600,
      fontSize: variant === "sm" ? "13px" : "15px", transition: "all 0.2s",
      background: variant === "primary" ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})` : variant === "outline" ? "transparent" : variant === "accent" ? `linear-gradient(135deg, #0ea5e9, #38bdf8)` : "#f1f5f9",
      color: variant === "secondary" ? colors.text : "#fff",
      border: variant === "outline" ? `2px solid ${colors.primary}` : "none",
    }),
    badge: (color) => ({ background: color + "20", color: color, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }),
    input: { width: "100%", padding: "12px 16px", borderRadius: "10px", border: `1.5px solid ${colors.border}`, fontSize: "14px", outline: "none", background: "#f8fafc", boxSizing: "border-box" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
    grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" },
  };

  // === PAGES ===

  const LandingPage = () => (
    <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d2d1a 50%, #0f172a 100%)", minHeight: "100vh", color: "#fff", padding: 0 }}>
      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "28px" }}>♻️</span>
          <span style={{ fontWeight: 800, fontSize: "22px", background: "linear-gradient(135deg, #22c55e, #4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>EcoTrace</span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => setActivePage("login")} style={{ ...s.btn("outline"), color: "#22c55e", borderColor: "#22c55e" }}>Login</button>
          <button onClick={() => setActivePage("register")} style={s.btn("primary")}>Register Free</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 48px 60px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "24px", padding: "8px 20px", marginBottom: "24px", fontSize: "13px", color: "#86efac" }}>
          🌍 AI-Powered E-Waste Management Platform
        </div>
        <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.1, marginBottom: "24px" }}>
          Turn Your <span style={{ background: "linear-gradient(135deg, #22c55e, #4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>E-Waste</span> Into<br />
          A <span style={{ background: "linear-gradient(135deg, #0ea5e9, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Greener</span> Tomorrow
        </h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.65)", marginBottom: "36px", lineHeight: 1.7, maxWidth: "600px", margin: "0 auto 36px" }}>
          Use AI to identify e-waste, find certified recycling centers nearby, earn rewards, and track your environmental impact — all in one platform.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setActivePage("register")} style={{ ...s.btn("primary"), padding: "16px 36px", fontSize: "16px", borderRadius: "14px" }}>🚀 Get Started Free</button>
          <button onClick={() => setActivePage("education")} style={{ ...s.btn("outline"), padding: "16px 36px", fontSize: "16px", borderRadius: "14px", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>📚 Learn More</button>
        </div>
      </div>

      {/* Floating Icons */}
      <div style={{ display: "flex", justifyContent: "center", gap: "40px", padding: "0 48px 60px", flexWrap: "wrap" }}>
        {[
          { icon: "🤖", label: "AI Detection", page: "ai-detect" },
          { icon: "📍", label: "Find Centers", page: "map" },
          { icon: "🚚", label: "Free Pickup", page: "pickup" },
          { icon: "🏆", label: "Earn Rewards", page: "rewards" }
        ].map(({ icon, label, page }) => (
          <div
            key={label}
            onClick={() => setActivePage(page)}
            style={{ cursor: "pointer", textAlign: "center", padding: "24px 28px", background: "rgba(255,255,255,0.05)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", minWidth: "120px", transition: "transform 0.2s" }}
            onMouseOver={e => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>{icon}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ background: "rgba(34,197,94,0.06)", borderTop: "1px solid rgba(34,197,94,0.15)", padding: "48px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
        {STATS.map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>{stat.icon}</div>
            <div style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, background: "linear-gradient(135deg, #22c55e, #4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.value}</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", marginTop: "6px", lineHeight: 1.4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: "60px 48px" }}>
        <h2 style={{ textAlign: "center", fontSize: "36px", fontWeight: 800, marginBottom: "40px" }}>Everything You Need to Recycle Smarter</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {[
            { icon: "🤖", title: "AI-Powered Detection", desc: "Upload a photo of your e-waste and our AI instantly identifies the device and provides tailored recycling instructions.", color: "#22c55e" },
            { icon: "🗺️", title: "Find Nearby Centers", desc: "Discover certified e-waste recycling facilities near you with real-time availability and directions.", color: "#0ea5e9" },
            { icon: "🚚", title: "Doorstep Pickup", desc: "Schedule a free pickup at your convenience. Our certified agents collect and ensure proper disposal.", color: "#f59e0b" },
            { icon: "🏆", title: "Earn Rewards", desc: "Get EcoPoints for every device recycled. Redeem for vouchers, badges, and real-world rewards.", color: "#8b5cf6" },
            { icon: "📊", title: "Impact Tracking", desc: "Visualize your environmental contribution — CO₂ saved, metals recovered, and more.", color: "#ef4444" },
            { icon: "💬", title: "AI Chatbot", desc: "Got questions? EcoBot answers 24/7 about recycling methods, hazardous materials, and disposal tips.", color: "#06b6d4" },
          ].map(f => (
            <div key={f.title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "28px", transition: "transform 0.2s" }}>
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>{f.icon}</div>
              <div style={{ color: f.color, fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>{f.title}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "60px 48px", background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(14,165,233,0.1))", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "16px" }}>Ready to Make a Difference?</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "28px" }}>Join 50,000+ eco-warriors already using EcoTrace</p>
        <button onClick={() => setActivePage("register")} style={{ ...s.btn("primary"), padding: "18px 48px", fontSize: "18px", borderRadius: "14px" }}>Start Recycling Today →</button>
      </div>
    </div>
  );

  const Dashboard = () => {
    const chartData = [
      { label: "Jan", value: 2 }, { label: "Feb", value: 5 }, { label: "Mar", value: 3 },
      { label: "Apr", value: 8 }, { label: "May", value: 6 }, { label: "Jun", value: 12 },
      { label: "Jul", value: 9 },
    ];
    return (
      <div>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: colors.dark }}>Welcome back, {userProfile?.full_name?.split(' ')[0] || userProfile?.username || "Eco Warrior"} 👋</h1>
          <p style={{ color: colors.muted, marginTop: "4px" }}>Here's your recycling impact summary</p>
        </div>

        {pickupRequests.filter(r => r.status !== 'processed').length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>📡 Live Waste Tracking</h3>
            {pickupRequests.filter(r => r.status !== 'processed').slice(0, 1).map(p => (
              <TrackingTimeline key={p.tracking_id} pickup={p} />
            ))}
          </div>
        )}

        {/* KPI Cards */}
        <div style={s.grid4}>
          {[
            { icon: "♻️", label: "Items Recycled", value: userProfile?.items_recycled || "0", sub: "Lifetime impact", color: "#22c55e" },
            { icon: "⭐", label: "EcoPoints", value: (userProfile?.eco_points || 0).toLocaleString(), sub: "Total balance", color: "#f59e0b" },
            { icon: "🌿", label: "CO₂ Saved (kg)", value: (userProfile?.items_recycled * 2.5).toFixed(1) || "0", sub: "Estimated offset", color: "#0ea5e9" },
            { icon: "🥇", label: "Rank", value: "#" + (1000 - (userProfile?.eco_points || 0) / 10).toFixed(0), sub: "Local leaderboard", color: "#8b5cf6" },
          ].map(k => (
            <div key={k.label} style={s.statCard(k.color)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "13px", color: colors.muted, fontWeight: 600, marginBottom: "8px" }}>{k.label}</div>
                  <div style={{ fontSize: "32px", fontWeight: 900, color: colors.dark }}>{k.value}</div>
                  <div style={{ fontSize: "12px", color: k.color, marginTop: "4px", fontWeight: 600 }}>{k.sub}</div>
                </div>
                <span style={{ fontSize: "32px" }}>{k.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...s.grid2, marginTop: "24px" }}>
          {/* Chart */}
          <div style={s.card}>
            <h3 style={{ fontWeight: 700, marginBottom: "4px" }}>Recycling Activity</h3>
            <p style={{ fontSize: "13px", color: colors.muted, marginBottom: "16px" }}>Items recycled per month</p>
            <ActivityChart data={chartData} />
          </div>

          {/* Recent Activity */}
          <div style={s.card}>
            <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>Recent Activity</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { icon: "📱", action: "Recycled iPhone 11", pts: "+80pts", time: "2h ago", color: "#22c55e" },
                { icon: "🔋", action: "Dropped off batteries", pts: "+60pts", time: "1d ago", color: "#f59e0b" },
                { icon: "💻", action: "Laptop pickup scheduled", pts: "Pending", time: "2d ago", color: "#0ea5e9" },
                { icon: "🏅", action: "Earned Eco Warrior Badge", pts: "Badge", time: "5d ago", color: "#8b5cf6" },
              ].map(a => (
                <div key={a.action} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ width: "40px", height: "40px", background: a.color + "15", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{a.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600 }}>{a.action}</div>
                    <div style={{ fontSize: "12px", color: colors.muted }}>{a.time}</div>
                  </div>
                  <span style={s.badge(a.color)}>{a.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Circles */}
        <div style={{ ...s.card, marginTop: "24px" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "20px" }}>Environmental Impact Breakdown</h3>
          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
            {[
              { label: "Metals Recovered", pct: 72, color: "#22c55e" },
              { label: "Plastics Recycled", pct: 58, color: "#0ea5e9" },
              { label: "CO₂ Offset", pct: 84, color: "#f59e0b" },
              { label: "Hazardous Neutralized", pct: 91, color: "#ef4444" },
            ].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 8px" }}>
                  <DonutChart percentage={item.pct} color={item.color} />
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: "14px", fontWeight: 800, color: item.color }}>{item.pct}%</div>
                </div>
                <div style={{ fontSize: "12px", color: colors.muted, fontWeight: 600 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={{ ...s.card, marginTop: "24px", background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "12px" }}>🔔 Notifications</h3>
          {[
            { msg: "Your laptop pickup is confirmed for tomorrow 10am–12pm", time: "1h ago", type: "info" },
            { msg: "You earned the 'Green Champion' badge! 🏆", time: "3h ago", type: "success" },
            { msg: "New recycling center opened 1.5km from you!", time: "1d ago", type: "new" },
          ].map((n, i) => (
            <div key={i} style={{ padding: "12px 16px", background: "#fff", borderRadius: "10px", marginBottom: "8px", display: "flex", gap: "12px", alignItems: "center" }}>
              <span>{n.type === "success" ? "✅" : n.type === "info" ? "ℹ️" : "🆕"}</span>
              <div style={{ flex: 1, fontSize: "14px" }}>{n.msg}</div>
              <span style={{ fontSize: "12px", color: colors.muted }}>{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const AiDetection = () => (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>🤖 AI E-Waste Detection</h1>
      <p style={{ color: colors.muted, marginBottom: "28px" }}>Upload a photo of your electronic waste for instant AI-powered identification</p>

      <div style={s.grid2}>
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: "20px" }}>Upload Device Image</h3>
          <div
            onClick={() => document.getElementById("fileInput").click()}
            style={{ border: `2px dashed ${aiFile ? colors.primary : colors.border}`, borderRadius: "16px", padding: "48px 24px", textAlign: "center", cursor: "pointer", background: aiFile ? "#f0fdf4" : "#f8fafc", transition: "all 0.2s" }}
          >
            {aiFile ? (
              <div>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                <div style={{ fontWeight: 600, color: colors.primary }}>{aiFile.name}</div>
                <div style={{ fontSize: "13px", color: colors.muted, marginTop: "4px" }}>Ready to analyze</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📸</div>
                <div style={{ fontWeight: 600, color: colors.dark }}>Click to upload or drag & drop</div>
                <div style={{ fontSize: "13px", color: colors.muted, marginTop: "4px" }}>PNG, JPG, WEBP up to 10MB</div>
              </div>
            )}
          </div>
          <input id="fileInput" type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) setAiFile(e.target.files[0]); setAiResult(null); }} />
          <button onClick={runAiDetection} disabled={!aiFile || aiLoading} style={{ ...s.btn("primary"), width: "100%", marginTop: "16px", opacity: !aiFile ? 0.5 : 1 }}>
            {aiLoading ? "🔄 Analyzing..." : "🚀 Analyze with AI"}
          </button>

          {aiLoading && (
            <div style={{ marginTop: "20px", padding: "16px", background: "#f0fdf4", borderRadius: "12px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "24px", height: "24px", border: "3px solid #22c55e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: "14px", color: colors.primary, fontWeight: 600 }}>AI model processing image...</div>
              </div>
              <div style={{ marginTop: "12px" }}>
                {["Loading model", "Extracting features", "Classifying device", "Generating report"].map((step, i) => (
                  <div key={step} style={{ fontSize: "12px", color: colors.muted, padding: "4px 0" }}>
                    ✓ {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={s.card}>
          {aiResult ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontWeight: 700 }}>Detection Results</h3>
                <span style={s.badge("#22c55e")}>✅ Analyzed</span>
              </div>

              <div style={{ background: "linear-gradient(135deg, #0f172a, #0d2d1a)", borderRadius: "14px", padding: "20px", color: "#fff", marginBottom: "20px" }}>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>DETECTED DEVICE</div>
                <div style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>{aiResult.type}</div>
                <div style={{ fontSize: "14px", color: "#86efac" }}>{aiResult.category}</div>
                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "#4ade80" }}>{aiResult.confidence}%</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>AI Confidence</div>
                  </div>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ fontSize: "22px", fontWeight: 800, color: "#fbbf24" }}>+{aiResult.points}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>EcoPoints Value</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontWeight: 700, marginBottom: "10px" }}>♻️ Quick Recycling Steps</div>
                {aiResult.instructions.map((ins, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", padding: "8px 0", borderBottom: `1px solid ${colors.border}`, fontSize: "14px" }}>
                    <span style={{ color: colors.primary, fontWeight: 700 }}>{i + 1}.</span> {ins}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button onClick={() => setActivePage("pickup")} style={{ ...s.btn("primary"), flex: 1 }}>📦 Schedule Pickup</button>
                <button onClick={() => setActivePage("map")} style={{ ...s.btn("accent"), flex: 1 }}>📍 Find Center</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: "18px", color: colors.dark }}>Upload an image to begin</div>
              <div style={{ color: colors.muted, fontSize: "14px", marginTop: "8px" }}>Our AI will identify your device and provide recycling guidance</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ ...s.card, marginTop: "24px" }}>
        <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>🔬 Detectable Device Categories</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {[["📱", "Smartphones"], ["💻", "Laptops"], ["🖥️", "Monitors"], ["⌨️", "Keyboards"], ["🔋", "Batteries"], ["📺", "TVs"], ["🖨️", "Printers"], ["🎮", "Gaming Consoles"], ["🔌", "Cables & Adapters"], ["📷", "Cameras"], ["🎧", "Audio Devices"], ["🏠", "Smart Home"], ["⚙️", "Others"]].map(([icon, name]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#f8fafc", borderRadius: "10px", border: `1px solid ${colors.border}`, fontSize: "14px", fontWeight: 500 }}>
              <span>{icon}</span><span>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MapPage = () => {
    const [centers, setCenters] = useState([]);
    const [mapFilter, setMapFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("Sangli"); // Default to Sangli for hackathon
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState("");
    const cardRefs = useRef({});

    useEffect(() => {
      fetch(`${BASE_URL}/centers/`)
        .then(r => r.json())
        .then(data => setCenters(data))
        .catch(() => { });
    }, []);

    const filtered = centers.filter(c => {
      const typeMatch = mapFilter === "all" || c.types.some(t => t.toLowerCase().includes(mapFilter.toLowerCase()));
      const cityMatch = cityFilter === "all" || c.address.toLowerCase().includes(cityFilter.toLowerCase());
      const searchMatch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.address.toLowerCase().includes(search.toLowerCase());
      return typeMatch && cityMatch && searchMatch;
    });

    const handleMarkerClick = (id) => {
      setSelectedId(id);
      if (cardRefs.current[id]) {
        cardRefs.current[id].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    const mapCenter = filtered.length > 0
      ? [filtered[0].lat, filtered[0].lng]
      : cityFilter === "Sangli" ? [16.8524, 74.5815] : [18.5204, 73.8567];

    return (
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>📍 Nearby Recycling Centers</h1>
        <p style={{ color: colors.muted, marginBottom: "24px" }}>Find certified e-waste recycling facilities near you</p>

        <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "12px", gap: "4px" }}>
            {["all", "Pune", "Sangli"].map(city => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: cityFilter === city ? "#fff" : "transparent",
                  color: cityFilter === city ? colors.primary : colors.muted,
                  boxShadow: cityFilter === city ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {city === "all" ? "All Cities" : city}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <input
            style={{ ...s.input, flex: 1, minWidth: "200px", maxWidth: "340px" }}
            placeholder="🔍 Search by name or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {["all", "Phones", "Batteries", "Appliances"].map(f => (
            <button key={f} onClick={() => setMapFilter(f)} style={{ ...s.btn(mapFilter === f ? "primary" : "secondary"), padding: "10px 18px", fontSize: "13px" }}>
              {f === "all" ? "All Types" : f}
            </button>
          ))}
        </div>

        <div style={s.grid2}>
          {/* Leaflet Map */}
          <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", minHeight: "450px" }}>
            {typeof window !== 'undefined' && (
              <MapContainer
                key={mapCenter.join(',')}
                center={mapCenter}
                zoom={12}
                style={{ height: "450px", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filtered.map(center => (
                  <Marker
                    key={center.id}
                    position={[center.lat, center.lng]}
                    icon={selectedId === center.id ? goldIcon : center.open_now ? greenIcon : greyIcon}
                    eventHandlers={{ click: () => handleMarkerClick(center.id) }}
                  >
                    <Popup>
                      <div style={{ minWidth: "180px" }}>
                        <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{center.name}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>{center.address}</div>
                        <div style={{ fontSize: "12px", marginBottom: "6px" }}>⭐ {center.rating} &nbsp;|&nbsp; {center.open_now ? "🟢 Open" : "🔴 Closed"}</div>
                        <a href={`https://maps.google.com/?q=${center.lat},${center.lng}`} target="_blank" rel="noreferrer"
                          style={{ display: "inline-block", background: "#22c55e", color: "#fff", padding: "4px 12px", borderRadius: "8px", fontSize: "12px", textDecoration: "none", fontWeight: 600 }}>
                          🗺️ Directions
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>

          {/* Center List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "450px", overflowY: "auto", paddingRight: "4px" }}>
            {filtered.length === 0 && (
              <div style={{ ...s.card, textAlign: "center", color: colors.muted, padding: "40px" }}>No centers found</div>
            )}
            {filtered.map(center => (
              <div
                key={center.id}
                ref={el => { cardRefs.current[center.id] = el; }}
                onClick={() => setSelectedId(center.id)}
                style={{ ...s.card, padding: "16px", cursor: "pointer", border: selectedId === center.id ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`, transition: "all 0.2s" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px" }}>{center.name}</div>
                    <div style={{ fontSize: "13px", color: colors.muted, marginTop: "2px" }}>{center.address}</div>
                  </div>
                  <span style={s.badge(center.open_now ? "#22c55e" : "#9ca3af")}>{center.open_now ? "Open" : "Closed"}</span>
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: colors.muted, marginBottom: "10px" }}>
                  <span>⭐ {center.rating}</span>
                  <span>📞 {center.phone}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                  {center.types.map(t => <span key={t} style={s.badge("#0ea5e9")}>{t}</span>)}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <a
                    href={`https://maps.google.com/?q=${center.lat},${center.lng}`}
                    target="_blank" rel="noreferrer"
                    style={{ ...s.btn("primary"), flex: 1, padding: "8px 12px", fontSize: "13px", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    🗺️ Directions
                  </a>
                  <a
                    href={`tel:${center.phone}`}
                    style={{ ...s.btn("secondary"), flex: 1, padding: "8px 12px", fontSize: "13px", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    📞 Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };



  const TrackingTimeline = ({ pickup }) => {
    const statusOrder = ['scheduled', 'collected', 'in-transit', 'at-facility', 'processed'];
    const currentIndex = statusOrder.indexOf(pickup.status);

    return (
      <div style={{ ...s.card, padding: "24px", marginBottom: "24px", border: `2px solid ${colors.primary}`, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: "18px" }}>E-Waste Tracking: {pickup.tracking_id}</h3>
            <p style={{ color: colors.muted, fontSize: "13px", marginTop: "4px" }}>Last updated: {new Date(pickup.updated_at).toLocaleString()}</p>
          </div>
          <button onClick={() => setTrackingPickup(null)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: colors.muted }}>×</button>
        </div>

        <div style={{ position: "relative", padding: "10px 0" }}>
          {statusOrder.map((step, i) => {
            const isActive = i <= currentIndex;
            // const isCurrent = i === currentIndex;
            return (
              <div key={step} style={{ display: "flex", gap: "16px", marginBottom: i < statusOrder.length - 1 ? "24px" : "0", position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: isActive ? colors.primary : colors.border,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: "12px", zIndex: 2
                  }}>
                    {isActive ? "✓" : i + 1}
                  </div>
                  {i < statusOrder.length - 1 && (
                    <div style={{
                      flex: 1, width: "2px",
                      background: i < currentIndex ? colors.primary : colors.border,
                      position: "absolute", top: "28px", bottom: "-24px", left: "13px"
                    }} />
                  )}
                </div>
                <div>
                  <div style={{
                    fontSize: "14px", fontWeight: 700,
                    color: i === currentIndex ? colors.primary : isActive ? colors.dark : colors.muted,
                    textTransform: "capitalize"
                  }}>{step.replace('-', ' ')}</div>
                  <div style={{ fontSize: "12px", color: colors.muted, marginTop: "2px" }}>
                    {isActive ? (i === 4 ? "Waste has been responsibly recycled!" : "Status updated and verified") : "Pending processing"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "32px", padding: "16px", background: "#f8fafc", borderRadius: "12px", border: `1px dashed ${colors.border}` }}>
          <div style={{ fontWeight: 700, fontSize: "13px", color: colors.muted, marginBottom: "8px" }}>🧪 Hackathon Demo Helper (Simulate Progress)</div>
          <button
            disabled={isSimulating || pickup.status === "processed"}
            onClick={() => simulateProgress(pickup.tracking_id)}
            style={{ ...s.btn("primary"), width: "100%", padding: "10px", fontSize: "13px" }}
          >
            {isSimulating ? "Processing..." : pickup.status === "processed" ? "Recycling Complete ✅" : "Advance to Next Stage →"}
          </button>
        </div>
      </div>
    );
  };

  const PickupPage = () => (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>🚚 Schedule a Pickup</h1>
      <p style={{ color: colors.muted, marginBottom: "28px" }}>Request a free doorstep collection of your e-waste</p>

      {!isAuthenticated && (
        <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, color: "#854d0e" }}>🔒 Login Required to Schedule a Pickup</div>
            <div style={{ fontSize: "13px", color: "#713f12", marginTop: "4px" }}>Please log in to save your pickup request to your account.</div>
          </div>
          <button onClick={() => setActivePage("login")} style={{ ...s.btn("primary"), padding: "8px 20px" }}>Login</button>
        </div>
      )}

      {/* Progress */}
      <div style={{ display: "flex", gap: "0", marginBottom: "32px", alignItems: "center" }}>
        {["Device Info", "Address", "Confirm"].map((step, i) => (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", background: pickupStep > i + 1 ? colors.primary : pickupStep === i + 1 ? colors.primary : colors.border, color: pickupStep >= i + 1 ? "#fff" : colors.muted }}>
                {pickupStep > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "14px", fontWeight: 600, color: pickupStep === i + 1 ? colors.primary : colors.muted }}>{step}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: "2px", background: pickupStep > i + 1 ? colors.primary : colors.border, margin: "0 12px" }} />}
          </div>
        ))}
      </div>

      {pickupSubmitted ? (
        <div style={{ ...s.card, textAlign: "center", padding: "60px", maxWidth: "500px", margin: "0 auto" }}>
          <div style={{ fontSize: "72px", marginBottom: "20px" }}>🎉</div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>Pickup Scheduled!</h2>
          <p style={{ color: colors.muted, marginBottom: "24px" }}>Your pickup request <strong>{lastSubmissionId}</strong> has been confirmed. A certified agent will contact you shortly.</p>
          <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "16px", marginBottom: "24px", textAlign: "left" }}>
            <div style={{ fontSize: "13px", color: colors.muted }}>📅 Date: {pickupForm.date || "Flexible"}</div>
            <div style={{ fontSize: "13px", color: colors.muted, marginTop: "4px" }}>📦 Device: {pickupForm.device}</div>
            <div style={{ fontSize: "13px", color: colors.muted, marginTop: "4px" }}>📍 Address: {pickupForm.address}</div>
          </div>
          <button onClick={() => { fetchTracking(lastSubmissionId); setPickupSubmitted(false); }} style={{ ...s.btn("primary"), width: "100%", marginBottom: "12px" }}>Track This Waste Now 📍</button>
          <button onClick={() => { setPickupSubmitted(false); setPickupStep(1); setPickupForm({ device: "", qty: 1, address: "", date: "", notes: "" }); }} style={s.btn("secondary")}>Schedule Another Pickup</button>
        </div>
      ) : (
        <div style={{ ...s.grid2 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {trackingPickup && <TrackingTimeline pickup={trackingPickup} />}
            <div style={s.card}>
              {pickupStep === 1 && (
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: "20px" }}>Step 1: Device Information</h3>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>Device Type *</label>
                    <select style={{ ...s.input }} value={pickupForm.device} onChange={e => setPickupForm(f => ({ ...f, device: e.target.value }))}>
                      <option value="">Select device type...</option>
                      <option>Smartphone / Tablet</option><option>Laptop / Desktop</option>
                      <option>TV / Monitor</option><option>Printer / Scanner</option>
                      <option>Batteries</option><option>Kitchen Appliances</option><option>Other Electronics</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>Quantity</label>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <button onClick={() => setPickupForm(f => ({ ...f, qty: Math.max(1, f.qty - 1) }))} style={{ width: "36px", height: "36px", borderRadius: "8px", border: `1px solid ${colors.border}`, cursor: "pointer", fontSize: "18px", background: "#fff" }}>−</button>
                      <span style={{ fontSize: "20px", fontWeight: 700, minWidth: "40px", textAlign: "center" }}>{pickupForm.qty}</span>
                      <button onClick={() => setPickupForm(f => ({ ...f, qty: f.qty + 1 }))} style={{ width: "36px", height: "36px", borderRadius: "8px", border: `1px solid ${colors.border}`, cursor: "pointer", fontSize: "18px", background: "#fff" }}>+</button>
                    </div>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>Additional Notes</label>
                    <textarea style={{ ...s.input, minHeight: "80px", resize: "vertical" }} placeholder="Describe condition, accessories included, etc." value={pickupForm.notes} onChange={e => setPickupForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>
                  <button onClick={() => setPickupStep(2)} disabled={!pickupForm.device} style={{ ...s.btn("primary"), width: "100%", opacity: !pickupForm.device ? 0.5 : 1 }}>Next: Address →</button>
                </div>
              )}
              {pickupStep === 2 && (
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: "20px" }}>Step 2: Pickup Address</h3>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>Full Address *</label>
                    <textarea style={{ ...s.input, minHeight: "80px" }} placeholder="Enter your complete address..." value={pickupForm.address} onChange={e => setPickupForm(f => ({ ...f, address: e.target.value }))} />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: "8px", fontSize: "14px" }}>Preferred Date</label>
                    <input type="date" style={s.input} value={pickupForm.date} onChange={e => setPickupForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={() => setPickupStep(1)} style={{ ...s.btn("secondary"), flex: 1 }}>← Back</button>
                    <button onClick={() => setPickupStep(3)} disabled={!pickupForm.address} style={{ ...s.btn("primary"), flex: 1, opacity: !pickupForm.address ? 0.5 : 1 }}>Review →</button>
                  </div>
                </div>
              )}
              {pickupStep === 3 && (
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: "20px" }}>Step 3: Confirm Request</h3>
                  <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                    {[["📦 Device", pickupForm.device], ["🔢 Quantity", pickupForm.qty], ["📍 Address", pickupForm.address], ["📅 Date", pickupForm.date || "Flexible"]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.border}`, fontSize: "14px" }}>
                        <span style={{ color: colors.muted, fontWeight: 600 }}>{k}</span>
                        <span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: colors.primary }}>
                    🏆 You'll earn approximately <strong>+{100 * pickupForm.qty} EcoPoints</strong> for this pickup!
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={() => setPickupStep(2)} style={{ ...s.btn("secondary"), flex: 1 }}>← Back</button>
                    <button onClick={async () => {
                      if (!isAuthenticated) {
                        showNotif("Please log in first to schedule a pickup!", "error");
                        setActivePage("login");
                        return;
                      }
                      try {
                        const payload = { ...pickupForm };
                        if (!payload.date) payload.date = null;

                        const res = await fetch(`${BASE_URL}/pickups/`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("access")}`
                          },
                          body: JSON.stringify(payload)
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setLastSubmissionId(data.tracking_id);
                          await loadPickupRequests();
                          setPickupSubmitted(true);
                        } else if (res.status === 401) {
                          showNotif("Session expired. Please log in again.", "error");
                          setActivePage("login");
                        } else {
                          const errData = await res.json();
                          showNotif(JSON.stringify(errData) || "Failed to schedule pickup", "error");
                        }
                      } catch (e) {
                        showNotif("Network error", "error");
                      }
                    }} style={{ ...s.btn("primary"), flex: 1 }}>✅ Confirm Pickup</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Existing Requests */}
          <div style={s.card}>
            <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>Your Pickup History</h3>
            {pickupRequests.map(req => (
              <div key={req.id} style={{ padding: "14px", background: "#f8fafc", borderRadius: "12px", marginBottom: "12px", border: `1px solid ${colors.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>ECO-{String(req.id).padStart(5, '0')}</div>
                  <span style={s.badge(req.status === "completed" ? "#22c55e" : req.status === "in-transit" ? "#0ea5e9" : "#f59e0b")}>
                    {req.status === "completed" ? "✅ Completed" : req.status === "in-transit" ? "🚚 In Transit" : "📅 Scheduled"}
                  </span>
                </div>
                <div style={{ fontSize: "13px", color: colors.muted, marginTop: "6px" }}>📦 {req.device} (x{req.qty})</div>
                <div style={{ fontSize: "13px", color: colors.muted }}>📅 {req.date || "Flexible Timing"}</div>
                <div style={{ fontSize: "12px", color: colors.muted, marginTop: "4px" }}>📍 {req.address}</div>
                <button
                  onClick={() => fetchTracking(req.tracking_id)}
                  style={{ ...s.btn("accent"), width: "100%", padding: "8px", fontSize: "12px", marginTop: "12px" }}
                >
                  📍 Track Waste
                </button>
              </div>
            ))}
            {pickupRequests.length === 0 && (
              <div style={{ fontSize: "13px", color: colors.muted, textAlign: "center", padding: "20px" }}>No pickup requests found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const RewardsPage = () => (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>🏆 Rewards & Incentives</h1>
      <p style={{ color: colors.muted, marginBottom: "28px" }}>Earn EcoPoints for recycling and redeem amazing rewards</p>

      {/* Points Banner */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #0d2d1a)", borderRadius: "20px", padding: "32px", color: "#fff", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>YOUR ECOPOINTS BALANCE</div>
          <div style={{ fontSize: "52px", fontWeight: 900, background: "linear-gradient(135deg, #22c55e, #4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{(userProfile?.eco_points || 0).toLocaleString()}</div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>🌱 Eco Warrior Level · Top 10% Recycler</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>NEXT LEVEL</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#fbbf24", marginTop: "4px" }}>2,000 pts</div>
          <div style={{ width: "160px", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", marginTop: "8px", overflow: "hidden" }}>
            <div style={{ width: `${(Math.min(userProfile?.eco_points || 0, 2000) / 2000) * 100}%`, height: "100%", background: "linear-gradient(90deg, #22c55e, #4ade80)", borderRadius: "4px" }} />
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>{Math.max(0, 2000 - (userProfile?.eco_points || 0))} pts to Gold</div>
        </div>
      </div>

      {/* Earning Guide */}
      <div style={{ ...s.card, marginBottom: "24px" }}>
        <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>⚡ How to Earn Points</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {[["📱", "Smartphone", "80 pts"], ["💻", "Laptop", "150 pts"], ["🔋", "Battery", "60 pts"], ["📺", "TV/Monitor", "120 pts"]].map(([i, l, p]) => (
            <div key={l} style={{ textAlign: "center", padding: "16px", background: "#f0fdf4", borderRadius: "12px" }}>
              <div style={{ fontSize: "28px" }}>{i}</div>
              <div style={{ fontWeight: 600, fontSize: "13px", marginTop: "6px" }}>{l}</div>
              <div style={{ color: colors.primary, fontWeight: 800, fontSize: "16px" }}>{p}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div style={{ ...s.card, marginBottom: "24px" }}>
        <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>🏅 Your Eco Badges</h3>
        <div style={{ display: "flex", gap: "16px" }}>
          {[["🌱", "First Recycle", "Earned"], ["⚡", "Power Saver", "Earned"], ["🌍", "Earth Hero", "Earned"], ["🏆", "Eco Warrior", "Earned"], ["💎", "Diamond Recycler", "Locked"], ["🌟", "Legend", "Locked"]].map(([icon, name, status]) => (
            <div key={name} style={{ textAlign: "center", opacity: status === "Locked" ? 0.4 : 1 }}>
              <div style={{ width: "60px", height: "60px", background: status === "Earned" ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 6px", border: `2px solid ${status === "Earned" ? colors.primary : colors.border}` }}>{icon}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: status === "Earned" ? colors.dark : colors.muted }}>{name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Redeemable Rewards */}
      <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>🎁 Redeem Rewards</h3>
      <div style={s.grid3}>
        {rewardsList.map(reward => {
          const isRedeemed = reward.is_redeemed;
          const canAfford = (userProfile?.eco_points || 0) >= reward.points_cost;
          return (
            <div key={reward.id} style={{ ...s.card, opacity: isRedeemed ? 0.7 : 1, border: isRedeemed ? `2px solid ${colors.primary}` : `1px solid ${colors.border}` }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>{reward.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{reward.name}</div>
              <div style={{ fontSize: "12px", color: colors.muted, marginBottom: "12px" }}>{reward.category}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: "18px", color: canAfford ? colors.primary : "#9ca3af" }}>⭐ {reward.points_cost}</span>
                <button
                  onClick={() => redeemReward(reward)}
                  disabled={isRedeemed || !canAfford}
                  style={{ ...s.btn(isRedeemed ? "secondary" : canAfford ? "primary" : "secondary"), padding: "8px 16px", fontSize: "13px", opacity: !canAfford && !isRedeemed ? 0.5 : 1 }}
                >
                  {isRedeemed ? "✓ Redeemed" : canAfford ? "Redeem" : "Locked"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const AdminPage = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800 }}>⚙️ Admin Dashboard</h1>
          <p style={{ color: colors.muted, marginTop: "4px" }}>Platform overview and management</p>
        </div>
        <span style={s.badge("#ef4444")}>🔐 Admin Access</span>
      </div>

      <div style={s.grid4}>
        {[
          { icon: "👥", label: "Total Users", value: adminStats?.total_users?.value || "0", change: adminStats?.total_users?.change || "+0%", color: "#22c55e" },
          { icon: "♻️", label: "Items Collected", value: adminStats?.items_collected?.value || "0", change: adminStats?.items_collected?.change || "+0%", color: "#0ea5e9" },
          { icon: "🏢", label: "Active Centers", value: adminStats?.active_centers?.value || "0", change: adminStats?.active_centers?.change || "+0", color: "#f59e0b" },
          { icon: "🚚", label: "Pending Pickups", value: adminStats?.pending_pickups?.value || "0", change: adminStats?.pending_pickups?.change || "-0%", color: "#8b5cf6" },
        ].map(k => (
          <div key={k.label} style={s.statCard(k.color)}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "13px", color: colors.muted, fontWeight: 600, marginBottom: "8px" }}>{k.label}</div>
                <div style={{ fontSize: "28px", fontWeight: 900 }}>{k.value}</div>
                <div style={{ fontSize: "12px", color: k.color, marginTop: "4px", fontWeight: 600 }}>{k.change} recently</div>
              </div>
              <span style={{ fontSize: "32px" }}>{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...s.grid2, marginTop: "24px" }}>
        {/* Pending Pickups */}
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>📋 Incoming Pickup Requests</h3>
          {adminPickups.filter(p => p.status === 'scheduled').length === 0 && (
            <div style={{ textAlign: "center", color: colors.muted, padding: "20px" }}>No pending requests.</div>
          )}
          {adminPickups.filter(p => p.status === 'scheduled').map((r, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ width: "40px", height: "40px", background: "#f0fdf4", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{r.user}</div>
                <div style={{ fontSize: "12px", color: colors.muted }}>{r.device} (x{r.qty}) · {r.address}</div>
              </div>
              <span style={s.badge(r.priority === "high" ? "#ef4444" : "#f59e0b")}>{r.priority}</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => handleAdminPickupUpdate(r.id, "collected")} style={{ ...s.btn("primary"), padding: "6px 12px", fontSize: "12px" }}>Approve</button>
                <button onClick={() => handleAdminPickupUpdate(r.id, "cancelled")} style={{ ...s.btn("secondary"), padding: "6px 12px", fontSize: "12px" }}>✗</button>
              </div>
            </div>
          ))}
        </div>

        {/* E-waste by category */}
        <div style={s.card}>
          <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>📊 Collection by Category</h3>
          {[
            { cat: "Mobile Devices", pct: 38, color: "#22c55e", val: "456K" },
            { cat: "Computers & Laptops", pct: 24, color: "#0ea5e9", val: "288K" },
            { cat: "TVs & Monitors", pct: 18, color: "#f59e0b", val: "216K" },
            { cat: "Batteries", pct: 12, color: "#ef4444", val: "144K" },
            { cat: "Other", pct: 8, color: "#8b5cf6", val: "96K" },
          ].map(c => (
            <div key={c.cat} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                <span>{c.cat}</span>
                <span style={{ color: c.color }}>{c.val} ({c.pct}%)</span>
              </div>
              <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, borderRadius: "4px", transition: "width 0.8s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User table */}
      <div style={{ ...s.card, marginTop: "24px" }}>
        <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>👥 Platform User Overview</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
              {["User", "Items Recycled", "EcoPoints", "Joined"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px", color: colors.muted, fontWeight: 700, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td style={{ padding: "12px" }}>
                  <div style={{ fontWeight: 600, fontSize: "14px" }}>{u.full_name || u.username}</div>
                  <div style={{ fontSize: "11px", color: colors.muted }}>{u.email}</div>
                </td>
                <td style={{ padding: "12px", fontSize: "14px" }}>{u.items_recycled}</td>
                <td style={{ padding: "12px" }}><span style={s.badge("#f59e0b")}>⭐ {u.eco_points}</span></td>
                <td style={{ padding: "12px", fontSize: "13px", color: colors.muted }}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const EducationPage = () => (
    <div>
      <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>📚 E-Waste Education Hub</h1>
      <p style={{ color: colors.muted, marginBottom: "28px" }}>Learn about e-waste hazards and how to dispose responsibly</p>

      {/* Hero banner */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #0d2d1a)", borderRadius: "20px", padding: "40px", color: "#fff", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "13px", color: "#86efac", marginBottom: "8px", fontWeight: 600 }}>DID YOU KNOW?</div>
          <div style={{ fontSize: "24px", fontWeight: 800, maxWidth: "500px", lineHeight: 1.4 }}>
            Only 17.4% of e-waste is properly recycled globally, despite it being the world's fastest-growing waste stream.
          </div>
        </div>
        <div style={{ fontSize: "80px" }}>🌍</div>
      </div>

      <div style={s.grid3}>
        {EDUCATION_CARDS.map(card => (
          <div key={card.title} style={{ ...s.card, borderTop: `4px solid ${card.color}` }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>{card.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>{card.title}</div>
            <div style={{ fontSize: "14px", color: colors.muted, lineHeight: 1.6 }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* Recycling Guide */}
      <div style={{ ...s.card, marginTop: "24px" }}>
        <h3 style={{ fontWeight: 700, marginBottom: "20px" }}>🔧 Complete Recycling Guide</h3>
        <div style={s.grid2}>
          {[
            { device: "📱 Smartphones", steps: ["Back up all data", "Factory reset", "Remove SIM card", "Remove battery if possible", "Take to certified center"] },
            { device: "💻 Laptops/Computers", steps: ["Secure erase hard drive", "Remove & separate battery", "Donate if still working", "Use manufacturer take-back", "Certified recycler only"] },
            { device: "🔋 Batteries", steps: ["Never throw in bin", "Store safely until disposal", "Use battery drop-off points", "Check retailer programs", "Urgent — highly toxic"] },
            { device: "📺 TVs & Monitors", steps: ["Check manufacturer take-back", "Contact local authority", "Never smash or open", "Special handling required", "Leads and mercury inside"] },
          ].map(guide => (
            <div key={guide.device} style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "12px" }}>{guide.device}</div>
              {guide.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", padding: "6px 0", fontSize: "13px", color: colors.text }}>
                  <span style={{ color: colors.primary, fontWeight: 700 }}>{i + 1}.</span> {step}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Awareness Tips */}
      <div style={{ ...s.card, marginTop: "24px", background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)" }}>
        <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>💡 Quick Awareness Tips</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            "Never burn electronic waste — it releases highly toxic dioxins into the air",
            "Extend device life by repairing before replacing — reducing e-waste at the source",
            "Buy refurbished electronics to reduce demand for new manufacturing",
            "Look for EPEAT and Energy Star certifications when buying new devices",
            "Participate in manufacturer take-back programs — most brands offer free recycling",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px", background: "#fff", borderRadius: "10px" }}>
              <span style={{ fontSize: "18px" }}>💚</span>
              <span style={{ fontSize: "14px", lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AuthContainer = ({ title, children }) => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px" }}>
      <div style={{ ...s.card, width: "100%", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 800, textAlign: "center", marginBottom: "24px", color: colors.dark }}>{title}</h2>
        {children}
      </div>
    </div>
  );

  const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("access", data.tokens.access);
          localStorage.setItem("refresh", data.tokens.refresh);
          localStorage.setItem("user", JSON.stringify(data.user));
          setIsAuthenticated(true);
          setUserProfile(data.user);
          showNotif("Login successful!");
          setActivePage("dashboard");
        } else {
          showNotif(data.error || "Login failed", "error");
        }
      } catch (err) {
        showNotif("Network error", "error");
      }
      setLoading(false);
    };

    return (
      <AuthContainer title="Welcome Back">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px", display: "block" }}>Email</label>
            <input type="email" style={s.input} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px", display: "block" }}>Password</label>
            <input type="password" style={s.input} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" style={{ ...s.btn("primary"), marginTop: "8px", width: "100%" }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: colors.muted }}>
          Don't have an account? <span style={{ color: colors.primary, cursor: "pointer", fontWeight: 600 }} onClick={() => setActivePage("register")}>Register</span>
        </div>
      </AuthContainer>
    );
  };

  const RegisterPage = () => {
    const [form, setForm] = useState({ username: "", email: "", password: "", confirm_password: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (form.password !== form.confirm_password) {
        return showNotif("Passwords do not match", "error");
      }
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("access", data.tokens.access);
          localStorage.setItem("refresh", data.tokens.refresh);
          localStorage.setItem("user", JSON.stringify(data.user));
          setIsAuthenticated(true);
          setUserProfile(data.user);
          showNotif("Registration successful!");
          setActivePage("dashboard");
        } else {
          let errorMsg = "Registration failed.";
          if (data.errors) {
            const firstKey = Object.keys(data.errors)[0];
            errorMsg = Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : JSON.stringify(data.errors);
          }
          showNotif(errorMsg, "error");
        }
      } catch (err) {
        showNotif("Network error", "error");
      }
      setLoading(false);
    };

    return (
      <AuthContainer title="Create an Account">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px", display: "block" }}>Username</label>
            <input type="text" style={s.input} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px", display: "block" }}>Email</label>
            <input type="email" style={s.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px", display: "block" }}>Password (min 6 chars)</label>
            <input type="password" style={s.input} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px", display: "block" }}>Confirm Password</label>
            <input type="password" style={s.input} value={form.confirm_password} onChange={e => setForm({ ...form, confirm_password: e.target.value })} required />
          </div>
          <button type="submit" style={{ ...s.btn("primary"), marginTop: "8px", width: "100%" }} disabled={loading}>
            {loading ? "Registering..." : "Register Free"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: colors.muted }}>
          Already have an account? <span style={{ color: colors.primary, cursor: "pointer", fontWeight: 600 }} onClick={() => setActivePage("login")}>Login</span>
        </div>
      </AuthContainer>
    );
  };

  const renderPage = () => {
    if (activePage === "home") return LandingPage();
    if (activePage === "login") return <LoginPage />;
    if (activePage === "register") return <RegisterPage />;

    const pageMap = {
      dashboard: Dashboard(),
      "ai-detect": AiDetection(),
      map: <MapPage />,
      pickup: PickupPage(),
      rewards: RewardsPage(),
      admin: userProfile?.is_staff ? AdminPage() : Dashboard(),
      education: EducationPage(),
    };
    return pageMap[activePage] || Dashboard();
  };

  const isLanding = activePage === "home" || activePage === "login" || activePage === "register";

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; }
        button:hover { filter: brightness(1.08); transform: translateY(-1px); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .chat-msg { animation: slideIn 0.3s ease; }
        .page-content { animation: fadeIn 0.3s ease; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #22c55e; border-radius: 4px; }
      `}</style>

      {/* Sidebar */}
      {!isLanding && (
        <div style={s.sidebar}>
          <div style={s.sidebarLogo} onClick={() => setSidebarOpen(o => !o)}>
            <span style={{ fontSize: "28px", flexShrink: 0 }}>♻️</span>
            {sidebarOpen && <span style={{ fontWeight: 800, fontSize: "18px", background: "linear-gradient(135deg, #22c55e, #4ade80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", whiteSpace: "nowrap" }}>EcoTrace</span>}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {NAV_ITEMS.filter(item => item.id !== 'admin' || userProfile?.is_staff).map(item => (
              <div key={item.id} style={s.navItem(activePage === item.id)} onClick={() => setActivePage(item.id)}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ fontWeight: 600, fontSize: "14px", whiteSpace: "nowrap" }}>{item.label}</span>}
              </div>
            ))}
          </div>
          <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #22c55e, #4ade80)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>👤</div>
              {sidebarOpen && (
                <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>{userProfile?.username || "Eco Warrior"}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>EcoPoints: {userProfile?.eco_points || 0}</div>
                  </div>
                  <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }} title="Logout">🚪</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={isLanding ? { flex: 1 } : s.main}>
        {/* Topbar */}
        {!isLanding && (
          <div style={s.topbar}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: colors.muted }}>☰</button>
              <div style={{ fontSize: "15px", fontWeight: 600, color: colors.muted }}>
                {NAV_ITEMS.find(n => n.id === activePage)?.label || "Dashboard"}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f0fdf4", padding: "6px 14px", borderRadius: "20px", border: `1px solid #bbf7d0` }}>
                <span style={{ fontSize: "16px" }}>⭐</span>
                <span style={{ fontWeight: 700, fontSize: "14px", color: colors.primary }}>{userProfile?.eco_points || 0} pts</span>
              </div>
              <button onClick={() => setChatOpen(o => !o)} style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "50%", width: "40px", height: "40px", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>💬</button>
              <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #22c55e, #4ade80)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", cursor: "pointer" }}>👤</div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div style={isLanding ? {} : s.content} className="page-content">
          {renderPage()}
        </div>
      </div>

      {/* Chatbot */}
      {chatOpen && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", width: "360px", background: "#fff", borderRadius: "20px", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", zIndex: 200, display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "520px", animation: "slideIn 0.3s ease" }}>
          <div style={{ background: "linear-gradient(135deg, #0f172a, #0d2d1a)", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", background: "#22c55e", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🤖</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>EcoBot</div>
                <div style={{ color: "#86efac", fontSize: "11px" }}>● Online</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button onClick={() => setIsMuted(!isMuted)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "18px", opacity: isMuted ? 0.5 : 1 }} title={isMuted ? "Unmute Bot" : "Mute Bot"}>
                {isMuted ? "🔇" : "🔊"}
              </button>
              <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "20px" }}>×</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "360px" }}>
            {chatMessages.map((msg, i) => (
              <div key={i} className="chat-msg" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? "linear-gradient(135deg, #16a34a, #22c55e)" : "#f1f5f9", color: msg.role === "user" ? "#fff" : colors.text, fontSize: "13px", lineHeight: 1.5 }}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${colors.border}`, display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={startListening}
              style={{ ...s.btn("secondary"), padding: "10px", borderRadius: "50%", background: isListening ? "#fee2e2" : "#f1f5f9", color: isListening ? "#ef4444" : colors.text, animation: isListening ? "pulse 1.5s infinite" : "none" }}
              title="Speak to EcoBot"
            >
              🎤
            </button>
            <input style={{ ...s.input, flex: 1, padding: "10px 14px" }} placeholder={isListening ? "Listening..." : "Ask about recycling..."} value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} />
            <button onClick={sendChat} style={{ ...s.btn("primary"), padding: "10px 16px" }}>↑</button>
          </div>
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
              70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
              100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }
          `}</style>
          <div style={{ padding: "8px 16px 12px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["Battery", "Laptop", "Phone", "TV"].map(q => (
              <button key={q} onClick={() => { setChatInput(q); }} style={{ padding: "5px 10px", borderRadius: "14px", border: `1px solid ${colors.border}`, background: "#fff", cursor: "pointer", fontSize: "12px", color: colors.primary, fontWeight: 600 }}>{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Chat Button (landing only) */}
      {isLanding && (
        <button onClick={() => setChatOpen(o => !o)} style={{ position: "fixed", bottom: "28px", right: "28px", width: "60px", height: "60px", background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "50%", cursor: "pointer", fontSize: "28px", boxShadow: "0 4px 20px rgba(34,197,94,0.4)", zIndex: 100 }}>💬</button>
      )}

      {/* Notification Toast */}
      {notification && (
        <div style={{ position: "fixed", top: "24px", right: "24px", background: "#fff", borderRadius: "14px", padding: "16px 24px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 300, display: "flex", gap: "12px", alignItems: "center", animation: "slideIn 0.3s ease", borderLeft: `4px solid ${notification.type === 'error' ? '#ef4444' : colors.primary}`, maxWidth: "360px" }}>
          <span style={{ fontSize: "20px" }}>{notification.type === 'error' ? '❌' : '✅'}</span>
          <span style={{ fontWeight: 600, fontSize: "14px" }}>{notification.msg}</span>
        </div>
      )}
    </div>
  );
}
