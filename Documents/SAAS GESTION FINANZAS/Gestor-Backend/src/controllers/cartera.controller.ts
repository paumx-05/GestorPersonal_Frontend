import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Cartera } from '../models/Cartera.model';
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

    const { nombre, descripcion } = req.body;

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

    // Crear cartera
    const nuevaCartera = await Cartera.create({
      userId: req.user.userId,
      nombre: nombre.trim(),
      descripcion: descripcion ? descripcion.trim() : undefined
    });

    res.status(201).json({
      success: true,
      data: {
        _id: nuevaCartera._id.toString(),
        userId: nuevaCartera.userId.toString(),
        nombre: nuevaCartera.nombre,
        descripcion: nuevaCartera.descripcion,
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

    res.status(500).json({
      success: false,
      error: 'Error al crear cartera'
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
    const { nombre, descripcion } = req.body;

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
    if (!nombre && descripcion === undefined) {
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

    // Guardar cambios
    await cartera.save();

    res.status(200).json({
      success: true,
      data: {
        _id: cartera._id.toString(),
        userId: cartera.userId.toString(),
        nombre: cartera.nombre,
        descripcion: cartera.descripcion,
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

