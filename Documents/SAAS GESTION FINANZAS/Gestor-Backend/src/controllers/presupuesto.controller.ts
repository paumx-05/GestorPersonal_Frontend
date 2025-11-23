import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Presupuesto } from '../models/Presupuesto.model';
import { Cartera } from '../models/Cartera.model';

const mesesValidos = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Obtener todos los presupuestos de un mes
export const getPresupuestosByMes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { mes } = req.params;
    const mesNormalizado = mes.toLowerCase().trim();

    // Validar mes
    if (!mesesValidos.includes(mesNormalizado)) {
      res.status(400).json({
        success: false,
        error: 'Mes inválido'
      });
      return;
    }

    const presupuestos = await Presupuesto.find({ 
      userId: req.user.userId, 
      mes: mesNormalizado 
    })
      .sort({ categoria: 1 })
      .lean();

    // Calcular porcentajes si totalIngresos está disponible
    const presupuestosConPorcentaje = presupuestos.map(presupuesto => {
      const porcentaje = presupuesto.totalIngresos > 0 
        ? (presupuesto.monto / presupuesto.totalIngresos) * 100 
        : 0;

      return {
        _id: presupuesto._id.toString(),
        userId: presupuesto.userId.toString(),
        mes: presupuesto.mes,
        categoria: presupuesto.categoria,
        monto: presupuesto.monto,
        porcentaje: Number(porcentaje.toFixed(2)),
        totalIngresos: presupuesto.totalIngresos,
        createdAt: presupuesto.createdAt instanceof Date 
          ? presupuesto.createdAt.toISOString() 
          : presupuesto.createdAt
      };
    });

    res.status(200).json({
      success: true,
      data: presupuestosConPorcentaje
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener presupuestos'
    });
  }
};

// Crear o actualizar un presupuesto (upsert)
export const createOrUpdatePresupuesto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { mes, categoria, monto, porcentaje, totalIngresos, carteraId } = req.body;

    // Validar mes
    if (!mes || !mesesValidos.includes(mes.toLowerCase().trim())) {
      res.status(400).json({
        success: false,
        error: 'Mes inválido'
      });
      return;
    }

    // Validar categoría
    if (!categoria || categoria.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'La categoría es requerida'
      });
      return;
    }

    // Validar que monto o porcentaje esté presente
    if (monto === undefined && porcentaje === undefined) {
      res.status(400).json({
        success: false,
        error: 'Debe proporcionar monto o porcentaje'
      });
      return;
    }

    // Validar totalIngresos
    if (!totalIngresos || totalIngresos <= 0) {
      res.status(400).json({
        success: false,
        error: 'totalIngresos es requerido y debe ser mayor a 0'
      });
      return;
    }

    // Validar porcentaje si se proporciona
    if (porcentaje !== undefined && (porcentaje < 0 || porcentaje > 100)) {
      res.status(400).json({
        success: false,
        error: 'El porcentaje debe estar entre 0 y 100'
      });
      return;
    }

    // Validar monto si se proporciona
    if (monto !== undefined && monto < 0) {
      res.status(400).json({
        success: false,
        error: 'El monto debe ser mayor o igual a 0'
      });
      return;
    }

    const mesNormalizado = mes.toLowerCase().trim();
    const categoriaNormalizada = categoria.trim();

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

    // Calcular monto o porcentaje según lo que se envíe
    let montoFinal = monto;
    let porcentajeFinal = porcentaje;

    // Si se envía monto, calcular porcentaje
    if (monto !== undefined && totalIngresos > 0) {
      porcentajeFinal = (monto / totalIngresos) * 100;
    }

    // Si se envía porcentaje, calcular monto
    if (porcentaje !== undefined && totalIngresos > 0) {
      montoFinal = (porcentaje / 100) * totalIngresos;
    }

    // Construir filtro de búsqueda
    const filterBusqueda: any = {
      userId: req.user.userId,
      mes: mesNormalizado,
      categoria: categoriaNormalizada
    };

    // Si se proporciona carteraId, incluirlo en el filtro
    if (carteraId) {
      filterBusqueda.carteraId = carteraId;
    } else {
      // Si no se proporciona, buscar presupuestos sin cartera
      filterBusqueda.carteraId = { $exists: false };
    }

    // Usar findOneAndUpdate con upsert para crear o actualizar
    const presupuesto = await Presupuesto.findOneAndUpdate(
      filterBusqueda,
      {
        userId: req.user.userId,
        mes: mesNormalizado,
        categoria: categoriaNormalizada,
        monto: montoFinal,
        porcentaje: porcentajeFinal,
        totalIngresos,
        carteraId: carteraId || undefined
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: {
        _id: presupuesto._id.toString(),
        userId: presupuesto.userId.toString(),
        mes: presupuesto.mes,
        categoria: presupuesto.categoria,
        monto: presupuesto.monto,
        porcentaje: presupuesto.porcentaje ? Number(presupuesto.porcentaje.toFixed(2)) : undefined,
        totalIngresos: presupuesto.totalIngresos,
        createdAt: presupuesto.createdAt.toISOString()
      },
      message: 'Presupuesto creado/actualizado exitosamente'
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        success: false,
        error: 'Ya existe un presupuesto para esta categoría en este mes'
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Error al crear/actualizar presupuesto'
    });
  }
};

