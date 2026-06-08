import { useState, useEffect, useRef } from "react";

// Replace this string with your deployed Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHmBrjd26jgNgLvSUsv3kS7jSAEH0iHYpdASV2-n5dhli9yPocg5xwhGnxmJSdv-8C_A/exec";

/* ─── Google Fonts injected once ─── */
const FontInjector = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght=400;700;900&family=Noto+Sans+KR:wght=300;400;500&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
};

/* ─── Survey data ─── */
const QUESTIONS = [
  {
    id: "gender",
    text: "성별이 어떻게 되십니까?",
    hint: null,
    type: "single",
    options: ["남성", "여성"], 
    next: () => "smokes",
  },
  {
    id: "smokes",
    text: "현재 흡연을 하십니까?",
    hint: null,
    type: "single",
    options: ["예, 현재 흡연 중", "아니오, 비흡연자"], 
    next: (ans) => {
      if (ans === "예, 현재 흡연 중") return "device";
      return "why_not";
    },
  },
  {
    id: "device",
    text: "주로 어떤 방식으로 흡연하십니까?",
    hint: "현재 흡연자에게만 해당됩니다",
    type: "single",
    options: ["일반 담배", "전자 담배 (액상형)", "궐련형 전자담배 (아이코스 등)", "두 가지 이상 병행"],
    next: () => "why_smoke", 
  },
  {
    id: "why_smoke",
    text: "흡연하시는 이유는 무엇입니까?",
    hint: "해당되는 항목을 모두 선택해 주세요",
    type: "multi",
    options: [
      "스트레스 해소를 위해",
      "습관이 되어서",
      "주변 사람들의 영향으로",
      "기타"
    ],
    next: () => null,
  },
  {
    id: "why_not",
    text: "흡연하지 않으시는 이유는 무엇입니까?",
    hint: "해당되는 항목을 모두 선택해 주세요",
    type: "multi",
    options: [
      "건강을 위해",
      "종교적인 이유로",
      "흡연에 관심이 없어서",
      "기타"
    ],
    next: () => null,
  },
];

const getQuestion = (id) => QUESTIONS.find((q) => q.id === id);

/* ─── Smoke particle component ─── */
const SmokeParticle = ({ style }) => (
  <div
    style={{
      position: "absolute",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
      animation: "floatSmoke 8s ease-in-out infinite",
      pointerEvents: "none",
      ...style,
    }}
  />
);

/* ─── Animated number ─── */
const StepIndicator = ({ current, total }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          height: 3,
          flex: i === current ? 2 : 1,
          borderRadius: 2,
          background: i < current ? "#e8c547" : i === current ? "#e8c547" : "rgba(255,255,255,0.15)",
          transition: "all 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          opacity: i > current ? 0.4 : 1,
        }}
      />
    ))}
  </div>
);

/* ─── Option button ─── */
const OptionBtn = ({ label, selected, onClick, multi }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      width: "100%",
      padding: "14px 20px",
      background: selected
        ? "rgba(232,197,71,0.15)"
        : "rgba(255,255,255,0.04)",
      border: selected
        ? "1.5px solid rgba(232,197,71,0.8)"
        : "1.5px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      cursor: "pointer",
      transition: "all 0.2s ease",
      textAlign: "left",
      color: selected ? "#f5e98a" : "rgba(255,255,255,0.75)",
      fontFamily: "'Noto Sans KR', sans-serif",
      fontWeight: selected ? 500 : 300,
      fontSize: 14,
      letterSpacing: "0.01em",
      backdropFilter: "blur(4px)",
      transform: selected ? "translateX(6px)" : "translateX(0)",
    }}
  >
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: multi ? 6 : "50%",
        border: selected ? "2px solid #e8c547" : "2px solid rgba(255,255,255,0.2)",
        background: selected ? "#e8c547" : "transparent",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
    >
      {selected && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          {multi ? (
            <path d="M2 6l3 3 5-5" stroke="#1a1200" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <circle cx="6" cy="6" r="3" fill="#1a1200" />
          )}
        </svg>
      )}
    </span>
    {label}
  </button>
);

