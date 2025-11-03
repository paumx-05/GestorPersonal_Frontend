#!/bin/bash

# Script para ejecutar pruebas individuales de endpoints de usuarios
# Basado en la regla @playwright-test

echo "🧪 Ejecutando pruebas individuales de endpoints de usuarios..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar si el backend está corriendo
check_backend() {
    echo -e "${BLUE}🔍 Verificando conexión con el backend...${NC}"
    
    if curl -s http://localhost:5000/api/auth/me > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend está corriendo en puerto 5000${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend no está disponible en puerto 5000${NC}"
        echo -e "${YELLOW}⚠️ Asegúrate de que el backend esté corriendo antes de ejecutar las pruebas${NC}"
        return 1
    fi
}

# Función para verificar si el frontend está corriendo
check_frontend() {
    echo -e "${BLUE}🔍 Verificando conexión con el frontend...${NC}"
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend está corriendo en puerto 3000${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend no está disponible en puerto 3000${NC}"
        echo -e "${YELLOW}⚠️ Ejecuta 'npm run dev' para iniciar el frontend${NC}"
        return 1
    fi
}

# Función para ejecutar pruebas específicas
run_specific_tests() {
    local test_type=$1
    local description=$2
    
    echo -e "${BLUE}🧪 Ejecutando pruebas de: $description${NC}"
    
    case $test_type in
        "registration")
            npx playwright test tests/user-endpoints-individual.spec.ts --grep "User Registration"
            ;;
        "login")
            npx playwright test tests/user-endpoints-individual.spec.ts --grep "User Login"
            ;;
        "profile")
            npx playwright test tests/user-endpoints-individual.spec.ts --grep "User Profile"
            ;;
        "logout")
            npx playwright test tests/user-endpoints-individual.spec.ts --grep "User Logout"
            ;;
        "password-reset")
            npx playwright test tests/user-endpoints-individual.spec.ts --grep "Password Reset"
            ;;
        "session")
            npx playwright test tests/user-endpoints-individual.spec.ts --grep "Session Persistence"
            ;;
        "errors")
            npx playwright test tests/user-endpoints-individual.spec.ts --grep "Error Handling"
            ;;
        "cross-browser")
            npx playwright test tests/user-endpoints-individual.spec.ts --grep "Cross-Browser"
            ;;
        "mobile")
            npx playwright test tests/user-endpoints-individual.spec.ts --grep "Mobile"
            ;;
        "all")
            npx playwright test tests/user-endpoints-individual.spec.ts
            ;;
        *)
            echo -e "${RED}❌ Tipo de prueba no válido: $test_type${NC}"
            return 1
            ;;
    esac
}

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}📋 Uso del script:${NC}"
    echo ""
    echo "  ./run-user-endpoint-tests.sh [tipo_de_prueba]"
    echo ""
    echo -e "${BLUE}Tipos de prueba disponibles:${NC}"
    echo "  registration     - Pruebas de registro de usuarios"
    echo "  login           - Pruebas de inicio de sesión"
    echo "  profile         - Pruebas de perfil de usuario"
    echo "  logout          - Pruebas de cierre de sesión"
    echo "  password-reset  - Pruebas de recuperación de contraseña"
    echo "  session         - Pruebas de persistencia de sesión"
    echo "  errors          - Pruebas de manejo de errores"
    echo "  cross-browser   - Pruebas de compatibilidad entre navegadores"
    echo "  mobile          - Pruebas de responsividad móvil"
    echo "  all             - Ejecutar todas las pruebas"
    echo ""
    echo -e "${BLUE}Ejemplos:${NC}"
    echo "  ./run-user-endpoint-tests.sh login"
    echo "  ./run-user-endpoint-tests.sh all"
    echo ""
}

# Función principal
main() {
    echo -e "${BLUE}🚀 Iniciando pruebas de endpoints de usuarios${NC}"
    echo ""
    
    # Verificar argumentos
    if [ $# -eq 0 ]; then
        show_help
        exit 1
    fi
    
    # Verificar conexiones
    if ! check_backend; then
        echo -e "${YELLOW}⚠️ Continuando sin verificación del backend...${NC}"
    fi
    
    if ! check_frontend; then
        echo -e "${YELLOW}⚠️ Continuando sin verificación del frontend...${NC}"
    fi
    
    echo ""
    
    # Ejecutar pruebas según el tipo especificado
    case $1 in
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            run_specific_tests "$1" "$1"
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}✅ Pruebas completadas${NC}"
    
    # Mostrar reporte si existe
    if [ -f "playwright-report/index.html" ]; then
        echo -e "${BLUE}📊 Reporte generado en: playwright-report/index.html${NC}"
        echo -e "${BLUE}🌐 Abre el reporte en tu navegador para ver los detalles${NC}"
    fi
}

# Ejecutar función principal
main "$@"
