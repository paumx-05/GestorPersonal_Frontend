import mongoose, { Document, Schema } from 'mongoose';

export interface IDividido {
  amigoId: mongoose.Types.ObjectId;
  amigoNombre: string;
  montoDividido: number;
  pagado: boolean;
}

export interface IGasto extends Document {
  userId: mongoose.Types.ObjectId;
  descripcion: string;
  monto: number;
  fecha: Date;
  categoria: string;
  mes: string;
  dividido?: IDividido[];
  carteraId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DivididoSchema: Schema = new Schema(
  {
    amigoId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    amigoNombre: {
      type: String,
      required: true
    },
    montoDividido: {
      type: Number,
      required: true,
      min: 0
    },
    pagado: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const GastoSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El userId es requerido']
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true
    },
    monto: {
      type: Number,
      required: [true, 'El monto es requerido'],
      min: [0.01, 'El monto debe ser mayor a 0']
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es requerida']
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es requerida'],
      trim: true
    },
    mes: {
      type: String,
      required: [true, 'El mes es requerido'],
      enum: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    },
    dividido: {
      type: [DivididoSchema],
      default: []
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

// Índices
GastoSchema.index({ userId: 1, mes: 1 });
GastoSchema.index({ userId: 1, categoria: 1 });
GastoSchema.index({ userId: 1, fecha: -1 });
GastoSchema.index({ userId: 1, carteraId: 1 }); // Para búsquedas por usuario y cartera
GastoSchema.index({ userId: 1, mes: 1, carteraId: 1 }); // Para consultas por mes y cartera

export const Gasto = mongoose.model<IGasto>('Gasto', GastoSchema);

