import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Ingreso } from '../models/Ingreso.model';
import { Cartera } from '../models/Cartera.model';

// Obtener todos los ingresos de un mes
export const getIngresosByMes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { mes } = req.params;
    const { carteraId } = req.query;

    // Normalizar mes a minúsculas para la búsqueda
    const mesNormalizado = mes.toLowerCase().trim();

    // Validar mes
    const mesesValidos = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    if (!mesesValidos.includes(mesNormalizado)) {
      res.status(400).json({
        success: false,
        error: `Mes inválido: ${mes}. Debe ser uno de: ${mesesValidos.join(', ')}`
      });
      return;
    }

    // Construir filtro base
    const filter: any = {
      userId: req.user.userId,
      mes: mesNormalizado
    };

    // Agregar filtro de cartera si se proporciona
    if (carteraId) {
      if (!mongoose.Types.ObjectId.isValid(carteraId as string)) {
        res.status(400).json({
          success: false,
          error: 'ID de cartera inválido'
        });
        return;
      }

      const cartera = await Cartera.findOne({ 
        _id: carteraId, 
        userId: req.user.userId 
      });

      if (!cartera) {
        res.status(404).json({
          success: false,
          error: 'Cartera no encontrada o no pertenece al usuario'
        });
        return;
      }

      filter.carteraId = carteraId;
    }
    
    const ingresos = await Ingreso.find(filter).sort({ fecha: 1 }).lean(); // Ordenar por fecha ascendente

    res.status(200).json({
      success: true,
      data: ingresos.map(ingreso => ({
        _id: ingreso._id.toString(),
        userId: ingreso.userId.toString(),
        descripcion: ingreso.descripcion,
        monto: ingreso.monto,
        fecha: ingreso.fecha instanceof Date ? ingreso.fecha.toISOString() : ingreso.fecha,
        categoria: ingreso.categoria,
        mes: ingreso.mes,
        carteraId: ingreso.carteraId ? ingreso.carteraId.toString() : null,
        createdAt: ingreso.createdAt instanceof Date ? ingreso.createdAt.toISOString() : ingreso.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener ingresos'
    });
  }
};

// Crear un nuevo ingreso
export const createIngreso = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { descripcion, monto, fecha, categoria, mes, carteraId } = req.body;

    // Validar campos requeridos
    if (!descripcion || !monto || !fecha || !categoria || !mes) {
      res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos (descripcion, monto, fecha, categoria, mes)'
      });
      return;
    }

    // Normalizar mes a minúsculas
    const mesNormalizado = mes.toLowerCase().trim();

    // Validar mes
    const mesesValidos = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    if (!mesesValidos.includes(mesNormalizado)) {
      res.status(400).json({
        success: false,
        error: `Mes inválido: ${mes}. Debe ser uno de: ${mesesValidos.join(', ')}`
      });
      return;
    }

    // Validar monto
    if (typeof monto !== 'number' || monto <= 0) {
      res.status(400).json({
        success: false,
        error: 'El monto debe ser un número mayor a 0'
      });
      return;
    }

    // Validar fecha
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Fecha inválida'
      });
      return;
    }

    // Validar carteraId si se proporciona
    if (carteraId) {
      if (!mongoose.Types.ObjectId.isValid(carteraId)) {
        res.status(400).json({
          success: false,
          error: 'ID de cartera inválido'
        });
        return;
      }

      const cartera = await Cartera.findOne({ 
        _id: carteraId, 
        userId: req.user.userId 
      });

      if (!cartera) {
        res.status(404).json({
          success: false,
          error: 'Cartera no encontrada o no pertenece al usuario'
        });
        return;
      }
    }

    // Crear nuevo ingreso
    const nuevoIngreso = new Ingreso({
      userId: req.user.userId,
      descripcion: descripcion.trim(),
      monto,
      fecha: fechaObj,
      categoria: categoria.trim(),
      mes: mesNormalizado,
      carteraId: carteraId || undefined
    });

    await nuevoIngreso.save();

    // Formatear respuesta con fechas como strings ISO y ObjectIds como strings
    res.status(201).json({
      success: true,
      data: {
        _id: nuevoIngreso._id.toString(),
        userId: nuevoIngreso.userId.toString(),
        descripcion: nuevoIngreso.descripcion,
        monto: nuevoIngreso.monto,
        fecha: nuevoIngreso.fecha.toISOString(),
        categoria: nuevoIngreso.categoria,
        mes: nuevoIngreso.mes,
        carteraId: nuevoIngreso.carteraId ? nuevoIngreso.carteraId.toString() : null,
        createdAt: nuevoIngreso.createdAt.toISOString()
      },
      message: 'Ingreso creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear ingreso:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear ingreso'
    });
  }
};

