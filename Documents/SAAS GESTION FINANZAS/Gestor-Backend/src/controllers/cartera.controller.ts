import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Cartera } from '../models/Cartera.model';
import { TransaccionCartera } from '../models/TransaccionCartera.model';
import { Gasto } from '../models/Gasto.model';
import { Ingreso } from '../models/Ingreso.model';
import { Presupuesto } from '../models/Presupuesto.model';
import mongoose from 'mongoose';

// Obtener todas las carteras del usuario
export const getCarteras = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const carteras = await Cartera.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: carteras.map(cartera => ({
        _id: cartera._id.toString(),
        userId: cartera.userId.toString(),
        nombre: cartera.nombre,
        descripcion: cartera.descripcion,
        saldo: cartera.saldo || 0,
        saldoInicial: cartera.saldoInicial || 0,
        moneda: cartera.moneda || 'EUR',
        icono: cartera.icono || '💳',
        color: cartera.color || '#3b82f6',
        activa: cartera.activa !== undefined ? cartera.activa : true,
        createdAt: cartera.createdAt instanceof Date 
          ? cartera.createdAt.toISOString() 
          : cartera.createdAt,
        updatedAt: cartera.updatedAt instanceof Date 
          ? cartera.updatedAt.toISOString() 
          : cartera.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error en getCarteras:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener carteras'
    });
  }
};

// Obtener una cartera por ID
export const getCarteraById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    const cartera = await Cartera.findOne({ 
      _id: id, 
      userId: req.user.userId 
    }).lean();

    if (!cartera) {
      res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        _id: cartera._id.toString(),
        userId: cartera.userId.toString(),
        nombre: cartera.nombre,
        descripcion: cartera.descripcion,
        saldo: cartera.saldo || 0,
        saldoInicial: cartera.saldoInicial || 0,
        moneda: cartera.moneda || 'EUR',
        icono: cartera.icono || '💳',
        color: cartera.color || '#3b82f6',
        activa: cartera.activa !== undefined ? cartera.activa : true,
        createdAt: cartera.createdAt instanceof Date 
          ? cartera.createdAt.toISOString() 
          : cartera.createdAt,
        updatedAt: cartera.updatedAt instanceof Date 
          ? cartera.updatedAt.toISOString() 
          : cartera.updatedAt
      }
    });
  } catch (error) {
    console.error('Error en getCarteraById:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener cartera'
    });
  }
};

// Crear una nueva cartera
export const createCartera = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { nombre, descripcion, saldoInicial, moneda, icono, color } = req.body;

    // Validar nombre
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      });
      return;
    }

    if (nombre.trim().length > 100) {
      res.status(400).json({
        success: false,
        error: 'El nombre no puede exceder 100 caracteres'
      });
      return;
    }

    // Validar descripción
    if (descripcion && descripcion.trim().length > 500) {
      res.status(400).json({
        success: false,
        error: 'La descripción no puede exceder 500 caracteres'
      });
      return;
    }

    // Verificar unicidad de nombre por usuario
    const existingCartera = await Cartera.findOne({
      userId: req.user.userId,
      nombre: nombre.trim()
    });

    if (existingCartera) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una cartera con ese nombre'
      });
      return;
    }

    // Validar campos adicionales
    const saldoInicialValue = saldoInicial !== undefined ? Number(saldoInicial) : 0;
    if (saldoInicialValue < 0) {
      res.status(400).json({
        success: false,
        error: 'El saldo inicial no puede ser negativo'
      });
      return;
    }

    const monedasValidas = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'MXN'];
    const monedaValue = moneda && monedasValidas.includes(moneda) ? moneda : 'EUR';

    if (icono && icono.length > 10) {
      res.status(400).json({
        success: false,
        error: 'El icono no puede exceder 10 caracteres'
      });
      return;
    }

    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      res.status(400).json({
        success: false,
        error: 'El color debe ser un código hexadecimal válido (ej: #3b82f6)'
      });
      return;
    }

    // Crear cartera
    const nuevaCartera = await Cartera.create({
      userId: req.user.userId,
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : undefined,
      saldo: saldoInicialValue,
      saldoInicial: saldoInicialValue,
      moneda: monedaValue,
      icono: icono || '💳',
      color: color || '#3b82f6',
      activa: true
    });

    res.status(201).json({
      success: true,
      data: {
        _id: nuevaCartera._id.toString(),
        userId: nuevaCartera.userId.toString(),
        nombre: nuevaCartera.nombre,
        descripcion: nuevaCartera.descripcion,
        saldo: nuevaCartera.saldo,
        saldoInicial: nuevaCartera.saldoInicial,
        moneda: nuevaCartera.moneda,
        icono: nuevaCartera.icono,
        color: nuevaCartera.color,
        activa: nuevaCartera.activa,
        createdAt: nuevaCartera.createdAt.toISOString(),
        updatedAt: nuevaCartera.updatedAt.toISOString()
      },
      message: 'Cartera creada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en createCartera:', error);
    
    // Manejar error de duplicado de MongoDB
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una cartera con ese nombre'
      });
      return;
    }

    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear cartera',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar una cartera existente
