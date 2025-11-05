// Componente Footer profesional
// Footer con información de la empresa y enlaces importantes

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Sección de enlaces principales */}
        <div className="footer-content">
          <div className="footer-section">
            <h4>Producto</h4>
            <ul>
              <li><a href="#">Características</a></li>
              <li><a href="#">Precios</a></li>
              <li><a href="#">Seguridad</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Empresa</h4>
            <ul>
              <li><a href="#">Sobre Nosotros</a></li>
              <li><a href="#">Contacto</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Términos de Uso</a></li>
              <li><a href="#">Política de Privacidad</a></li>
              <li><a href="#">Cookies</a></li>
            </ul>
          </div>
        </div>

        {/* Línea de copyright */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Gestor Finanzas. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

