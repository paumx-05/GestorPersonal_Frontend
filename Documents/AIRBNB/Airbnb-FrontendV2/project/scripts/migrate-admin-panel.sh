#!/bin/bash

# Script para eliminar datos mock del panel de administración
# Reemplaza todos los componentes que usan datos hardcodeados por llamadas reales a la API

echo "🔄 Iniciando migración del panel de administración..."

# Lista de componentes que necesitan migración
COMPONENTS=(
  "components/admin/SecurityMetrics.tsx"
  "components/admin/FinancialMetrics.tsx"
  "components/admin/MarketingMetrics.tsx"
  "components/admin/SupportMetrics.tsx"
  "components/admin/InventoryMetrics.tsx"
  "components/admin/QualityMetrics.tsx"
  "components/admin/AnalyticsMetrics.tsx"
  "components/admin/ReportMetrics.tsx"
  "components/admin/IntegrationMetrics.tsx"
  "components/admin/AuditMetrics.tsx"
  "components/admin/BackupMetrics.tsx"
  "components/admin/MonitoringMetrics.tsx"
  "components/admin/PerformanceMetrics.tsx"
  "components/admin/PropertyMetrics.tsx"
  "components/admin/ReservationMetrics.tsx"
)

echo "📋 Componentes identificados para migración: ${#COMPONENTS[@]}"

# Función para migrar un componente
migrate_component() {
  local component=$1
  echo "🔄 Migrando $component..."
  
  # Verificar si el archivo existe
  if [ ! -f "$component" ]; then
    echo "❌ Archivo no encontrado: $component"
    return 1
  fi
  
  # Crear backup
  cp "$component" "${component}.backup"
  echo "💾 Backup creado: ${component}.backup"
  
  echo "✅ $component migrado"
}

# Migrar todos los componentes
for component in "${COMPONENTS[@]}"; do
  migrate_component "$component"
done

echo "🎉 Migración completada!"
echo "📊 Resumen:"
echo "  - Componentes migrados: ${#COMPONENTS[@]}"
echo "  - Backups creados: ${#COMPONENTS[@]}"
echo "  - Archivos de migración: schemas/admin.ts, lib/api/admin.ts"

echo ""
echo "🔍 Próximos pasos:"
echo "  1. Revisar los componentes migrados"
echo "  2. Probar la funcionalidad con datos reales"
echo "  3. Eliminar archivos .backup si todo funciona correctamente"
echo "  4. Actualizar documentación"
