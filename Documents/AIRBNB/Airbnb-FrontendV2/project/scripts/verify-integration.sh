#!/bin/bash

# Script de prueba para verificar la integración del módulo de usuarios
# Este script verifica que todos los mocks hayan sido reemplazados por servicios reales

echo "🔍 Verificando integración del módulo de usuarios..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un archivo existe
check_file_exists() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ $1 existe${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 no existe${NC}"
        return 1
    fi
}

# Función para verificar si un archivo contiene texto específico
check_file_contains() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${RED}❌ $1 contiene '$2' (debería ser removido)${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 no contiene '$2'${NC}"
        return 0
    fi
}

# Función para verificar si un archivo contiene imports de servicios reales
check_real_imports() {
    if grep -q "from '@/lib/api/" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅ $1 usa servicios reales${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ $1 podría no estar usando servicios reales${NC}"
        return 1
    fi
}

echo ""
echo "📁 Verificando archivos de servicios API..."

# Verificar que los servicios API existen
check_file_exists "lib/api/auth.ts"
check_file_exists "lib/api/properties.ts"
check_file_exists "lib/api/reservations.ts"
check_file_exists "lib/api/config.ts"

echo ""
echo "🗑️ Verificando que los mocks han sido removidos..."

# Verificar que los archivos mock no existen o han sido reemplazados
if [ -f "lib/auth-mock.ts" ]; then
    echo -e "${RED}❌ lib/auth-mock.ts aún existe (debería ser removido)${NC}"
else
    echo -e "${GREEN}✅ lib/auth-mock.ts ha sido removido${NC}"
fi

echo ""
echo "🔗 Verificando integración en componentes..."

# Verificar que los componentes usan servicios reales
check_real_imports "context/AuthContext.tsx"
check_real_imports "context/SearchContext.tsx"
check_real_imports "context/ReservationCartContext.tsx"
check_real_imports "components/PropertyDetail.tsx"
check_real_imports "components/AirbnbResults.tsx"
check_real_imports "components/ReservationSidebar.tsx"
check_real_imports "hooks/useLocationSearch.ts"

echo ""
echo "🧪 Verificando archivos de prueba..."

# Verificar que los archivos de prueba existen
check_file_exists "tests/user-module-integration.spec.ts"
check_file_exists "playwright.config.ts"
check_file_exists "playwright-flow-user-module-integration.md"

echo ""
echo "📋 Verificando documentación..."

# Verificar que la documentación está actualizada
check_file_exists "playwright-flow-user-module-integration.md"

echo ""
echo "🔍 Verificando que no hay referencias a mocks..."

# Verificar que no hay referencias a mocks en archivos clave
check_file_contains "context/AuthContext.tsx" "auth-mock"
check_file_contains "context/SearchContext.tsx" "mockProperties"
check_file_contains "components/PropertyDetail.tsx" "mockProperties"
check_file_contains "hooks/useLocationSearch.ts" "mockData"

echo ""
echo "📊 Resumen de verificación:"

# Contar archivos de servicios API
api_files=$(find lib/api -name "*.ts" 2>/dev/null | wc -l)
echo -e "Servicios API implementados: ${GREEN}$api_files${NC}"

# Contar archivos de prueba
test_files=$(find tests -name "*.spec.ts" 2>/dev/null | wc -l)
echo -e "Archivos de prueba: ${GREEN}$test_files${NC}"

# Verificar que el backend está configurado
if grep -q "NEXT_PUBLIC_API_URL" "env.example" 2>/dev/null; then
    echo -e "Configuración de backend: ${GREEN}✅ Configurada${NC}"
else
    echo -e "Configuración de backend: ${YELLOW}⚠️ Revisar configuración${NC}"
fi

echo ""
echo "🎯 Próximos pasos:"
echo "1. Ejecutar 'npm run dev' para iniciar el frontend"
echo "2. Asegurar que el backend esté corriendo en puerto 5000"
echo "3. Ejecutar 'npx playwright test' para las pruebas E2E"
echo "4. Verificar que todas las funcionalidades trabajen con el backend real"

echo ""
echo "✅ Verificación completada!"
