import { useState, useEffect, useRef, useCallback } from "react";

// ─── SAMPLE DATA ────────────────────────────────────────────────────────────
const SAMPLE_DOCTORS = [
  { id: 1, name: "Dr. Priya Sharma", specialty: "Cardiologist", exp: 14, rating: 4.9, reviews: 312, location: "Bandra, Mumbai", distance: "1.2 km", fee: 800, available: true, img: "PS", slots: ["09:00","09:30","10:00","11:00","14:00","15:30"], langs: ["English","Hindi"], verified: true },
  { id: 2, name: "Dr. Arjun Mehta", specialty: "Diabetologist", exp: 10, rating: 4.7, reviews: 198, location: "Andheri, Mumbai", distance: "2.8 km", fee: 600, available: true, img: "AM", slots: ["10:00","11:30","12:00","16:00","17:00"], langs: ["English","Hindi","Marathi"], verified: true },
  { id: 3, name: "Dr. Sunita Rao", specialty: "General Physician", exp: 8, rating: 4.8, reviews: 445, location: "Dadar, Mumbai", distance: "3.5 km", fee: 400, available: false, img: "SR", slots: ["08:30","09:00","14:30","15:00"], langs: ["English","Marathi"], verified: true },
  { id: 4, name: "Dr. Vikram Iyer", specialty: "Neurologist", exp: 18, rating: 4.6, reviews: 123, location: "Juhu, Mumbai", distance: "5.1 km", fee: 1200, available: true, img: "VI", slots: ["11:00","14:00","16:30"], langs: ["English","Tamil","Hindi"], verified: true },
  { id: 5, name: "Dr. Nandita Joshi", specialty: "Gynecologist", exp: 12, rating: 4.9, reviews: 567, location: "Powai, Mumbai", distance: "6.2 km", fee: 900, available: true, img: "NJ", slots: ["09:30","10:30","13:00","14:00","15:30"], langs: ["English","Hindi","Marathi"], verified: true },
  { id: 6, name: "Dr. Rohan Gupta", specialty: "Orthopedist", exp: 9, rating: 4.5, reviews: 89, location: "Kurla, Mumbai", distance: "7.8 km", fee: 700, available: true, img: "RG", slots: ["10:00","11:00","15:00","16:00"], langs: ["English","Hindi"], verified: false },
];

const SPECIALTIES = ["All", "Cardiologist", "Diabetologist", "General Physician", "Neurologist", "Gynecologist", "Orthopedist"];

const SAMPLE_APPOINTMENTS = [
  { id: 1, doctor: "Dr. Priya Sharma", specialty: "Cardiologist", date: "2026-03-28", time: "09:30", status: "upcoming", fee: 800 },
  { id: 2, doctor: "Dr. Arjun Mehta", specialty: "Diabetologist", date: "2026-03-15", time: "11:00", status: "completed", fee: 600 },
  { id: 3, doctor: "Dr. Sunita Rao", specialty: "General Physician", date: "2026-02-20", time: "14:30", status: "completed", fee: 400 },
];

const TRANSLATIONS = {
  en: { home: "Home", doctors: "Doctors", appointments: "Appointments", reports: "Reports", emergency: "Emergency", profile: "Profile", findDoc: "Find a Doctor", bookNow: "Book Now", search: "Search doctors, specialties...", nearby: "Nearby Doctors", myAppts: "My Appointments", uploadReport: "Upload Report", analyzeReport: "Analyze with AI", chatbot: "Health Assistant", sos: "SOS Emergency", disclaimer: "⚕ This app does not replace professional medical advice. Always consult a qualified healthcare professional.", greeting: "Good morning", howAreYou: "How are you feeling today?" },
  hi: { home: "होम", doctors: "डॉक्टर", appointments: "अपॉइंटमेंट", reports: "रिपोर्ट", emergency: "आपातकाल", profile: "प्रोफ़ाइल", findDoc: "डॉक्टर खोजें", bookNow: "अभी बुक करें", search: "डॉक्टर खोजें...", nearby: "नज़दीकी डॉक्टर", myAppts: "मेरी अपॉइंटमेंट", uploadReport: "रिपोर्ट अपलोड करें", analyzeReport: "AI से विश्लेषण करें", chatbot: "स्वास्थ्य सहायक", sos: "आपातकालीन SOS", disclaimer: "⚕ यह ऐप पेशेवर चिकित्सा सलाह का विकल्प नहीं है।", greeting: "शुभ प्रभात", howAreYou: "आज आप कैसा महसूस कर रहे हैं?" },
  mr: { home: "मुखपृष्ठ", doctors: "डॉक्टर", appointments: "भेट", reports: "अहवाल", emergency: "आणीबाणी", profile: "प्रोफाइल", findDoc: "डॉक्टर शोधा", bookNow: "आता बुक करा", search: "डॉक्टर शोधा...", nearby: "जवळचे डॉक्टर", myAppts: "माझ्या भेटी", uploadReport: "अहवाल अपलोड करा", analyzeReport: "AI ने विश्लेषण करा", chatbot: "आरोग्य सहाय्यक", sos: "आपत्कालीन SOS", disclaimer: "⚕ हे ॲप व्यावसायिक वैद्यकीय सल्ल्याची जागा घेत नाही।", greeting: "शुभ प्रभात", howAreYou: "आज तुम्हाला कसे वाटत आहे?" },
};

const CHAT_RESPONSES = {
  "fever": "Based on your query, fever is usually the body's response to infection. Common causes include flu, cold, or bacterial infections. If temperature exceeds 103°F (39.4°C) or persists beyond 3 days, please consult a doctor immediately.",
  "diabetes": "Your report shows elevated blood glucose. Normal fasting glucose is 70-100 mg/dL. Values above 126 mg/dL may indicate diabetes. I recommend consulting Dr. Arjun Mehta (Diabetologist) for expert guidance.",
  "blood pressure": "Normal blood pressure is around 120/80 mmHg. High blood pressure (hypertension) is above 140/90 mmHg. Regular monitoring, reduced salt intake, and exercise can help manage it.",
  "hemoglobin": "Your hemoglobin appears low based on the report. Normal range: Men 13.5–17.5 g/dL, Women 12–15.5 g/dL. Low hemoglobin may indicate anemia. Iron-rich foods and supplements may help.",
  "default": "I'm your HealthBridge AI assistant. I can help explain your medical reports, suggest specialists, or answer general health questions. Please note: this is not medical advice. Always consult a qualified doctor for diagnosis and treatment."
};