// Actualizar un presupuesto existente
export const updatePresupuesto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { monto, porcentaje, totalIngresos, carteraId } = req.body;

    // Buscar presupuesto
    const presupuesto = await Presupuesto.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!presupuesto) {
      res.status(404).json({
        success: false,
        error: 'Presupuesto no encontrado'
      });
      return;
    }

    // Validar totalIngresos si se proporciona
    if (totalIngresos !== undefined && totalIngresos <= 0) {
      res.status(400).json({
        success: false,
        error: 'totalIngresos debe ser mayor a 0'
      });
      return;
    }

    // Validar porcentaje si se proporciona
    if (porcentaje !== undefined && (porcentaje < 0 || porcentaje > 100)) {
      res.status(400).json({
        success: false,
        error: 'El porcentaje debe estar entre 0 y 100'
      });
      return;
    }

    // Validar monto si se proporciona
    if (monto !== undefined && monto < 0) {
      res.status(400).json({
        success: false,
        error: 'El monto debe ser mayor o igual a 0'
      });
      return;
    }

    // Validar y actualizar carteraId si se proporciona
    if (carteraId !== undefined) {
      if (carteraId === null || carteraId === '') {
        presupuesto.carteraId = undefined;
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

        presupuesto.carteraId = carteraId;
      }
    }

    // Usar totalIngresos del body o del presupuesto existente
    const totalIngresosFinal = totalIngresos !== undefined ? totalIngresos : presupuesto.totalIngresos;

    // Calcular monto o porcentaje según lo que se envíe
    let montoFinal = monto !== undefined ? monto : presupuesto.monto;
    let porcentajeFinal = porcentaje !== undefined ? porcentaje : presupuesto.porcentaje;

    // Si se envía monto, calcular porcentaje
    if (monto !== undefined && totalIngresosFinal > 0) {
      porcentajeFinal = (monto / totalIngresosFinal) * 100;
    }

    // Si se envía porcentaje, calcular monto
    if (porcentaje !== undefined && totalIngresosFinal > 0) {
      montoFinal = (porcentaje / 100) * totalIngresosFinal;
    }

    // Actualizar presupuesto
    presupuesto.monto = montoFinal;
    presupuesto.porcentaje = porcentajeFinal;
    if (totalIngresos !== undefined) {
      presupuesto.totalIngresos = totalIngresosFinal;
    }

    await presupuesto.save();

    res.status(200).json({
      success: true,
      data: {
        _id: presupuesto._id.toString(),
        userId: presupuesto.userId.toString(),
        mes: presupuesto.mes,
        categoria: presupuesto.categoria,
        monto: presupuesto.monto,
        porcentaje: presupuesto.porcentaje ? Number(presupuesto.porcentaje.toFixed(2)) : undefined,
        totalIngresos: presupuesto.totalIngresos,
        createdAt: presupuesto.createdAt.toISOString()
      },
      message: 'Presupuesto actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar presupuesto'
    });
  }
};

