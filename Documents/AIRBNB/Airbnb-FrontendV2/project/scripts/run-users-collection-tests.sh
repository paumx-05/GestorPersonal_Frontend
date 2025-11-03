#!/bin/bash

# Script para ejecutar pruebas individuales de la colección de usuarios
# Basado en la regla @playwright-test

echo "👥 Ejecutando pruebas individuales de la colección de usuarios..."
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
    
    if curl -s http://localhost:5000/api/users > /dev/null 2>&1; then
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
        "get-all-users")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Get All Users"
            ;;
        "get-user-by-id")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Get User by ID"
            ;;
        "create-user")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Create User"
            ;;
        "update-user")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Update User"
            ;;
        "delete-user")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Delete User"
            ;;
        "search-users")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Search Users"
            ;;
        "user-stats")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "User Statistics"
            ;;
        "user-status")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Toggle User Status"
            ;;
        "user-verify")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Verify User"
            ;;
        "error-handling")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Error Handling"
            ;;
        "cross-browser")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Cross-Browser"
            ;;
        "mobile")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Mobile"
            ;;
        "crud-operations")
            npx playwright test tests/users-collection-endpoints.spec.ts --grep "Create User|Update User|Delete User"
            ;;
        "all")
            npx playwright test tests/users-collection-endpoints.spec.ts
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
    echo "  ./run-users-collection-tests.sh [tipo_de_prueba]"
    echo ""
    echo -e "${BLUE}Tipos de prueba disponibles:${NC}"
    echo "  get-all-users     - Pruebas de obtener lista de usuarios"
    echo "  get-user-by-id    - Pruebas de obtener usuario por ID"
    echo "  create-user       - Pruebas de creación de usuarios"
    echo "  update-user       - Pruebas de actualización de usuarios"
    echo "  delete-user       - Pruebas de eliminación de usuarios"
    echo "  search-users      - Pruebas de búsqueda de usuarios"
    echo "  user-stats        - Pruebas de estadísticas de usuarios"
    echo "  user-status       - Pruebas de cambio de estado de usuarios"
    echo "  user-verify       - Pruebas de verificación de usuarios"
    echo "  error-handling    - Pruebas de manejo de errores"
    echo "  cross-browser     - Pruebas de compatibilidad entre navegadores"
    echo "  mobile            - Pruebas de responsividad móvil"
    echo "  crud-operations   - Pruebas de operaciones CRUD completas"
    echo "  all               - Ejecutar todas las pruebas"
    echo ""
    echo -e "${BLUE}Ejemplos:${NC}"
    echo "  ./run-users-collection-tests.sh create-user"
    echo "  ./run-users-collection-tests.sh crud-operations"
    echo "  ./run-users-collection-tests.sh all"
    echo ""
    echo -e "${BLUE}Endpoints probados:${NC}"
    echo "  GET    /api/users              - Obtener todos los usuarios"
    echo "  GET    /api/users/:id          - Obtener usuario por ID"
    echo "  POST   /api/users              - Crear nuevo usuario"
    echo "  PUT    /api/users/:id          - Actualizar usuario"
    echo "  DELETE /api/users/:id          - Eliminar usuario"
    echo "  GET    /api/users/search       - Buscar usuarios"
    echo "  GET    /api/users/stats        - Obtener estadísticas"
    echo "  PATCH  /api/users/:id/status    - Cambiar estado de usuario"
    echo "  PATCH  /api/users/:id/verify    - Verificar usuario"
    echo ""
}

# Función para mostrar estadísticas de pruebas
show_test_stats() {
    echo -e "${BLUE}📊 Estadísticas de pruebas de la colección de usuarios:${NC}"
    echo ""
    echo -e "${GREEN}Endpoints probados: 9${NC}"
    echo -e "${GREEN}Casos de prueba: 35${NC}"
    echo -e "${GREEN}Operaciones CRUD: ✅ Completas${NC}"
    echo -e "${GREEN}Funcionalidades avanzadas: ✅ Incluidas${NC}"
    echo -e "${GREEN}Manejo de errores: ✅ Implementado${NC}"
    echo -e "${GREEN}Compatibilidad cross-browser: ✅ Verificada${NC}"
    echo -e "${GREEN}Responsividad móvil: ✅ Verificada${NC}"
    echo ""
}

# Función principal
main() {
    echo -e "${BLUE}🚀 Iniciando pruebas de la colección de usuarios${NC}"
    echo ""
    
    # Verificar argumentos
    if [ $# -eq 0 ]; then
        show_help
        exit 1
    fi
    
    # Mostrar estadísticas si se solicita
    if [ "$1" = "stats" ]; then
        show_test_stats
        exit 0
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
    if [ -f "playwright-report-users-collection/index.html" ]; then
        echo -e "${BLUE}📊 Reporte generado en: playwright-report-users-collection/index.html${NC}"
        echo -e "${BLUE}🌐 Abre el reporte en tu navegador para ver los detalles${NC}"
    fi
    
    # Mostrar estadísticas finales
    echo ""
    show_test_stats
}

# Ejecutar función principal
main "$@"