// ─── THEME ──────────────────────────────────────────────────────────────────
const theme = {
  primary: "#0066FF",
  primaryDark: "#0047CC",
  primaryLight: "#E8F0FF",
  secondary: "#00C9A7",
  accent: "#FF6B6B",
  warning: "#FFB020",
  success: "#06D6A0",
  text: "#0A0F1E",
  textSecondary: "#6B7280",
  textLight: "#9CA3AF",
  bg: "#F7F9FC",
  bgCard: "#FFFFFF",
  border: "#E5E7EB",
  gradient: "linear-gradient(135deg, #0066FF 0%, #0047CC 100%)",
  gradientSoft: "linear-gradient(135deg, #E8F0FF 0%, #F0F4FF 100%)",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getInitialBg = (initials) => {
  const colors = ["#0066FF","#00C9A7","#FF6B6B","#FFB020","#8B5CF6","#EC4899"];
  const idx = initials.charCodeAt(0) % colors.length;
  return colors[idx];
};

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const frac = rating - full;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={i <= full ? "#FFB020" : i === full+1 && frac >= 0.5 ? "url(#half)" : "#E5E7EB"}>
          <defs><linearGradient id="half"><stop offset="50%" stopColor="#FFB020"/><stop offset="50%" stopColor="#E5E7EB"/></linearGradient></defs>
          <path d="M6 1l1.4 2.8 3.1.5-2.2 2.1.5 3.1L6 8l-2.8 1.5.5-3.1L1.5 4.3l3.1-.5z"/>
        </svg>
      ))}
    </span>
  );
};

const Badge = ({ text, color = theme.primary, bg }) => (
  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, color: color, backgroundColor: bg || color + "15", letterSpacing: "0.3px" }}>{text}</span>
);