/* ─── Welcome / Intro Screen ─── */
const WelcomeScreen = ({ onStart }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Visual Icon Accent */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "24px",
          background: "rgba(232,197,71,0.06)",
          border: "1px solid rgba(232,197,71,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          color: "#e8c547",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 12h-5" />
          <path d="M13 12v4" />
          <path d="M18 16h-5" />
          <path d="M5 12h3a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z" />
          <path d="M18 12c.5 0 2.5-.5 2.5-2.5S18.5 7 18 7M13 12c.5 0 2.5-.5 2.5-2.5S13.5 7 13 7" />
        </svg>
      </div>

      <span
        style={{
          fontSize: 12,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#e8c547",
          fontWeight: 500,
          display: "block",
          marginBottom: 12,
        }}
      >
          흡연 설문조사
      </span>

      <h1
        style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: "clamp(24px, 5vw, 32px)",
          fontWeight: 900,
          lineHeight: 1.4,
          color: "#fff",
          marginBottom: 16,
          letterSpacing: "-0.02em",
        }}
      >
        흡연을 없애기 위해<br />도움을 주세요
      </h1>

      <p
        style={{
          color: "rgba(255,255,255,0.45)",
          fontFamily: "'Noto Sans KR', sans-serif",
          fontWeight: 300,
          fontSize: 14,
          lineHeight: 1.8,
          marginBottom: 36,
          padding: "0 10px",
        }}
      >
        남녀를 대상으로 흡연 현황에 대한 설문조사
      </p>

      <button
        onClick={onStart}
        style={{
          width: "100%",
          padding: "16px 24px",
          background: "linear-gradient(135deg, #e8c547 0%, #f0a500 100%)",
          border: "none",
          borderRadius: 12,
          color: "#1a1200",
          fontFamily: "'Noto Sans KR', sans-serif",
          fontWeight: 600,
          fontSize: 15,
          cursor: "pointer",
          transition: "all 0.3s ease",
          letterSpacing: "0.08em",
          boxShadow: "0 6px 24px rgba(232,197,71,0.25)",
        }}
      >
        설문 시작하기 →
      </button>

      <p
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.25)",
          marginTop: 20,
          fontFamily: "'Noto Sans KR', sans-serif",
        }}
      >
        예상 소요 시간: 약 1분 내외
      </p>
    </div>
  );
};

