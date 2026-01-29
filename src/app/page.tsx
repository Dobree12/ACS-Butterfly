import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      <div className="background-pattern" />
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <h1>ACS BUTTERFLY</h1>
          <p className="subtitle">Club de tenis de masă · Cluj-Napoca</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/dashboard" className="cta-button">
              Vezi Dashboard
            </Link>
            <Link href="/auth" className="cta-button">
              Autentificare
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