// Eliminar presupuesto por mes y categoría
export const deletePresupuesto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { mes, categoria } = req.params;

    // Validar mes
    const mesNormalizado = mes.toLowerCase().trim();
    if (!mesesValidos.includes(mesNormalizado)) {
      res.status(400).json({
        success: false,
        error: 'Mes inválido'
      });
      return;
    }

    const categoriaNormalizada = decodeURIComponent(categoria).trim();

    const presupuesto = await Presupuesto.findOneAndDelete({ 
      userId: req.user.userId, 
      mes: mesNormalizado,
      categoria: categoriaNormalizada
    });

    if (!presupuesto) {
      res.status(404).json({
        success: false,
        error: 'Presupuesto no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Presupuesto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar presupuesto'
    });
  }
};

// Obtener total presupuestado del mes
export const getTotalPresupuestosByMes = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const mesNormalizado = mes.toLowerCase().trim();

    // Validar mes
    if (!mesesValidos.includes(mesNormalizado)) {
      res.status(400).json({
        success: false,
        error: 'Mes inválido'
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

    const presupuestos = await Presupuesto.find(filter).lean();

    const total = presupuestos.reduce((sum, presupuesto) => sum + presupuesto.monto, 0);

    res.status(200).json({
      success: true,
      data: {
        mes: mesNormalizado,
        total: Number(total.toFixed(2))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener total de presupuestos'
    });
  }
};

// Obtener resumen con distribución y porcentajes
export const getResumenPresupuestos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { mes } = req.params;
    const mesNormalizado = mes.toLowerCase().trim();

    // Validar mes
    if (!mesesValidos.includes(mesNormalizado)) {
      res.status(400).json({
        success: false,
        error: 'Mes inválido'
      });
      return;
    }

    const presupuestos = await Presupuesto.find({ 
      userId: req.user.userId, 
      mes: mesNormalizado 
    })
      .sort({ categoria: 1 })
      .lean();

    if (presupuestos.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          mes: mesNormalizado,
          totalIngresos: 0,
          totalPresupuestado: 0,
          ahorro: 0,
          porcentajePresupuestado: 0,
          presupuestos: []
        }
      });
      return;
    }

    // Obtener totalIngresos del primer presupuesto (todos deberían tener el mismo)
    const totalIngresos = presupuestos[0].totalIngresos;
    const totalPresupuestado = presupuestos.reduce((sum, presupuesto) => sum + presupuesto.monto, 0);
    const ahorro = totalIngresos - totalPresupuestado;
    const porcentajePresupuestado = totalIngresos > 0 
      ? (totalPresupuestado / totalIngresos) * 100 
      : 0;

    const presupuestosResumen = presupuestos.map(presupuesto => {
      const porcentaje = totalIngresos > 0 
        ? (presupuesto.monto / totalIngresos) * 100 
        : 0;

      return {
        categoria: presupuesto.categoria,
        monto: Number(presupuesto.monto.toFixed(2)),
        porcentaje: Number(porcentaje.toFixed(2))
      };
    });

    res.status(200).json({
      success: true,
      data: {
        mes: mesNormalizado,
        totalIngresos: Number(totalIngresos.toFixed(2)),
        totalPresupuestado: Number(totalPresupuestado.toFixed(2)),
        ahorro: Number(ahorro.toFixed(2)),
        porcentajePresupuestado: Number(porcentajePresupuestado.toFixed(2)),
        presupuestos: presupuestosResumen
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener resumen de presupuestos'
    });
  }
};

