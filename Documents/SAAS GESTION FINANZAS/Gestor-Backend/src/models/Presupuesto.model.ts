import mongoose, { Document, Schema } from 'mongoose';

export interface IPresupuesto extends Document {
  userId: mongoose.Types.ObjectId;
  mes: string;
  categoria: string;
  monto: number;
  porcentaje?: number;
  totalIngresos: number;
  carteraId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PresupuestoSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El userId es requerido']
    },
    mes: {
      type: String,
      required: [true, 'El mes es requerido'],
      enum: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es requerida'],
      trim: true
    },
    monto: {
      type: Number,
      required: [true, 'El monto es requerido'],
      min: [0, 'El monto debe ser mayor o igual a 0']
    },
    porcentaje: {
      type: Number,
      min: [0, 'El porcentaje debe ser mayor o igual a 0'],
      max: [100, 'El porcentaje no puede ser mayor a 100']
    },
    totalIngresos: {
      type: Number,
      required: [true, 'El total de ingresos es requerido'],
      min: [0, 'El total de ingresos debe ser mayor o igual a 0']
    },
    carteraId: {
      type: Schema.Types.ObjectId,
      ref: 'Cartera',
      required: false,
      index: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Índice único compuesto (un presupuesto por categoría y mes por usuario)
PresupuestoSchema.index({ userId: 1, mes: 1, categoria: 1 }, { unique: true });
PresupuestoSchema.index({ userId: 1, mes: 1 });
PresupuestoSchema.index({ userId: 1, carteraId: 1 }); // Para búsquedas por usuario y cartera
PresupuestoSchema.index({ userId: 1, mes: 1, carteraId: 1 }); // Para consultas por mes y cartera

export const Presupuesto = mongoose.model<IPresupuesto>('Presupuesto', PresupuestoSchema);