// Actualizar un ingreso existente
export const updateIngreso = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { descripcion, monto, fecha, categoria, mes, carteraId } = req.body;

    // Buscar ingreso
    const ingreso = await Ingreso.findOne({ _id: id, userId: req.user.userId });

    if (!ingreso) {
      res.status(404).json({
        success: false,
        error: 'Ingreso no encontrado'
      });
      return;
    }

    // Actualizar campos si se proporcionan
    if (descripcion !== undefined) {
      if (!descripcion || descripcion.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'La descripción no puede estar vacía'
        });
        return;
      }
      ingreso.descripcion = descripcion.trim();
    }

    if (monto !== undefined) {
      if (typeof monto !== 'number' || monto <= 0) {
        res.status(400).json({
          success: false,
          error: 'El monto debe ser un número mayor a 0'
        });
        return;
      }
      ingreso.monto = monto;
    }

    if (fecha !== undefined) {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        res.status(400).json({
          success: false,
          error: 'Fecha inválida'
        });
        return;
      }
      ingreso.fecha = fechaObj;
    }

    if (categoria !== undefined) {
      if (!categoria || categoria.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'La categoría no puede estar vacía'
        });
        return;
      }
      ingreso.categoria = categoria.trim();
    }

    if (mes !== undefined) {
      const mesNormalizado = mes.toLowerCase().trim();
      const mesesValidos = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      if (!mesesValidos.includes(mesNormalizado)) {
        res.status(400).json({
          success: false,
          error: `Mes inválido: ${mes}. Debe ser uno de: ${mesesValidos.join(', ')}`
        });
        return;
      }
      ingreso.mes = mesNormalizado;
    }

    // Validar y actualizar carteraId si se proporciona
    if (carteraId !== undefined) {
      if (carteraId === null || carteraId === '') {
        ingreso.carteraId = undefined;
      } else {
        if (!mongoose.Types.ObjectId.isValid(carteraId)) {
          res.status(400).json({
            success: false,
            error: 'ID de cartera inválido'
          });
          return;
        }

        const cartera = await Cartera.findOne({ 
          _id: carteraId, 
          userId: req.user.userId 
        });

        if (!cartera) {
          res.status(404).json({
            success: false,
            error: 'Cartera no encontrada o no pertenece al usuario'
          });
          return;
        }

        ingreso.carteraId = carteraId;
      }
    }

    await ingreso.save();

    res.status(200).json({
      success: true,
      data: {
        _id: ingreso._id.toString(),
        userId: ingreso.userId.toString(),
        descripcion: ingreso.descripcion,
        monto: ingreso.monto,
        fecha: ingreso.fecha instanceof Date ? ingreso.fecha.toISOString() : ingreso.fecha,
        categoria: ingreso.categoria,
        mes: ingreso.mes,
        carteraId: ingreso.carteraId ? ingreso.carteraId.toString() : null,
        createdAt: ingreso.createdAt instanceof Date ? ingreso.createdAt.toISOString() : ingreso.createdAt
      },
      message: 'Ingreso actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar ingreso'
    });
  }
};

// Eliminar un ingreso
export const deleteIngreso = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    const ingreso = await Ingreso.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!ingreso) {
      res.status(404).json({
        success: false,
        error: 'Ingreso no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Ingreso eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar ingreso'
    });
  }
};

// Obtener total de ingresos del mes
export const getTotalIngresosByMes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { mes } = req.params;
    const { carteraId } = req.query;

    // Normalizar mes a minúsculas para la búsqueda
    const mesNormalizado = mes.toLowerCase().trim();

    // Validar mes
    const mesesValidos = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    if (!mesesValidos.includes(mesNormalizado)) {
      res.status(400).json({
        success: false,
        error: `Mes inválido: ${mes}. Debe ser uno de: ${mesesValidos.join(', ')}`
      });
      return;
    }

    // Construir filtro base
    const filter: any = {
      userId: req.user.userId,
      mes: mesNormalizado
    };

    // Agregar filtro de cartera si se proporciona
    if (carteraId) {
      if (!mongoose.Types.ObjectId.isValid(carteraId as string)) {
        res.status(400).json({
          success: false,
          error: 'ID de cartera inválido'
        });
        return;
      }

      const cartera = await Cartera.findOne({ 
        _id: carteraId, 
        userId: req.user.userId 
      });

      if (!cartera) {
        res.status(404).json({
          success: false,
          error: 'Cartera no encontrada o no pertenece al usuario'
        });
        return;
      }

      filter.carteraId = carteraId;
    }
    
    const ingresos = await Ingreso.find(filter).lean();
    const total = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);

    res.status(200).json({
      success: true,
      data: {
        mes: mesNormalizado,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener total de ingresos'
    });
  }
};

// Obtener ingresos por categoría
export const getIngresosByCategoria = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { mes, categoria } = req.params;
    const { carteraId } = req.query;

    // Normalizar mes a minúsculas para la búsqueda
    const mesNormalizado = mes.toLowerCase().trim();

    // Validar mes
    const mesesValidos = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    if (!mesesValidos.includes(mesNormalizado)) {
      res.status(400).json({
        success: false,
        error: `Mes inválido: ${mes}. Debe ser uno de: ${mesesValidos.join(', ')}`
      });
      return;
    }

    // Construir filtro base
    const filter: any = {
      userId: req.user.userId,
      mes: mesNormalizado,
      categoria
    };

    // Agregar filtro de cartera si se proporciona
    if (carteraId) {
      if (!mongoose.Types.ObjectId.isValid(carteraId as string)) {
        res.status(400).json({
          success: false,
          error: 'ID de cartera inválido'
        });
        return;
      }

      const cartera = await Cartera.findOne({ 
        _id: carteraId, 
        userId: req.user.userId 
      });

      if (!cartera) {
        res.status(404).json({
          success: false,
          error: 'Cartera no encontrada o no pertenece al usuario'
        });
        return;
      }

      filter.carteraId = carteraId;
    }
    
    const ingresos = await Ingreso.find(filter).sort({ fecha: 1 }).lean();

    const total = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);

    res.status(200).json({
      success: true,
      data: ingresos.map(ingreso => ({
        _id: ingreso._id.toString(),
        userId: ingreso.userId.toString(),
        descripcion: ingreso.descripcion,
        monto: ingreso.monto,
        fecha: ingreso.fecha instanceof Date ? ingreso.fecha.toISOString() : ingreso.fecha,
        categoria: ingreso.categoria,
        mes: ingreso.mes,
        carteraId: ingreso.carteraId ? ingreso.carteraId.toString() : null,
        createdAt: ingreso.createdAt instanceof Date ? ingreso.createdAt.toISOString() : ingreso.createdAt
      })),
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener ingresos por categoría'
    });
  }
};