export const updateCartera = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { nombre, descripcion, saldoInicial, moneda, icono, color, activa } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    // Verificar que la cartera existe y pertenece al usuario
    const cartera = await Cartera.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!cartera) {
      res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
      return;
    }

    // Validar que se proporcione al menos un campo para actualizar
    if (!nombre && descripcion === undefined && saldoInicial === undefined && 
        moneda === undefined && icono === undefined && color === undefined && 
        activa === undefined) {
      res.status(400).json({
        success: false,
        error: 'Debe proporcionar al menos un campo para actualizar'
      });
      return;
    }

    // Validar nombre si se proporciona
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El nombre no puede estar vacío'
        });
        return;
      }

      if (nombre.trim().length > 100) {
        res.status(400).json({
          success: false,
          error: 'El nombre no puede exceder 100 caracteres'
        });
        return;
      }

      // Verificar unicidad si el nombre cambió
      if (nombre.trim() !== cartera.nombre) {
        const existingCartera = await Cartera.findOne({
          userId: req.user.userId,
          nombre: nombre.trim(),
          _id: { $ne: id }
        });

        if (existingCartera) {
          res.status(409).json({
            success: false,
            error: 'Ya existe una cartera con ese nombre'
          });
          return;
        }
      }

      cartera.nombre = nombre.trim();
    }

    // Validar y actualizar descripción si se proporciona
    if (descripcion !== undefined) {
      if (descripcion && descripcion.trim().length > 500) {
        res.status(400).json({
          success: false,
          error: 'La descripción no puede exceder 500 caracteres'
        });
        return;
      }

      cartera.descripcion = descripcion ? descripcion.trim() : undefined;
    }

    // Actualizar saldoInicial si se proporciona
    if (saldoInicial !== undefined) {
      const saldoInicialValue = Number(saldoInicial);
      if (saldoInicialValue < 0) {
        res.status(400).json({
          success: false,
          error: 'El saldo inicial no puede ser negativo'
        });
        return;
      }
      cartera.saldoInicial = saldoInicialValue;
    }

    // Actualizar moneda si se proporciona
    if (moneda !== undefined) {
      const monedasValidas = ['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'MXN'];
      if (!monedasValidas.includes(moneda)) {
        res.status(400).json({
          success: false,
          error: 'Moneda no válida'
        });
        return;
      }
      cartera.moneda = moneda;
    }

    // Actualizar icono si se proporciona
    if (icono !== undefined) {
      if (icono.length > 10) {
        res.status(400).json({
          success: false,
          error: 'El icono no puede exceder 10 caracteres'
        });
        return;
      }
      cartera.icono = icono;
    }

    // Actualizar color si se proporciona
    if (color !== undefined) {
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        res.status(400).json({
          success: false,
          error: 'El color debe ser un código hexadecimal válido (ej: #3b82f6)'
        });
        return;
      }
      cartera.color = color;
    }

    // Actualizar activa si se proporciona
    if (activa !== undefined) {
      cartera.activa = Boolean(activa);
    }

    // Guardar cambios
    await cartera.save();

    res.status(200).json({
      success: true,
      data: {
        _id: cartera._id.toString(),
        userId: cartera.userId.toString(),
        nombre: cartera.nombre,
        descripcion: cartera.descripcion,
        saldo: cartera.saldo,
        saldoInicial: cartera.saldoInicial,
        moneda: cartera.moneda,
        icono: cartera.icono,
        color: cartera.color,
        activa: cartera.activa,
        createdAt: cartera.createdAt.toISOString(),
        updatedAt: cartera.updatedAt.toISOString()
      },
      message: 'Cartera actualizada exitosamente'
    });
  } catch (error: any) {
    console.error('Error en updateCartera:', error);
    
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una cartera con ese nombre'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar cartera'
    });
  }
};

