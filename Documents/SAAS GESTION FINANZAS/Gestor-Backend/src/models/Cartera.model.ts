import mongoose, { Document, Schema } from 'mongoose';

export interface ICartera extends Document {
  userId: mongoose.Types.ObjectId;
  nombre: string;
  descripcion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CarteraSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El userId es requerido'],
      index: true
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Índices
CarteraSchema.index({ userId: 1 }); // Índice simple para búsquedas por usuario
CarteraSchema.index({ userId: 1, nombre: 1 }, { unique: true }); // Índice compuesto único para evitar duplicados

export const Cartera = mongoose.model<ICartera>('Cartera', CarteraSchema);

