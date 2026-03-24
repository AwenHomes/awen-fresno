import { D } from "../constants.js";
import { LegalShell } from "./Shell.jsx";

const H = ({ children }) => (
  <h3 style={{ color: D.teal, marginTop: 28, marginBottom: 10, fontSize: 16, fontWeight: 700 }}>{children}</h3>
);
const P = ({ children }) => <p style={{ marginBottom: 14 }}>{children}</p>;

export function PrivacyPolicy() {
  return (
    <LegalShell title="Privacy Policy">
      <P><strong>Effective Date:</strong> March 2026</P>
      <P>Awen Energy LLC ("we," "us," or "our") respects your privacy. This Privacy Policy describes how we collect, use, disclose, and protect your personal information when you visit our website or submit a lead form.</P>

      <H>Information We Collect</H>
      <P>When you use our AI-powered cost report tool and submit the lead capture form, we collect: your name, email address, phone number, zip code, estimated monthly electricity bill, home size, home age, solar status, your stated frustrations, city, state, the date and time you provided consent, the URL of the page where consent was given, your browser user agent string, and which contact methods you authorized (phone, text, email).</P>

      <H>How We Use Your Information</H>
      <P>We use the information you provide to: (a) generate and deliver your personalized AI-powered PG&E cost report; (b) contact you by phone, text, or email about solar energy products and services as authorized by your specific consent selections; (c) improve our website and services; and (d) comply with legal obligations including TCPA consent recordkeeping requirements (minimum 5-year retention).</P>

      <H>Sharing of Information</H>
      <P>We do not sell your personal information. Your information will not be sold, shared with, or used by any other company. We may share your information with service providers who assist us in delivering our services (such as our CRM and scheduling platforms under data processing agreements), and as required by law.</P>

      <H>Your California Privacy Rights (CCPA/CPRA)</H>
      <P>If you are a California resident, you have the right to: (a) know what personal information we collect about you; (b) request deletion of your personal information; (c) request correction of inaccurate personal information; (d) opt out of the sale or sharing of your personal information; and (e) not be discriminated against for exercising your privacy rights. To exercise any of these rights, contact us at <a href="mailto:privacy@awenenergy.com">privacy@awenenergy.com</a>. We will respond within 45 days.</P>

      <H>Do Not Call Registry</H>
      <P>We honor the Federal Do Not Call Registry and the California State Do Not Call List. If you have registered your phone number on either list, we will only contact you if you have provided your prior express written consent to receive calls from Awen Energy LLC specifically.</P>

      <H>Data Retention</H>
      <P>We retain your personal information for as long as necessary to fulfill the purposes described in this policy, and for a minimum of 5 years for TCPA consent records as required by the FCC.</P>

      <H>Contact Us</H>
      <P>Awen Energy LLC<br />Email: <a href="mailto:privacy@awenenergy.com">privacy@awenenergy.com</a></P>
    </LegalShell>
  );
}

export function TermsOfService() {
  return (
    <LegalShell title="Terms of Service">
      <P><strong>Effective Date:</strong> March 2026</P>
      <P>By using this website, you agree to these Terms of Service. If you do not agree, please do not use our website.</P>

      <H>Use of This Website</H>
      <P>This website provides educational AI-generated cost projection reports and lead capture services for solar energy consultations. The projections and AI-generated content displayed are estimates based on publicly available PG&E rate data and historical trends. They do not constitute financial advice, guarantees, or binding offers.</P>

      <H>AI-Generated Content</H>
      <P>The personalized report generated for you is produced by an AI model (Anthropic Claude) based on your inputs and publicly available data. While we strive for accuracy, AI-generated content may contain errors or inaccuracies. Always verify projections with a licensed professional before making financial decisions.</P>

      <H>Consent to Communications</H>
      <P>By submitting the lead form and checking the applicable consent checkboxes, you provide your prior express written consent under the Telephone Consumer Protection Act (TCPA) for Awen Energy LLC to contact you using the specific methods you authorized. Automated technology including autodialed calls, prerecorded messages, and automated texts may be used. You may revoke consent at any time by replying STOP to any text message, using the unsubscribe link in any email, or contacting us at <a href="mailto:privacy@awenenergy.com">privacy@awenenergy.com</a>. We will honor revocation requests within 10 business days.</P>

      <H>Limitation of Liability</H>
      <P>Awen Energy LLC shall not be liable for any damages arising from your use of this website or reliance on the projections or AI-generated content provided. Solar savings depend on system size, design, orientation, usage patterns, and financing terms.</P>

      <H>Contact Us</H>
      <P>Awen Energy LLC<br />Email: <a href="mailto:info@awenenergy.com">info@awenenergy.com</a></P>
    </LegalShell>
  );
}

export function DoNotSell() {
  return (
    <LegalShell title="Do Not Sell or Share My Personal Information">
      <P>Under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA), California residents have the right to opt out of the sale or sharing of their personal information.</P>
      <P><strong style={{ color: D.white }}>Awen Energy LLC does not sell your personal information.</strong> We do not share your personal information with third parties for cross-context behavioral advertising purposes.</P>
      <P>If you would like to submit a request regarding your personal data — including requests to know, delete, or correct your information — please contact us at:</P>
      <P><strong style={{ color: D.white }}>Email:</strong> <a href="mailto:privacy@awenenergy.com">privacy@awenenergy.com</a></P>
      <P>We honor Global Privacy Control (GPC) browser signals as valid opt-out requests. We will respond to all verified consumer requests within 45 days, extendable by an additional 45 days when reasonably necessary.</P>
    </LegalShell>
  );
}