// Eliminar una cartera
export const deleteCartera = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const deleteData = req.query.deleteData === 'true';

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    // Verificar que la cartera existe y pertenece al usuario
    const cartera = await Cartera.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!cartera) {
      res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
      return;
    }

    const carteraId = cartera._id;

    if (deleteData) {
      // Eliminar todos los gastos, ingresos y presupuestos asociados
      await Promise.all([
        Gasto.deleteMany({ userId: req.user.userId, carteraId }),
        Ingreso.deleteMany({ userId: req.user.userId, carteraId }),
        Presupuesto.deleteMany({ userId: req.user.userId, carteraId })
      ]);
    } else {
      // Mantener los datos pero sin cartera (carteraId = null)
      await Promise.all([
        Gasto.updateMany(
          { userId: req.user.userId, carteraId },
          { $unset: { carteraId: '' } }
        ),
        Ingreso.updateMany(
          { userId: req.user.userId, carteraId },
          { $unset: { carteraId: '' } }
        ),
        Presupuesto.updateMany(
          { userId: req.user.userId, carteraId },
          { $unset: { carteraId: '' } }
        )
      ]);
    }

    // Eliminar la cartera
    await Cartera.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Cartera eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteCartera:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar cartera'
    });
  }
};

// ============ DEPOSITAR ============
export const depositar = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      await session.abortTransaction();
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { monto, concepto, fecha } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    // Validar monto
    const montoValue = Number(monto);
    if (!monto || montoValue <= 0 || isNaN(montoValue)) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'El monto debe ser un número positivo'
      });
      return;
    }

    // Validar concepto
    if (!concepto || typeof concepto !== 'string' || concepto.trim().length === 0) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'El concepto es requerido'
      });
      return;
    }

    if (concepto.trim().length > 200) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'El concepto no puede exceder 200 caracteres'
      });
      return;
    }

    // Validar fecha
    const fechaValue = fecha ? new Date(fecha) : new Date();
    if (isNaN(fechaValue.getTime())) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'Fecha inválida'
      });
      return;
    }

    if (fechaValue > new Date()) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'La fecha no puede ser futura'
      });
      return;
    }

    // Buscar cartera
    const cartera = await Cartera.findOne({
      _id: id,
      userId
    }).session(session);

    if (!cartera) {
      await session.abortTransaction();
      res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
      return;
    }

    // Actualizar saldo
    cartera.saldo += montoValue;
    await cartera.save({ session });

    // Crear transacción
    const transaccion = await TransaccionCartera.create([{
      userId,
      tipo: 'deposito',
      carteraDestinoId: id,
      monto: montoValue,
      concepto: concepto.trim(),
      fecha: fechaValue
    }], { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {
        cartera: {
          _id: cartera._id.toString(),
          userId: cartera.userId.toString(),
          nombre: cartera.nombre,
          descripcion: cartera.descripcion,
          saldo: cartera.saldo,
          saldoInicial: cartera.saldoInicial,
          moneda: cartera.moneda,
          icono: cartera.icono,
          color: cartera.color,
          activa: cartera.activa,
          createdAt: cartera.createdAt.toISOString(),
          updatedAt: cartera.updatedAt.toISOString()
        },
        transaccion: {
          _id: transaccion[0]._id.toString(),
          userId: transaccion[0].userId.toString(),
          tipo: transaccion[0].tipo,
          carteraDestinoId: transaccion[0].carteraDestinoId?.toString(),
          monto: transaccion[0].monto,
          concepto: transaccion[0].concepto,
          fecha: transaccion[0].fecha.toISOString(),
          createdAt: transaccion[0].createdAt.toISOString(),
          updatedAt: transaccion[0].updatedAt.toISOString()
        }
      },
      message: 'Depósito realizado exitosamente'
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error en depositar:', error);
    res.status(500).json({
      success: false,
      error: 'Error al realizar depósito'
    });
  } finally {
    session.endSession();
  }
};

