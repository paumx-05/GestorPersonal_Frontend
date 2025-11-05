export default function Home() {
  return (
    <main className="landing">
      <div className="hero">
        <h1 className="title">Gestor Finanzas</h1>
        <p className="subtitle">Gestiona tus finanzas de manera inteligente y eficiente</p>
        <div className="cta-buttons">
          <button className="btn btn-primary">Comenzar</button>
          <button className="btn btn-secondary">Saber más</button>
        </div>
      </div>
      
      <section className="features">
        <div className="feature-card">
          <h3>📊 Análisis Completo</h3>
          <p>Visualiza tus ingresos y gastos con gráficos detallados</p>
        </div>
        <div className="feature-card">
          <h3>💼 Control Total</h3>
          <p>Mantén el control de todas tus transacciones financieras</p>
        </div>
        <div className="feature-card">
          <h3>🔒 Seguro</h3>
          <p>Tus datos están protegidos con la máxima seguridad</p>
        </div>
      </section>
    </main>
  )
}

