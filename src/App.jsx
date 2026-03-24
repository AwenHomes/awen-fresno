import { useState, useRef } from "react";
import { Shell }                          from "./components/Shell.jsx";
import { PrivacyPolicy, TermsOfService, DoNotSell } from "./components/Legal.jsx";
import { LoadingScreen }                  from "./components/LoadingScreen.jsx";
import { StepIntro, StepForm1, StepForm2 } from "./components/Forms.jsx";
import { StepReport }                     from "./components/Report.jsx";
import { StepThankYou }                   from "./components/ThankYou.jsx";
import { generateReport }                 from "./api.js";

const INITIAL_INPUTS = {
  zipCode: "", monthlyBill: 260,
  squareFootage: "", homeAge: "", solarStatus: "", frustrations: [],
};

export default function App() {
  const topRef = useRef(null);

  // All hooks called unconditionally before any conditional returns
  const [step,       setStep]       = useState("intro");
  const [inputs,     setInputs]     = useState(INITIAL_INPUTS);
  const [reportText, setReportText] = useState("");
  const [apiError,   setApiError]   = useState("");

  // Path-based routing for legal pages
  const path = window.location.pathname;
  if (path === "/privacy")     return <PrivacyPolicy />;
  if (path === "/terms")       return <TermsOfService />;
  if (path === "/do-not-sell") return <DoNotSell />;

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goTo(s) { setStep(s); scrollTop(); }

  function handleForm1(data) {
    setInputs(prev => ({ ...prev, ...data }));
    goTo("form2");
  }

  async function handleForm2(data) {
    const allInputs = { ...inputs, ...data };
    setInputs(allInputs);
    setApiError("");
    goTo("loading");

    try {
      const text = await generateReport(allInputs);
      setReportText(text);
      goTo("report");
    } catch {
      setApiError("We had trouble generating your report. Please check your connection and try again.");
      goTo("form2");
    }
  }

  return (
    <Shell topRef={topRef}>
      {step === "intro" && (
        <StepIntro onStart={() => goTo("form1")} />
      )}

      {step === "form1" && (
        <StepForm1 onNext={handleForm1} initialValues={inputs} />
      )}

      {step === "form2" && (
        <>
          {apiError && (
            <div style={{
              background: "#2a0f0f", border: "1px solid #cc4444",
              borderRadius: 10, padding: "14px 16px", marginBottom: 20,
              color: "#ff6b6b", fontSize: 14, lineHeight: 1.5,
            }}>
              {apiError}
            </div>
          )}
          <StepForm2
            onNext={handleForm2}
            onBack={() => { setApiError(""); goTo("form1"); }}
            initialValues={inputs}
          />
        </>
      )}

      {step === "loading" && <LoadingScreen />}

      {step === "report" && (
        <StepReport
          inputs={inputs}
          reportText={reportText}
          onLeadSubmit={() => goTo("thankyou")}
        />
      )}

      {step === "thankyou" && <StepThankYou monthlyBill={inputs.monthlyBill} />}
    </Shell>
  );
}