// ============ RETIRAR ============
export const retirar = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      await session.abortTransaction();
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { monto, concepto, fecha } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    // Validar monto
    const montoValue = Number(monto);
    if (!monto || montoValue <= 0 || isNaN(montoValue)) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'El monto debe ser un número positivo'
      });
      return;
    }

    // Validar concepto
    if (!concepto || typeof concepto !== 'string' || concepto.trim().length === 0) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'El concepto es requerido'
      });
      return;
    }

    if (concepto.trim().length > 200) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'El concepto no puede exceder 200 caracteres'
      });
      return;
    }

    // Validar fecha
    const fechaValue = fecha ? new Date(fecha) : new Date();
    if (isNaN(fechaValue.getTime())) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'Fecha inválida'
      });
      return;
    }

    if (fechaValue > new Date()) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'La fecha no puede ser futura'
      });
      return;
    }

    // Buscar cartera
    const cartera = await Cartera.findOne({
      _id: id,
      userId
    }).session(session);

    if (!cartera) {
      await session.abortTransaction();
      res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
      return;
    }

    // Validar saldo suficiente
    if (cartera.saldo < montoValue) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'Saldo insuficiente'
      });
      return;
    }

    // Actualizar saldo
    cartera.saldo -= montoValue;
    await cartera.save({ session });

    // Crear transacción
    const transaccion = await TransaccionCartera.create([{
      userId,
      tipo: 'retiro',
      carteraOrigenId: id,
      monto: montoValue,
      concepto: concepto.trim(),
      fecha: fechaValue
    }], { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {
        cartera: {
          _id: cartera._id.toString(),
          userId: cartera.userId.toString(),
          nombre: cartera.nombre,
          descripcion: cartera.descripcion,
          saldo: cartera.saldo,
          saldoInicial: cartera.saldoInicial,
          moneda: cartera.moneda,
          icono: cartera.icono,
          color: cartera.color,
          activa: cartera.activa,
          createdAt: cartera.createdAt.toISOString(),
          updatedAt: cartera.updatedAt.toISOString()
        },
        transaccion: {
          _id: transaccion[0]._id.toString(),
          userId: transaccion[0].userId.toString(),
          tipo: transaccion[0].tipo,
          carteraOrigenId: transaccion[0].carteraOrigenId?.toString(),
          monto: transaccion[0].monto,
          concepto: transaccion[0].concepto,
          fecha: transaccion[0].fecha.toISOString(),
          createdAt: transaccion[0].createdAt.toISOString(),
          updatedAt: transaccion[0].updatedAt.toISOString()
        }
      },
      message: 'Retiro realizado exitosamente'
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error en retirar:', error);
    res.status(500).json({
      success: false,
      error: 'Error al realizar retiro'
    });
  } finally {
    session.endSession();
  }
};