/* ─── Question screen ─── */
const QuestionScreen = ({ qId, answers, onAnswer, onNext, onBack, stepIndex, totalSteps }) => {
  const q = getQuestion(qId);
  const [visible, setVisible] = useState(false);
  const current = answers[qId] ?? (q.type === "multi" ? [] : null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [qId]);

  const toggle = (opt) => {
    if (q.type === "single") {
      onAnswer(qId, opt);
    } else {
      const arr = current.includes(opt)
        ? current.filter((x) => x !== opt)
        : [...current, opt];
      onAnswer(qId, arr);
    }
  };

  const canProceed = q.type === "single" ? !!current : current.length > 0;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <StepIndicator current={stepIndex} total={totalSteps} />

      {q.hint && (
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#e8c547",
            opacity: 0.7,
            marginBottom: 10,
            fontFamily: "'Noto Sans KR', sans-serif",
            fontWeight: 500,
          }}
        >
          {q.hint}
        </p>
      )}

      <h2
        style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: "clamp(20px, 4vw, 26px)",
          fontWeight: 700,
          lineHeight: 1.5,
          color: "#fff",
          marginBottom: 28,
          letterSpacing: "-0.01em",
        }}
      >
        {q.text}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {q.options.map((opt) => (
          <OptionBtn
            key={opt}
            label={opt}
            selected={q.type === "single" ? current === opt : current.includes(opt)}
            onClick={() => toggle(opt)}
            multi={q.type === "multi"}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {stepIndex > 0 && (
          <button
            onClick={onBack}
            style={{
              padding: "13px 24px",
              background: "rgba(255,255,255,0.06)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ← 이전
          </button>
        )}
        <button
          onClick={() => canProceed && onNext()}
          style={{
            flex: 1,
            padding: "14px 24px",
            background: canProceed
              ? "linear-gradient(135deg, #e8c547 0%, #f0a500 100%)"
              : "rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: 10,
            color: canProceed ? "#1a1200" : "rgba(255,255,255,0.25)",
            fontFamily: "'Noto Sans KR', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            cursor: canProceed ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            letterSpacing: "0.05em",
            boxShadow: canProceed ? "0 4px 20px rgba(232,197,71,0.3)" : "none",
            transform: canProceed ? "scale(1)" : "scale(0.98)",
          }}
        >
          {q.type === "multi" ? `${current.length}개 선택됨 · 다음으로 →` : "다음으로 →"}
        </button>
      </div>
    </div>
  );
};

/* ─── Thank you screen ─── */
const ThankYou = ({ answers, isSending }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.97)",
        transition: "all 0.7s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: isSending ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #e8c547, #f0a500)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 28px",
          fontSize: 36,
          boxShadow: isSending ? "none" : "0 0 40px rgba(232,197,71,0.4)",
          color: isSending ? "#e8c547" : "#1a1200"
        }}
      >
        {isSending ? "⟳" : "✓"}
      </div>
      <h2
        style={{
          fontFamily: "'Noto Serif KR', serif",
          fontSize: 28,
          fontWeight: 900,
          color: "#fff",
          marginBottom: 12,
        }}
      >
        {isSending ? "제출 중입니다..." : "감사합니다!"}
      </h2>
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontFamily: "'Noto Sans KR', sans-serif",
          fontWeight: 300,
          fontSize: 14,
          lineHeight: 1.8,
          marginBottom: 36,
        }}
      >
        {isSending ? "데이터를 시트에 기록하고 있습니다. 잠시만 기다려주세요." : "소중한 응답이 안전하게 기록되었습니다. 본 설문 결과는 통계 분석 연구에 소중히 활용됩니다."}
      </p>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "20px 24px",
          textAlign: "left",
        }}
      >
        <p
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#e8c547",
            opacity: 0.7,
            marginBottom: 14,
          }}
        >
          응답 요약
        </p>
        {Object.entries(answers).map(([k, v]) => {
          const q = getQuestion(k);
          if (!q) return null;
          return (
            <div
              key={k}
              style={{
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'Noto Sans KR',sans-serif", marginBottom: 3 }}>
                {q.text}
              </p>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 500 }}>
                {Array.isArray(v) ? v.join(", ") : v}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Main App ─── */
export default function SmokingSurvey() {
  const [isStarted, setIsStarted] = useState(false); // Controls entry page view
  const [history, setHistory] = useState(["gender"]);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const scrollRef = useRef(null);

  const currentQId = history[history.length - 1];

  const scrollTop = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnswer = (qId, val) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const sendToGoogleSheets = async (finalAnswers) => {
    setIsSending(true);
    const payload = {
      timestamp: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      성별: finalAnswers.gender || "미응답",
      흡연여부: finalAnswers.smokes || "미응답",
      흡연방식: finalAnswers.device || "N/A",
      이유: Array.isArray(finalAnswers.why_smoke)
        ? finalAnswers.why_smoke.join(", ")
        : (Array.isArray(finalAnswers.why_not) ? finalAnswers.why_not.join(", ") : "N/A")
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error("Transmission failed:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleNext = () => {
    if (transitioning) return;
    const q = getQuestion(currentQId);
    const ans = answers[currentQId];
    const nextId = q.next(Array.isArray(ans) ? ans : ans);
    setTransitioning(true);
    setTimeout(() => {
      if (!nextId) {
        setDone(true);
        sendToGoogleSheets(answers);
      } else {
        setHistory((h) => [...h, nextId]);
      }
      setTransitioning(false);
      scrollTop();
    }, 220);
  };

  const handleBack = () => {
    if (transitioning || history.length <= 1) return;
    setTransitioning(true);
    setTimeout(() => {
      setHistory((h) => h.slice(0, -1));
      setTransitioning(false);
      scrollTop();
    }, 200);
  };

  // Adjust total metrics depending on current index routing
  const totalSteps = history.length + (done ? 0 : 1);

  return (
    <>
      <FontInjector />
      <style>{`
        @keyframes floatSmoke {
          0%   { transform: translate(0, 0) scale(1); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { transform: translate(20px, -120px) scale(2.5); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 60px rgba(232,197,71,0.08); }
          50%       { box-shadow: 0 0 90px rgba(232,197,71,0.18); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #0e0c08 0%, #1a1506 50%, #0a0d12 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Noto Sans KR', sans-serif",
        }}
      >
        {[
          { width: 180, height: 180, left: "10%", bottom: "15%", animationDelay: "0s" },
          { width: 120, height: 120, left: "70%", bottom: "25%", animationDelay: "3s" },
          { width: 200, height: 200, left: "40%", bottom: "5%", animationDelay: "6s" },
          { width: 90,  height: 90,  left: "85%", bottom: "40%", animationDelay: "1.5s" },
        ].map((s, i) => <SmokeParticle key={i} style={s} />)}

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div
          ref={scrollRef}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 520,
            maxHeight: "90vh",
            overflowY: "auto",
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "40px 40px 44px",
            animation: "pulseGlow 6s ease-in-out infinite",
            zIndex: 1,
          }}
        >
          {/* Header Progress Tracker - Only displays during active questioning */}
          {isStarted && !done && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                  fontWeight: 500,
                }}
              >
                흡연 실태 설문조사
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#e8c547",
                  opacity: 0.7,
                  fontWeight: 500,
                }}
              >
                {history.length} / {history.length + 1}
              </span>
            </div>
          )}

          <div
            style={{
              opacity: transitioning ? 0 : 1,
              transform: transitioning ? "translateX(-12px)" : "translateX(0)",
              transition: "all 0.22s ease",
            }}
          >
            {!isStarted ? (
              <WelcomeScreen onStart={() => setIsStarted(true)} />
            ) : done ? (
              <ThankYou answers={answers} isSending={isSending} />
            ) : (
              <QuestionScreen
                key={currentQId}
                qId={currentQId}
                answers={answers}
                onAnswer={handleAnswer}
                onNext={handleNext}
                onBack={handleBack}
                stepIndex={history.length - 1}
                totalSteps={totalSteps}
              />
            )}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "20%",
              right: "20%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(232,197,71,0.3), transparent)",
              borderRadius: 1,
            }}
          />
        </div>
      </div>
    </>
  );
}