const Avatar = ({ initials, size = 40 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: getInitialBg(initials), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.35, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
    {initials}
  </div>
);

const Pill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding: "7px 16px", borderRadius: 999, border: `1.5px solid ${active ? theme.primary : theme.border}`, background: active ? theme.primary : "#fff", color: active ? "#fff" : theme.textSecondary, fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>
    {label}
  </button>
);

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function HealthBridge() {
  const [screen, setScreen] = useState("splash");
  const [authStep, setAuthStep] = useState("role"); // role | email | otp
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [lang, setLang] = useState("en");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingStep, setBookingStep] = useState(null); // null | slot | confirm | success
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointments, setAppointments] = useState(SAMPLE_APPOINTMENTS);
  const [searchQ, setSearchQ] = useState("");
  const [specFilter, setSpecFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [reportAnalysis, setReportAnalysis] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: "ai", text: "Hello! I'm your HealthBridge AI assistant. How can I help you today?" }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [notification, setNotification] = useState(null);
  const [adminTab, setAdminTab] = useState("overview");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sosPressed, setSosPressed] = useState(false);
  const otpInputRefs = useRef([]);
  const chatEndRef = useRef(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const timer = setTimeout(() => setScreen("auth"), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const sendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpCountdown(60);
    setOtpSent(true);
    setAuthStep("otp");
    setOtpError("");
    showNotif(`OTP sent to ${email}: ${code}`, "info");
  };

  const verifyOtp = () => {
    const entered = otp.join("");
    if (entered === generatedOtp) {
      setIsLoggedIn(true);
      setScreen("app");
      setActiveTab("home");
    } else {
      setOtpError("Incorrect OTP. Please try again.");
    }
  };

  const handleOtpChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpInputRefs.current[idx + 1]?.focus();
    if (!val && idx > 0) otpInputRefs.current[idx - 1]?.focus();
  };

  const analyzeReport = async () => {
    setAnalyzeLoading(true);
    await new Promise(r => setTimeout(r, 2500));
    setReportAnalysis({
      summary: "Your blood test report has been analyzed. Here are the key findings explained in simple terms:",
      findings: [
        { label: "Hemoglobin", value: "10.2 g/dL", normal: "12–15.5 g/dL", status: "low", explain: "Your blood's oxygen-carrying capacity is lower than normal. This may cause fatigue and weakness." },
        { label: "Blood Glucose (Fasting)", value: "118 mg/dL", normal: "70–100 mg/dL", status: "high", explain: "Your blood sugar is slightly elevated. This could indicate pre-diabetes. Dietary changes are recommended." },
        { label: "Total Cholesterol", value: "185 mg/dL", normal: "< 200 mg/dL", status: "normal", explain: "Your cholesterol levels are within the healthy range. Keep maintaining a balanced diet." },
        { label: "Vitamin D", value: "18 ng/mL", normal: "30–100 ng/mL", status: "low", explain: "Vitamin D deficiency is detected. Sun exposure and supplements can help." },
        { label: "Thyroid (TSH)", value: "2.8 mIU/L", normal: "0.4–4.0 mIU/L", status: "normal", explain: "Your thyroid function appears normal." },
      ],
      suggestions: ["Consider consulting a Diabetologist for blood sugar management", "Iron supplementation may help improve hemoglobin", "Vitamin D supplements (1000–2000 IU/day) are recommended", "Schedule a follow-up test in 3 months"],
      recommended_doctor: SAMPLE_DOCTORS[1],
    });
    setAnalyzeLoading(false);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(m => [...m, { role: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    let response = CHAT_RESPONSES.default;
    const lower = userMsg.toLowerCase();
    for (const key of Object.keys(CHAT_RESPONSES)) {
      if (lower.includes(key)) { response = CHAT_RESPONSES[key]; break; }
    }
    setChatMessages(m => [...m, { role: "ai", text: response }]);
    setChatLoading(false);
  };

  const bookAppointment = () => {
    if (!selectedSlot || !selectedDoctor) return;
    const newAppt = {
      id: Date.now(),
      doctor: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: "2026-04-02",
      time: selectedSlot,
      status: "upcoming",
      fee: selectedDoctor.fee,
    };
    setAppointments(a => [newAppt, ...a]);
    setBookingStep("success");
    showNotif("Appointment booked successfully!");
  };

  const cancelAppt = (id) => {
    setAppointments(a => a.map(x => x.id === id ? { ...x, status: "cancelled" } : x));
    showNotif("Appointment cancelled.");
  };

  const filteredDoctors = SAMPLE_DOCTORS.filter(d => {
    const matchQ = !searchQ || d.name.toLowerCase().includes(searchQ.toLowerCase()) || d.specialty.toLowerCase().includes(searchQ.toLowerCase());
    const matchSpec = specFilter === "All" || d.specialty === specFilter;
    const matchRating = d.rating >= ratingFilter;
    return matchQ && matchSpec && matchRating;
  });

  // ─── SPLASH ─────────────────────────────────────────────────────────────
  if (screen === "splash") return (
    <div style={{ height: "100dvh", background: theme.gradient, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <rect width="72" height="72" rx="20" fill="rgba(255,255,255,0.15)"/>
          <path d="M36 18v36M18 36h36" stroke="#fff" strokeWidth="6" strokeLinecap="round"/>
          <circle cx="36" cy="36" r="14" stroke="rgba(255,255,255,0.4)" strokeWidth="3"/>
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", fontFamily: "'DM Sans', sans-serif" }}>HealthBridge</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Your trusted health companion</div>
      </div>
      <div style={{ marginTop: 20, display: "flex", gap: 6 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: `rgba(255,255,255,${i===0?1:0.4})`, animation: `dotPulse ${0.6*(i+1)}s ease-in-out infinite` }}/>)}
      </div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}@keyframes dotPulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
    </div>
  );

  // ─── AUTH ────────────────────────────────────────────────────────────────
  if (screen === "auth") return (
    <div style={{ minHeight: "100dvh", background: "#F7F9FC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}>
      {notification && <Notification msg={notification.msg} type={notification.type} />}
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, background: theme.gradient, borderRadius: 16, marginBottom: 16 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4v20M4 14h20" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: theme.text, letterSpacing: "-0.5px" }}>HealthBridge</div>
          <div style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>Your trusted health companion</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: `1px solid ${theme.border}` }}>

          {/* ROLE SELECTION */}
          {authStep === "role" && (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 6 }}>Sign In</div>
              <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 20 }}>Choose your role to continue</div>
              {[{ r: "patient", icon: "👤", label: "I'm a Patient", desc: "Access your health records & book appointments" }, { r: "doctor", icon: "🩺", label: "I'm a Doctor", desc: "Manage your schedule & patient records" }, { r: "admin", icon: "⚙️", label: "Admin", desc: "Manage the platform" }].map(({ r, icon, label, desc }) => (
                <button key={r} onClick={() => { setRole(r); setAuthStep("email"); }} style={{ width: "100%", padding: "14px 16px", marginBottom: 10, borderRadius: 12, border: `1.5px solid ${role === r ? theme.primary : theme.border}`, background: "#fff", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{label}</div>
                    <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 1 }}>{desc}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* EMAIL ENTRY */}
          {authStep === "email" && (
            <>
              <button onClick={() => setAuthStep("role")} style={{ background: "none", border: "none", color: theme.primary, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>← Back</button>
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Enter your email</div>
              <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 20 }}>We'll send a 6-digit OTP to verify</div>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${theme.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", color: theme.text, fontFamily: "'DM Sans', sans-serif" }} />
              <button onClick={sendOtp} disabled={!email.includes("@")} style={{ width: "100%", padding: "13px", marginTop: 14, borderRadius: 10, border: "none", background: email.includes("@") ? theme.gradient : "#E5E7EB", color: "#fff", fontSize: 15, fontWeight: 600, cursor: email.includes("@") ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif" }}>Send OTP</button>
            </>
          )}

          {/* OTP VERIFICATION */}
          {authStep === "otp" && (
            <>
              <button onClick={() => setAuthStep("email")} style={{ background: "none", border: "none", color: theme.primary, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>← Back</button>
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 4 }}>Verify OTP</div>
              <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 4 }}>Enter the 6-digit code sent to</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.primary, marginBottom: 20 }}>{email}</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                {otp.map((d, i) => (
                  <input key={i} ref={el => otpInputRefs.current[i] = el} value={d} onChange={e => handleOtpChange(i, e.target.value)} maxLength={1} inputMode="numeric" style={{ width: 44, height: 52, textAlign: "center", fontSize: 22, fontWeight: 700, borderRadius: 10, border: `2px solid ${d ? theme.primary : theme.border}`, outline: "none", color: theme.text, fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s" }} />
                ))}
              </div>
              {otpError && <div style={{ color: theme.accent, fontSize: 13, textAlign: "center", marginBottom: 10 }}>{otpError}</div>}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                {otpCountdown > 0 ? <span style={{ fontSize: 13, color: theme.textSecondary }}>Resend in <strong style={{ color: theme.primary }}>{otpCountdown}s</strong></span> : <button onClick={sendOtp} style={{ background: "none", border: "none", color: theme.primary, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Resend OTP</button>}
              </div>
              <button onClick={verifyOtp} disabled={otp.join("").length < 6} style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: otp.join("").length === 6 ? theme.gradient : "#E5E7EB", color: "#fff", fontSize: 15, fontWeight: 600, cursor: otp.join("").length === 6 ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif" }}>Verify & Sign In</button>
            </>
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: theme.textLight, padding: "0 16px", lineHeight: 1.5 }}>{t.disclaimer}</div>
      </div>
    </div>
  );

  // ─── MAIN APP ────────────────────────────────────────────────────────────
  if (screen !== "app") return null;

  const renderContent = () => {
    // ADMIN
    if (role === "admin") return <AdminDashboard adminTab={adminTab} setAdminTab={setAdminTab} doctors={SAMPLE_DOCTORS} appointments={appointments} />;

    switch (activeTab) {
      case "home": return <HomeTab t={t} role={role} setActiveTab={setActiveTab} setSelectedDoctor={setSelectedDoctor} setBookingStep={setBookingStep} showSOS={showSOS} setShowSOS={setShowSOS} sosPressed={sosPressed} setSosPressed={setSosPressed} appointments={appointments} />;
      case "doctors": return <DoctorsTab t={t} searchQ={searchQ} setSearchQ={setSearchQ} specFilter={specFilter} setSpecFilter={setSpecFilter} ratingFilter={ratingFilter} setRatingFilter={setRatingFilter} filteredDoctors={filteredDoctors} setSelectedDoctor={setSelectedDoctor} setBookingStep={setBookingStep} />;
      case "appointments": return <AppointmentsTab t={t} appointments={appointments} cancelAppt={cancelAppt} setActiveTab={setActiveTab} />;
      case "reports": return <ReportsTab t={t} reportAnalysis={reportAnalysis} analyzeReport={analyzeReport} analyzeLoading={analyzeLoading} setSelectedDoctor={setSelectedDoctor} setBookingStep={setBookingStep} />;
      case "chat": return <ChatTab t={t} chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput} sendChatMessage={sendChatMessage} chatLoading={chatLoading} chatEndRef={chatEndRef} />;
      case "profile": return <ProfileTab t={t} role={role} lang={lang} setLang={setLang} showLangPicker={showLangPicker} setShowLangPicker={setShowLangPicker} setScreen={setScreen} setAuthStep={setAuthStep} setOtp={setOtp} setIsLoggedIn={setIsLoggedIn} />;
      default: return null;
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", height: "100dvh", display: "flex", flexDirection: "column", background: theme.bg, fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        input:focus { border-color: ${theme.primary} !important; box-shadow: 0 0 0 3px ${theme.primary}22 !important; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { from { background-position: -200px 0; } to { background-position: 200px 0; } }
        @keyframes sosRipple { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .slide-up { animation: slideUp 0.3s ease; }
        .fade-in { animation: fadeIn 0.2s ease; }
      `}</style>

      {/* NOTIFICATION TOAST */}
      {notification && <Notification msg={notification.msg} type={notification.type} />}

      {/* BOOKING MODAL */}
      {selectedDoctor && bookingStep && (
        <BookingModal t={t} doctor={selectedDoctor} step={bookingStep} setStep={setBookingStep} selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot} bookAppointment={bookAppointment} onClose={() => { setSelectedDoctor(null); setBookingStep(null); setSelectedSlot(null); }} />
      )}

      {/* SOS MODAL */}
      {showSOS && <SOSModal t={t} onClose={() => setShowSOS(false)} />}

      {/* TOP BAR */}
      <div style={{ padding: "14px 20px 10px", background: "#fff", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: theme.gradient, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: theme.text, letterSpacing: "-0.3px" }}>HealthBridge</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setShowSOS(true)} style={{ padding: "5px 12px", borderRadius: 999, background: "#FFF0F0", border: "1.5px solid #FFD5D5", color: theme.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 14 }}>🆘</span> SOS
          </button>
          <button onClick={() => setShowLangPicker(!showLangPicker)} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${theme.border}`, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, color: theme.textSecondary }}>
            {lang.toUpperCase()}
          </button>
          {showLangPicker && (
            <div style={{ position: "absolute", top: 56, right: 20, background: "#fff", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: `1px solid ${theme.border}`, zIndex: 1000, overflow: "hidden" }}>
              {[["en","English 🇬🇧"],["hi","हिंदी 🇮🇳"],["mr","मराठी 🟠"]].map(([code, label]) => (
                <button key={code} onClick={() => { setLang(code); setShowLangPicker(false); }} style={{ display: "block", width: "100%", padding: "11px 18px", background: lang === code ? theme.primaryLight : "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: lang === code ? 600 : 400, color: lang === code ? theme.primary : theme.text, textAlign: "left" }}>{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SCROLL CONTENT */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }} className="slide-up">
        {renderContent()}
      </div>

      {/* BOTTOM NAV */}
      {role !== "admin" && (
        <div style={{ background: "#fff", borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0 max(8px, env(safe-area-inset-bottom))", flexShrink: 0 }}>
          {[
            { key: "home", icon: "🏠", label: t.home },
            { key: "doctors", icon: "🩺", label: t.doctors },
            { key: "appointments", icon: "📅", label: "Appts" },
            { key: "reports", icon: "📋", label: t.reports },
            { key: "chat", icon: "💬", label: "AI Chat" },
            { key: "profile", icon: "👤", label: t.profile },
          ].map(({ key, icon, label }) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 6px", flex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: activeTab === key ? theme.primaryLight : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
              </div>
              <span style={{ fontSize: 10, fontWeight: activeTab === key ? 700 : 400, color: activeTab === key ? theme.primary : theme.textLight }}>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── HOME TAB ────────────────────────────────────────────────────────────────
function HomeTab({ t, role, setActiveTab, setSelectedDoctor, setBookingStep, appointments }) {
  const upcomingAppt = appointments.find(a => a.status === "upcoming");
  const healthTips = ["💧 Drink 8 glasses of water daily", "🚶 Walk 30 minutes every day", "😴 Get 7-8 hours of quality sleep", "🥗 Eat more fruits and vegetables"];
  const [tipIdx, setTipIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setTipIdx(i => (i+1) % healthTips.length), 4000); return () => clearInterval(t); }, []);

  return (
    <div style={{ padding: "0 0 16px" }}>
      {/* Hero Banner */}
      <div style={{ background: theme.gradient, padding: "24px 20px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }}/>
        <div style={{ position: "absolute", bottom: -30, right: 40, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}/>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{t.greeting}, {role === "patient" ? "Rahul 👋" : role === "doctor" ? "Dr. Sharma 👨‍⚕️" : "Admin 🛡️"}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4, lineHeight: 1.3 }}>{t.howAreYou}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 20 }}>Let's take care of your health today</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setActiveTab("doctors")} style={{ flex: 1, padding: "11px 0", borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(4px)" }}>{t.findDoc}</button>
          <button onClick={() => setActiveTab("reports")} style={{ flex: 1, padding: "11px 0", borderRadius: 12, background: "#fff", border: "none", color: theme.primary, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t.uploadReport}</button>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Health Tip */}
        <div style={{ background: "#FFF9EC", border: "1.5px solid #FFE9A0", borderRadius: 12, padding: "12px 16px", marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#B45309", marginBottom: 2 }}>DAILY HEALTH TIP</div>
            <div style={{ fontSize: 13, color: "#78350F" }}>{healthTips[tipIdx]}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: "🩺", label: "Find Doctor", color: "#E8F0FF", iconBg: theme.primary, action: () => setActiveTab("doctors") },
              { icon: "📋", label: "My Reports", color: "#E8FBF5", iconBg: "#00C9A7", action: () => setActiveTab("reports") },
              { icon: "💬", label: "AI Assistant", color: "#F0E8FF", iconBg: "#8B5CF6", action: () => setActiveTab("chat") },
              { icon: "📅", label: "Appointments", color: "#FFF0E8", iconBg: "#F97316", action: () => setActiveTab("appointments") },
            ].map(({ icon, label, color, iconBg, action }) => (
              <button key={label} onClick={action} style={{ padding: "16px", borderRadius: 14, background: color, border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, transition: "transform 0.15s" }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Appointment */}
        {upcomingAppt && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 12 }}>Upcoming Appointment</div>
            <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: `1.5px solid ${theme.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar initials={upcomingAppt.doctor.split(" ").map(w=>w[0]).join("").slice(0,2)} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>{upcomingAppt.doctor}</div>
                  <div style={{ fontSize: 12, color: theme.textSecondary }}>{upcomingAppt.specialty}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <Badge text={upcomingAppt.date} color={theme.primary} />
                    <Badge text={upcomingAppt.time} color={theme.secondary} />
                  </div>
                </div>
                <button onClick={() => setActiveTab("appointments")} style={{ padding: "8px 14px", borderRadius: 9, background: theme.primaryLight, border: "none", color: theme.primary, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>View</button>
              </div>
            </div>
          </div>
        )}

        {/* Featured Doctors */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{t.nearby}</div>
            <button onClick={() => setActiveTab("doctors")} style={{ background: "none", border: "none", color: theme.primary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>See all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SAMPLE_DOCTORS.slice(0, 3).map(d => (
              <DoctorCard key={d.id} doctor={d} t={t} onBook={() => { setSelectedDoctor(d); setBookingStep("slot"); }} compact />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: 20, padding: "12px 14px", background: "#F0F4FF", borderRadius: 10, border: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5 }}>{t.disclaimer}</div>
        </div>
      </div>
    </div>
  );
}

// ─── DOCTOR CARD ──────────────────────────────────────────────────────────────
function DoctorCard({ doctor: d, t, onBook, compact }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: compact ? "12px 14px" : "16px", border: `1.5px solid ${theme.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative" }}>
          <Avatar initials={d.img} size={compact ? 44 : 52} />
          {d.available && <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: theme.success, border: "2px solid #fff" }}/>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
            {d.verified && <span title="Verified" style={{ fontSize: 13 }}>✅</span>}
          </div>
          <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 1 }}>{d.specialty} · {d.exp} yrs</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <StarRating rating={d.rating} />
            <span style={{ fontSize: 11, color: theme.textSecondary }}>{d.rating} ({d.reviews})</span>
            <span style={{ fontSize: 11, color: theme.textLight }}>· {d.distance}</span>
          </div>
          {!compact && (
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              {d.langs.map(l => <Badge key={l} text={l} color={theme.textSecondary} />)}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>₹{d.fee}</div>
          <button onClick={onBook} disabled={!d.available} style={{ padding: "7px 14px", borderRadius: 8, background: d.available ? theme.gradient : "#E5E7EB", border: "none", color: d.available ? "#fff" : theme.textLight, fontSize: 12, fontWeight: 600, cursor: d.available ? "pointer" : "not-allowed" }}>
            {d.available ? t.bookNow : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DOCTORS TAB ──────────────────────────────────────────────────────────────
function DoctorsTab({ t, searchQ, setSearchQ, specFilter, setSpecFilter, ratingFilter, setRatingFilter, filteredDoctors, setSelectedDoctor, setBookingStep }) {
  return (
    <div style={{ padding: "16px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 14 }}>{t.findDoc}</div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={t.search} style={{ width: "100%", padding: "11px 14px 11px 38px", borderRadius: 12, border: `1.5px solid ${theme.border}`, fontSize: 14, outline: "none", color: theme.text, fontFamily: "'DM Sans', sans-serif", background: "#fff" }} />
      </div>
      {/* Specialty filter */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
        {SPECIALTIES.map(s => <Pill key={s} label={s} active={specFilter === s} onClick={() => setSpecFilter(s)} />)}
      </div>
      {/* Rating filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[0, 4, 4.5, 4.8].map(r => <Pill key={r} label={r === 0 ? "All Ratings" : `${r}★+`} active={ratingFilter === r} onClick={() => setRatingFilter(r)} />)}
      </div>
      {/* Results */}
      <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 10 }}>{filteredDoctors.length} doctors found</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredDoctors.map(d => (
          <DoctorCard key={d.id} doctor={d} t={t} onBook={() => { setSelectedDoctor(d); setBookingStep("slot"); }} />
        ))}
        {filteredDoctors.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: theme.textSecondary }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
            <div style={{ fontWeight: 600 }}>No doctors found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try different filters</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APPOINTMENTS TAB ─────────────────────────────────────────────────────────
function AppointmentsTab({ t, appointments, cancelAppt, setActiveTab }) {
  const [tab, setTab] = useState("upcoming");
  const filtered = appointments.filter(a => tab === "upcoming" ? a.status === "upcoming" : a.status !== "upcoming");
  const statusColors = { upcoming: theme.primary, completed: theme.success, cancelled: theme.accent };

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 16 }}>{t.myAppts}</div>
      {/* Tabs */}
      <div style={{ display: "flex", background: "#F0F2F5", borderRadius: 10, padding: 3, marginBottom: 16 }}>
        {["upcoming","past"].map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: tab === tb ? "#fff" : "transparent", color: tab === tb ? theme.primary : theme.textSecondary, fontWeight: tab === tb ? 700 : 500, fontSize: 14, cursor: "pointer", boxShadow: tab === tb ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}>
            {tb === "upcoming" ? "Upcoming" : "Past"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: theme.textSecondary }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>No {tab} appointments</div>
          {tab === "upcoming" && <button onClick={() => setActiveTab("doctors")} style={{ marginTop: 16, padding: "11px 24px", borderRadius: 10, background: theme.gradient, border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Book Now</button>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(a => (
            <div key={a.id} style={{ background: "#fff", borderRadius: 14, padding: 16, border: `1.5px solid ${theme.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar initials={a.doctor.split(" ").map(w=>w[0]).join("").slice(1,3)} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>{a.doctor}</div>
                  <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 1 }}>{a.specialty}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    <Badge text={a.date} color={theme.primary} />
                    <Badge text={a.time} color={theme.secondary} />
                    <Badge text={a.status.toUpperCase()} color={statusColors[a.status]} />
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: theme.text, fontSize: 14 }}>₹{a.fee}</div>
              </div>
              {a.status === "upcoming" && (
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => cancelAppt(a.id)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: `1.5px solid ${theme.accent}`, background: "#FFF0F0", color: theme.accent, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                  <button style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: `1.5px solid ${theme.primary}`, background: theme.primaryLight, color: theme.primary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Reschedule</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── REPORTS TAB ──────────────────────────────────────────────────────────────
function ReportsTab({ t, reportAnalysis, analyzeReport, analyzeLoading, setSelectedDoctor, setBookingStep }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const statusColors = { normal: theme.success, low: "#EF4444", high: "#F97316" };
  const statusBgs = { normal: "#ECFDF5", low: "#FEF2F2", high: "#FFF7ED" };
  const statusIcons = { normal: "✅", low: "⬇️", high: "⬆️" };

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 4 }}>{t.uploadReport}</div>
      <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 16 }}>Upload your medical reports for AI analysis</div>

      {/* Upload Box */}
      {!uploaded && !reportAnalysis && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); setUploaded(true); }}
          onClick={() => setUploaded(true)}
          style={{ border: `2px dashed ${dragOver ? theme.primary : theme.border}`, borderRadius: 16, padding: "40px 20px", textAlign: "center", cursor: "pointer", background: dragOver ? theme.primaryLight : "#fff", transition: "all 0.2s", marginBottom: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📤</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 4 }}>Tap to upload or drag & drop</div>
          <div style={{ fontSize: 13, color: theme.textSecondary }}>Supports PDF, JPG, PNG (max 10MB)</div>
        </div>
      )}

      {/* Uploaded State */}
      {uploaded && !reportAnalysis && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ background: "#fff", border: `1.5px solid ${theme.border}`, borderRadius: 14, padding: 16, display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#FFE8E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📄</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>blood_report_march.pdf</div>
              <div style={{ fontSize: 12, color: theme.textSecondary }}>2.4 MB · Uploaded</div>
            </div>
            <Badge text="Ready" color={theme.success} />
          </div>
          <button onClick={analyzeReport} disabled={analyzeLoading} style={{ width: "100%", padding: "13px", borderRadius: 12, background: analyzeLoading ? "#E5E7EB" : theme.gradient, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: analyzeLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'DM Sans', sans-serif" }}>
            {analyzeLoading ? (<><div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/> Analyzing...</>) : ("🧠 " + t.analyzeReport)}
          </button>
        </div>
      )}

      {/* Analysis Results */}
      {reportAnalysis && (
        <div className="fade-in">
          <div style={{ background: theme.gradient, borderRadius: 14, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🧠</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>AI Analysis Complete</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{reportAnalysis.summary}</div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Test Results</div>
            {reportAnalysis.findings.map(f => (
              <div key={f.label} style={{ background: statusBgs[f.status], borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: `1px solid ${statusColors[f.status]}30` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{statusIcons[f.status]}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: theme.text }}>{f.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: statusColors[f.status] }}>{f.value}</span>
                    <Badge text={f.status.toUpperCase()} color={statusColors[f.status]} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 2 }}>Normal: {f.normal}</div>
                <div style={{ fontSize: 12, color: theme.text, marginTop: 4, lineHeight: 1.5 }}>{f.explain}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: `1.5px solid ${theme.border}`, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>💡 AI Suggestions</div>
            {reportAnalysis.suggestions.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span style={{ color: theme.primary, fontWeight: 700 }}>→</span>
                <span style={{ fontSize: 13, color: theme.text, lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: `1.5px solid ${theme.border}`, marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Recommended Doctor</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar initials={reportAnalysis.recommended_doctor.img} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>{reportAnalysis.recommended_doctor.name}</div>
                <div style={{ fontSize: 12, color: theme.textSecondary }}>{reportAnalysis.recommended_doctor.specialty}</div>
                <StarRating rating={reportAnalysis.recommended_doctor.rating} />
              </div>
              <button onClick={() => { setSelectedDoctor(reportAnalysis.recommended_doctor); setBookingStep("slot"); }} style={{ padding: "8px 14px", borderRadius: 9, background: theme.gradient, border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Book</button>
            </div>
          </div>

          <div style={{ padding: "10px 14px", background: "#FFFBEB", borderRadius: 10, border: "1px solid #FDE68A" }}>
            <div style={{ fontSize: 11, color: "#92400E", lineHeight: 1.5 }}>⚠️ Disclaimer: This AI analysis is for informational purposes only and does not constitute medical advice. Please consult a qualified healthcare professional for diagnosis and treatment.</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CHAT TAB ─────────────────────────────────────────────────────────────────
function ChatTab({ t, chatMessages, chatInput, setChatInput, sendChatMessage, chatLoading, chatEndRef }) {
  const suggestions = ["Explain my report", "What is diabetes?", "High blood pressure tips", "Vitamin D deficiency"];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F7F9FC" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", background: "#fff", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>HealthBridge AI</div>
          <div style={{ fontSize: 12, color: theme.success, display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: theme.success, display: "inline-block" }}/>Online</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {chatMessages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "slideUp 0.2s ease" }}>
            {m.role === "ai" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, marginRight: 8, alignSelf: "flex-end" }}>🤖</div>
            )}
            <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? theme.gradient : "#fff", color: m.role === "user" ? "#fff" : theme.text, fontSize: 13, lineHeight: 1.6, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: m.role === "ai" ? `1px solid ${theme.border}` : "none" }}>
              {m.text}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: "#fff", border: `1px solid ${theme.border}`, display: "flex", gap: 4 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: theme.textLight, animation: `dotPulse ${0.4 + i*0.2}s ease-in-out infinite` }}/>)}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestions */}
      {chatMessages.length < 3 && (
        <div style={{ padding: "0 16px 8px", display: "flex", gap: 8, overflowX: "auto" }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => { setChatInput(s); }} style={{ whiteSpace: "nowrap", padding: "7px 12px", borderRadius: 999, border: `1.5px solid ${theme.border}`, background: "#fff", color: theme.textSecondary, fontSize: 12, cursor: "pointer" }}>{s}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "10px 16px 16px", background: "#fff", borderTop: `1px solid ${theme.border}`, display: "flex", gap: 10 }}>
        <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChatMessage()} placeholder="Ask about your health..." style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${theme.border}`, fontSize: 14, outline: "none", color: theme.text, fontFamily: "'DM Sans', sans-serif" }} />
        <button onClick={sendChatMessage} style={{ width: 44, height: 44, borderRadius: 12, background: theme.gradient, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M18 10L2 3l3.5 7L2 17l16-7z" fill="#fff"/></svg>
        </button>
      </div>
    </div>
  );
}

// ─── PROFILE TAB ──────────────────────────────────────────────────────────────
function ProfileTab({ t, role, lang, setLang, showLangPicker, setShowLangPicker, setScreen, setAuthStep, setOtp, setIsLoggedIn }) {
  const patientData = { name: "Rahul Verma", age: 32, gender: "Male", blood: "B+", email: "rahul.verma@email.com", phone: "+91 98765 43210", conditions: ["Hypertension", "Pre-diabetes"], allergies: ["Penicillin"], reports: 4 };
  const doctorData = { name: "Dr. Priya Sharma", specialty: "Cardiologist", exp: 14, rating: 4.9, patients: 1240, location: "Bandra, Mumbai", email: "dr.priya@healthbridge.in", license: "MCI-2010-12345" };
  const data = role === "doctor" ? doctorData : patientData;

  return (
    <div style={{ padding: "16px" }}>
      {/* Profile Card */}
      <div style={{ background: theme.gradient, borderRadius: 18, padding: "24px 20px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }}/>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#fff", fontWeight: 800, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
            {data.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>{data.name}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{role === "patient" ? `Age ${data.age} · ${data.gender} · ${data.blood}` : `${data.specialty} · ${data.exp} yrs`}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{data.email}</div>
          </div>
        </div>
        {role === "patient" && (
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {[{ label: "Reports", val: data.reports },{ label: "Appointments", val: 5 },{ label: "Doctors", val: 3 }].map(({ label, val }) => (
              <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 0", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{label}</div>
              </div>
            ))}
          </div>
        )}
        {role === "doctor" && (
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {[{ label: "Patients", val: data.patients },{ label: "Rating", val: data.rating },{ label: "Experience", val: `${data.exp}y` }].map(({ label, val }) => (
              <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 0", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{val}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medical Info (Patient) */}
      {role === "patient" && (
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, border: `1.5px solid ${theme.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: theme.text, marginBottom: 12 }}>Medical History</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 6 }}>Conditions</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{patientData.conditions.map(c => <Badge key={c} text={c} color={theme.accent} />)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 6 }}>Allergies</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{patientData.allergies.map(a => <Badge key={a} text={a} color={theme.warning} />)}</div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div style={{ background: "#fff", borderRadius: 14, border: `1.5px solid ${theme.border}`, overflow: "hidden", marginBottom: 12 }}>
        {[
          { icon: "🌐", label: "Language", right: lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "मराठी", action: () => setShowLangPicker(!showLangPicker) },
          { icon: "🔔", label: "Notifications", right: "On" },
          { icon: "🔒", label: "Privacy & Security" },
          { icon: "❓", label: "Help & Support" },
          { icon: "⭐", label: "Rate the App" },
          { icon: "📝", label: "Terms & Privacy" },
        ].map(({ icon, label, right, action }, i, arr) => (
          <button key={label} onClick={action} style={{ display: "flex", alignItems: "center", width: "100%", padding: "14px 16px", background: "#fff", border: "none", borderBottom: i < arr.length - 1 ? `1px solid ${theme.border}` : "none", cursor: "pointer", gap: 12 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ flex: 1, fontSize: 14, color: theme.text, textAlign: "left", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
            <span style={{ fontSize: 13, color: theme.textSecondary }}>{right || "›"}</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <button onClick={() => { setScreen("auth"); setAuthStep("role"); setOtp(["","","","","",""]); setIsLoggedIn(false); }} style={{ width: "100%", padding: "13px", borderRadius: 12, background: "#FFF0F0", border: "1.5px solid #FFD5D5", color: theme.accent, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
        🚪 Sign Out
      </button>

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: theme.textLight }}>HealthBridge v1.0.0 · Made with ❤️ for India</div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard({ adminTab, setAdminTab, doctors, appointments }) {
  const stats = [{ label: "Total Users", val: "12,847", icon: "👥", color: "#E8F0FF", accent: theme.primary }, { label: "Doctors", val: "284", icon: "🩺", color: "#E8FBF5", accent: theme.secondary }, { label: "Appointments Today", val: "342", icon: "📅", color: "#FFF0E8", accent: "#F97316" }, { label: "Reports Analyzed", val: "1,204", icon: "📋", color: "#F0E8FF", accent: "#8B5CF6" }];
  return (
    <div style={{ padding: "16px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: theme.text, marginBottom: 4 }}>Admin Dashboard</div>
      <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 16 }}>Platform Overview</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: s.color, borderRadius: 14, padding: "14px" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.accent }}>{s.val}</div>
            <div style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["overview","doctors","users"].map(tab => (
          <Pill key={tab} label={tab.charAt(0).toUpperCase()+tab.slice(1)} active={adminTab === tab} onClick={() => setAdminTab(tab)} />
        ))}
      </div>

      {adminTab === "doctors" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {doctors.map(d => (
            <div key={d.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", border: `1.5px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={d.img} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: theme.text }}>{d.name}</div>
                <div style={{ fontSize: 12, color: theme.textSecondary }}>{d.specialty}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Badge text={d.available ? "Active" : "Inactive"} color={d.available ? theme.success : theme.accent} />
                <Badge text={d.verified ? "Verified" : "Pending"} color={d.verified ? theme.primary : theme.warning} />
              </div>
            </div>
          ))}
        </div>
      )}

      {adminTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: `1.5px solid ${theme.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: theme.text, marginBottom: 12 }}>Recent Activity</div>
            {[{ time: "2 min ago", action: "New patient registered", icon: "👤" }, { time: "15 min ago", action: "Dr. Arjun Mehta — appointment booked", icon: "📅" }, { time: "1 hr ago", action: "Medical report analyzed", icon: "🧠" }, { time: "2 hr ago", action: "Emergency SOS triggered — resolved", icon: "🆘" }].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${theme.border}` : "none" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: theme.text }}>{item.action}</div>
                  <div style={{ fontSize: 11, color: theme.textSecondary }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminTab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[{ name: "Rahul Verma", email: "rahul@email.com", type: "Patient", joined: "Mar 2026" }, { name: "Sneha Patel", email: "sneha@email.com", type: "Patient", joined: "Feb 2026" }, { name: "Dr. Arjun Mehta", email: "arjun@dr.com", type: "Doctor", joined: "Jan 2026" }].map((u, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", border: `1.5px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={u.name.split(" ").map(w=>w[0]).join("").slice(0,2)} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: theme.text }}>{u.name}</div>
                <div style={{ fontSize: 12, color: theme.textSecondary }}>{u.email}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <Badge text={u.type} color={u.type === "Doctor" ? theme.primary : theme.secondary} />
                <span style={{ fontSize: 11, color: theme.textLight }}>{u.joined}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BOOKING MODAL ────────────────────────────────────────────────────────────
function BookingModal({ t, doctor: d, step, setStep, selectedSlot, setSelectedSlot, bookAppointment, onClose }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxHeight: "85vh", overflowY: "auto", animation: "slideUp 0.3s ease" }}>
        <div style={{ width: 36, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "12px auto 0" }}/>

        {step === "slot" && (
          <div style={{ padding: "20px 20px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <Avatar initials={d.img} size={52} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: theme.text }}>{d.name}</div>
                <div style={{ fontSize: 13, color: theme.textSecondary }}>{d.specialty} · ₹{d.fee}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><StarRating rating={d.rating} /><span style={{ fontSize: 12, color: theme.textSecondary }}>{d.rating}</span></div>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: theme.text, marginBottom: 12 }}>Select Time Slot</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}><Badge text="📅 Wed, Apr 2, 2026" color={theme.primary} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
              {d.slots.map(s => (
                <button key={s} onClick={() => setSelectedSlot(s)} style={{ padding: "10px 0", borderRadius: 10, border: `1.5px solid ${selectedSlot === s ? theme.primary : theme.border}`, background: selectedSlot === s ? theme.primaryLight : "#fff", color: selectedSlot === s ? theme.primary : theme.text, fontWeight: selectedSlot === s ? 700 : 500, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{s}</button>
              ))}
            </div>
            <button onClick={() => selectedSlot && setStep("confirm")} disabled={!selectedSlot} style={{ width: "100%", padding: "13px", borderRadius: 12, background: selectedSlot ? theme.gradient : "#E5E7EB", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: selectedSlot ? "pointer" : "not-allowed", fontFamily: "'DM Sans', sans-serif" }}>Continue</button>
          </div>
        )}

        {step === "confirm" && (
          <div style={{ padding: "20px 20px 32px" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: theme.text, marginBottom: 20 }}>Confirm Booking</div>
            {[{ label: "Doctor", val: d.name }, { label: "Specialty", val: d.specialty }, { label: "Date", val: "Wed, Apr 2, 2026" }, { label: "Time", val: selectedSlot }, { label: "Location", val: d.location }, { label: "Consultation Fee", val: `₹${d.fee}` }].map(({ label, val }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ fontSize: 13, color: theme.textSecondary }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{val}</span>
              </div>
            ))}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={bookAppointment} style={{ width: "100%", padding: "13px", borderRadius: 12, background: theme.gradient, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>✓ Confirm & Pay ₹{d.fee}</button>
              <button onClick={() => setStep("slot")} style={{ width: "100%", padding: "13px", borderRadius: 12, background: "transparent", border: `1.5px solid ${theme.border}`, color: theme.textSecondary, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Change Slot</button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 36 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: theme.text, marginBottom: 8 }}>Booking Confirmed!</div>
            <div style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>Your appointment with <strong>{d.name}</strong> is confirmed for <strong>April 2, 2026 at {selectedSlot}</strong>.<br/>A confirmation has been sent to your email.</div>
            <button onClick={onClose} style={{ width: "100%", padding: "13px", borderRadius: 12, background: theme.gradient, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SOS MODAL ────────────────────────────────────────────────────────────────
function SOSModal({ t, onClose }) {
  const [calling, setCalling] = useState(false);
  const [calledNum, setCalledNum] = useState(null);
  const contacts = [{ name: "Ambulance", num: "108", icon: "🚑" }, { name: "Emergency", num: "112", icon: "🆘" }, { name: "Police", num: "100", icon: "👮" }, { name: "Fire Brigade", num: "101", icon: "🚒" }];
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 380, animation: "slideUp 0.3s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🆘</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#D00000" }}>Emergency SOS</div>
          <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>Select an emergency service to call</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {contacts.map(c => (
            <button key={c.num} onClick={() => { setCalledNum(c.num); setCalling(true); setTimeout(() => setCalling(false), 2000); }} style={{ padding: "16px 12px", borderRadius: 14, background: calling && calledNum === c.num ? "#FFF0F0" : "#fff", border: `2px solid ${calling && calledNum === c.num ? "#D00000" : "#FECACA"}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 28 }}>{c.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: theme.text }}>{c.name}</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#D00000" }}>{c.num}</span>
              {calling && calledNum === c.num && <span style={{ fontSize: 11, color: "#D00000" }}>Calling...</span>}
            </button>
          ))}
        </div>
        <div style={{ padding: "12px 14px", background: "#FFF0F0", borderRadius: 10, border: "1px solid #FECACA", marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "#7F1D1D", lineHeight: 1.5 }}>📍 Your location: Bandra West, Mumbai, 400050<br/>Nearest hospital: Lilavati Hospital (1.4 km)</div>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "#F5F5F5", border: "none", color: theme.textSecondary, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Close</button>
      </div>
    </div>
  );
}

// ─── NOTIFICATION TOAST ───────────────────────────────────────────────────────
function Notification({ msg, type }) {
  const colors = { success: "#ECFDF5", error: "#FEF2F2", info: "#EFF6FF" };
  const borders = { success: "#A7F3D0", error: "#FECACA", info: "#BFDBFE" };
  const textColors = { success: "#065F46", error: "#991B1B", info: "#1E40AF" };
  return (
    <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: colors[type] || colors.success, border: `1.5px solid ${borders[type] || borders.success}`, color: textColors[type] || textColors.success, padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 9999, animation: "slideUp 0.3s ease", whiteSpace: "nowrap", maxWidth: "90vw", overflow: "hidden", textOverflow: "ellipsis", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontFamily: "'DM Sans', sans-serif" }}>
      {msg}
    </div>
  );
}