// ============ TRANSFERIR ============
export const transferir = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      await session.abortTransaction();
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { carteraOrigenId, carteraDestinoId, monto, concepto, fecha } = req.body;
    const userId = req.user.userId;

    // Validar que no sean la misma cartera
    if (carteraOrigenId === carteraDestinoId) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'No puedes transferir a la misma cartera'
      });
      return;
    }

    // Validar IDs
    if (!mongoose.Types.ObjectId.isValid(carteraOrigenId) || !mongoose.Types.ObjectId.isValid(carteraDestinoId)) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    // Validar monto
    const montoValue = Number(monto);
    if (!monto || montoValue <= 0 || isNaN(montoValue)) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'El monto debe ser un número positivo'
      });
      return;
    }

    // Validar concepto
    if (!concepto || typeof concepto !== 'string' || concepto.trim().length === 0) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'El concepto es requerido'
      });
      return;
    }

    if (concepto.trim().length > 200) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'El concepto no puede exceder 200 caracteres'
      });
      return;
    }

    // Validar fecha
    const fechaValue = fecha ? new Date(fecha) : new Date();
    if (isNaN(fechaValue.getTime())) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'Fecha inválida'
      });
      return;
    }

    if (fechaValue > new Date()) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'La fecha no puede ser futura'
      });
      return;
    }

    // Buscar ambas carteras
    const carteraOrigen = await Cartera.findOne({
      _id: carteraOrigenId,
      userId
    }).session(session);

    const carteraDestino = await Cartera.findOne({
      _id: carteraDestinoId,
      userId
    }).session(session);

    if (!carteraOrigen || !carteraDestino) {
      await session.abortTransaction();
      res.status(404).json({
        success: false,
        error: 'Una o ambas carteras no fueron encontradas'
      });
      return;
    }

    // Validar saldo suficiente
    if (carteraOrigen.saldo < montoValue) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'Saldo insuficiente en la cartera origen'
      });
      return;
    }

    // Actualizar saldos
    carteraOrigen.saldo -= montoValue;
    carteraDestino.saldo += montoValue;

    await carteraOrigen.save({ session });
    await carteraDestino.save({ session });

    // Crear transacción
    const transaccion = await TransaccionCartera.create([{
      userId,
      tipo: 'transferencia',
      carteraOrigenId,
      carteraDestinoId,
      monto: montoValue,
      concepto: concepto.trim(),
      fecha: fechaValue
    }], { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {
        carteraOrigen: {
          _id: carteraOrigen._id.toString(),
          userId: carteraOrigen.userId.toString(),
          nombre: carteraOrigen.nombre,
          saldo: carteraOrigen.saldo,
          moneda: carteraOrigen.moneda
        },
        carteraDestino: {
          _id: carteraDestino._id.toString(),
          userId: carteraDestino.userId.toString(),
          nombre: carteraDestino.nombre,
          saldo: carteraDestino.saldo,
          moneda: carteraDestino.moneda
        },
        transaccion: {
          _id: transaccion[0]._id.toString(),
          userId: transaccion[0].userId.toString(),
          tipo: transaccion[0].tipo,
          carteraOrigenId: transaccion[0].carteraOrigenId?.toString(),
          carteraDestinoId: transaccion[0].carteraDestinoId?.toString(),
          monto: transaccion[0].monto,
          concepto: transaccion[0].concepto,
          fecha: transaccion[0].fecha.toISOString(),
          createdAt: transaccion[0].createdAt.toISOString(),
          updatedAt: transaccion[0].updatedAt.toISOString()
        }
      },
      message: 'Transferencia realizada exitosamente'
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error en transferir:', error);
    res.status(500).json({
      success: false,
      error: 'Error al realizar transferencia'
    });
  } finally {
    session.endSession();
  }
};

// ============ OBTENER TRANSACCIONES ============
export const getTransacciones = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const { tipo, fechaDesde, fechaHasta, limit = 100, offset = 0 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    // Verificar que la cartera existe y pertenece al usuario
    const cartera = await Cartera.findOne({ _id: id, userId });
    if (!cartera) {
      res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
      return;
    }

    // Construir query
    const query: any = {
      userId,
      $or: [
        { carteraOrigenId: id },
        { carteraDestinoId: id }
      ]
    };

    if (tipo) {
      const tiposValidos = ['deposito', 'retiro', 'transferencia', 'ajuste', 'gasto', 'ingreso'];
      if (tiposValidos.includes(tipo as string)) {
        query.tipo = tipo;
      }
    }

    if (fechaDesde || fechaHasta) {
      query.fecha = {};
      if (fechaDesde) query.fecha.$gte = new Date(fechaDesde as string);
      if (fechaHasta) query.fecha.$lte = new Date(fechaHasta as string);
    }

    // Obtener transacciones
    const transacciones = await TransaccionCartera.find(query)
      .sort({ fecha: -1 })
      .limit(Math.min(parseInt(limit as string) || 100, 500))
      .skip(parseInt(offset as string) || 0)
      .lean();

    res.status(200).json({
      success: true,
      data: transacciones.map(t => ({
        _id: t._id.toString(),
        userId: t.userId.toString(),
        tipo: t.tipo,
        carteraOrigenId: t.carteraOrigenId?.toString(),
        carteraDestinoId: t.carteraDestinoId?.toString(),
        monto: t.monto,
        montoOrigen: t.montoOrigen,
        montoDestino: t.montoDestino,
        concepto: t.concepto,
        fecha: t.fecha instanceof Date ? t.fecha.toISOString() : t.fecha,
        referenciaId: t.referenciaId?.toString(),
        metadata: t.metadata,
        createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
        updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error en getTransacciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener transacciones'
    });
  }
};

// ============ OBTENER SALDO ============
export const getSaldo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    // Buscar cartera
    const cartera = await Cartera.findOne({ _id: id, userId });
    if (!cartera) {
      res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
      return;
    }

    // Calcular saldo contable
    const transacciones = await TransaccionCartera.find({
      userId,
      $or: [
        { carteraOrigenId: id },
        { carteraDestinoId: id }
      ]
    });

    let saldoContable = cartera.saldoInicial;

    for (const t of transacciones) {
      if (['deposito', 'ingreso'].includes(t.tipo) && t.carteraDestinoId?.toString() === id) {
        saldoContable += t.monto;
      } else if (['retiro', 'gasto'].includes(t.tipo) && t.carteraOrigenId?.toString() === id) {
        saldoContable -= t.monto;
      } else if (t.tipo === 'transferencia') {
        if (t.carteraDestinoId?.toString() === id) {
          saldoContable += t.monto;
        } else if (t.carteraOrigenId?.toString() === id) {
          saldoContable -= t.monto;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        saldo: cartera.saldo,
        saldoContable,
        diferencia: cartera.saldo - saldoContable,
        ultimaActualizacion: cartera.updatedAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error en getSaldo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener saldo'
    });
  }
};

// ============ SINCRONIZAR SALDO ============
export const sincronizar = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) {
      await session.abortTransaction();
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        error: 'ID de cartera inválido'
      });
      return;
    }

    // Buscar cartera
    const cartera = await Cartera.findOne({
      _id: id,
      userId
    }).session(session);

    if (!cartera) {
      await session.abortTransaction();
      res.status(404).json({
        success: false,
        error: 'Cartera no encontrada'
      });
      return;
    }

    // Obtener todas las transacciones
    const transacciones = await TransaccionCartera.find({
      userId,
      $or: [
        { carteraOrigenId: id },
        { carteraDestinoId: id }
      ]
    }).session(session);

    // Calcular saldo desde cero
    let saldoCalculado = cartera.saldoInicial;

    for (const t of transacciones) {
      if (['deposito', 'ingreso'].includes(t.tipo) && t.carteraDestinoId?.toString() === id) {
        saldoCalculado += t.monto;
      } else if (['retiro', 'gasto'].includes(t.tipo) && t.carteraOrigenId?.toString() === id) {
        saldoCalculado -= t.monto;
      } else if (t.tipo === 'transferencia') {
        if (t.carteraDestinoId?.toString() === id) {
          saldoCalculado += t.monto;
        } else if (t.carteraOrigenId?.toString() === id) {
          saldoCalculado -= t.monto;
        }
      }
    }

    // Actualizar saldo
    cartera.saldo = saldoCalculado;
    await cartera.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {
        _id: cartera._id.toString(),
        userId: cartera.userId.toString(),
        nombre: cartera.nombre,
        descripcion: cartera.descripcion,
        saldo: cartera.saldo,
        saldoInicial: cartera.saldoInicial,
        moneda: cartera.moneda,
        icono: cartera.icono,
        color: cartera.color,
        activa: cartera.activa,
        createdAt: cartera.createdAt.toISOString(),
        updatedAt: cartera.updatedAt.toISOString()
      },
      message: 'Saldo sincronizado exitosamente'
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error en sincronizar:', error);
    res.status(500).json({
      success: false,
      error: 'Error al sincronizar saldo'
    });
  } finally {
    session.endSession();
  }
};

