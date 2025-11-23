import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Gasto } from '../models/Gasto.model';
import { Amigo } from '../models/Amigo.model';
import { MensajeChat } from '../models/MensajeChat.model';
import { User } from '../models/User.model';
import { Cartera } from '../models/Cartera.model';

// Obtener todos los gastos de un mes
export const getGastosByMes = async (req: AuthRequest, res: Response): Promise<void> => {
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

      // Verificar que la cartera pertenezca al usuario
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
    
    const gastos = await Gasto.find(filter).sort({ fecha: 1 }).lean(); // Ordenar por fecha ascendente

    res.status(200).json({
      success: true,
      data: gastos.map(gasto => ({
        _id: gasto._id.toString(),
        userId: gasto.userId.toString(),
        descripcion: gasto.descripcion,
        monto: gasto.monto,
        fecha: gasto.fecha instanceof Date ? gasto.fecha.toISOString() : gasto.fecha,
        categoria: gasto.categoria,
        mes: gasto.mes,
        dividido: (gasto.dividido || []).map(item => ({
          amigoId: item.amigoId?.toString() || item.amigoId,
          amigoNombre: item.amigoNombre,
          montoDividido: item.montoDividido,
          pagado: item.pagado
        })),
        carteraId: gasto.carteraId ? gasto.carteraId.toString() : null,
        createdAt: gasto.createdAt instanceof Date ? gasto.createdAt.toISOString() : gasto.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener gastos'
    });
  }
};

// Crear un nuevo gasto
export const createGasto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { descripcion, monto, fecha, categoria, mes, dividido, carteraId } = req.body;

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

    // Validar y normalizar dividido si se proporciona
    let divididoNormalizado = [];
    if (dividido && Array.isArray(dividido)) {
      for (const item of dividido) {
        if (!item.amigoId || !item.amigoNombre || typeof item.montoDividido !== 'number' || typeof item.pagado !== 'boolean') {
          res.status(400).json({
            success: false,
            error: 'Formato inválido en el campo dividido. Cada item debe tener: amigoId, amigoNombre, montoDividido (number), pagado (boolean)'
          });
          return;
        }
        // Convertir amigoId a ObjectId si viene como string
        divididoNormalizado.push({
          amigoId: typeof item.amigoId === 'string' 
            ? new mongoose.Types.ObjectId(item.amigoId)
            : item.amigoId,
          amigoNombre: item.amigoNombre,
          montoDividido: item.montoDividido,
          pagado: item.pagado
        });
      }
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

    // Crear nuevo gasto
    const nuevoGasto = new Gasto({
      userId: req.user.userId,
      descripcion: descripcion.trim(),
      monto,
      fecha: fechaObj,
      categoria: categoria.trim(),
      mes: mesNormalizado,
      dividido: divididoNormalizado,
      carteraId: carteraId || undefined
    });

    await nuevoGasto.save();

    // Crear mensajes automáticos del sistema para amigos que no han pagado
    if (divididoNormalizado.length > 0) {
      try {
        for (const item of divididoNormalizado) {
          // Solo crear mensaje si el amigo no ha pagado
          if (!item.pagado) {
            // Buscar el registro de Amigo del usuario actual que corresponde a este amigo
            const amigo = await Amigo.findOne({
              userId: req.user.userId,
              amigoUserId: item.amigoId,
              estado: 'activo'
            });

            if (amigo) {
              // Buscar el usuario destinatario
              const usuarioDestino = await User.findById(item.amigoId);
              
              if (usuarioDestino) {
                // Crear mensaje del sistema
                const mensajeSistema = new MensajeChat({
                  remitenteId: req.user.userId,
                  destinatarioId: usuarioDestino._id,
                  amigoId: amigo._id,
                  contenido: `Recordatorio de pago: Debes pagar ${item.montoDividido.toFixed(2)}€ por el gasto "${descripcion.trim()}"`,
                  esSistema: true,
                  leido: false
                });

                await mensajeSistema.save();
                console.log(`[Gasto] Mensaje de recordatorio creado para ${usuarioDestino.email}`);
              }
            }
          }
        }
      } catch (error) {
        // No fallar la creación del gasto si hay error al crear mensajes
        console.error('Error al crear mensajes de recordatorio:', error);
      }
    }

    // Formatear respuesta con fechas como strings ISO y ObjectIds como strings
    res.status(201).json({
      success: true,
      data: {
        _id: nuevoGasto._id.toString(),
        userId: nuevoGasto.userId.toString(),
        descripcion: nuevoGasto.descripcion,
        monto: nuevoGasto.monto,
        fecha: nuevoGasto.fecha.toISOString(),
        categoria: nuevoGasto.categoria,
        mes: nuevoGasto.mes,
        dividido: (nuevoGasto.dividido || []).map(item => ({
          amigoId: item.amigoId.toString(),
          amigoNombre: item.amigoNombre,
          montoDividido: item.montoDividido,
          pagado: item.pagado
        })),
        carteraId: nuevoGasto.carteraId ? nuevoGasto.carteraId.toString() : null,
        createdAt: nuevoGasto.createdAt.toISOString()
      },
      message: 'Gasto creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear gasto:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear gasto'
    });
  }
};

// Actualizar un gasto existente
export const updateGasto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { descripcion, monto, fecha, categoria, mes, dividido, carteraId } = req.body;

    // Buscar gasto
    const gasto = await Gasto.findOne({ _id: id, userId: req.user.userId });

    if (!gasto) {
      res.status(404).json({
        success: false,
        error: 'Gasto no encontrado'
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
      gasto.descripcion = descripcion.trim();
    }

    if (monto !== undefined) {
      if (typeof monto !== 'number' || monto <= 0) {
        res.status(400).json({
          success: false,
          error: 'El monto debe ser un número mayor a 0'
        });
        return;
      }
      gasto.monto = monto;
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
      gasto.fecha = fechaObj;
    }

    if (categoria !== undefined) {
      if (!categoria || categoria.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'La categoría no puede estar vacía'
        });
        return;
      }
      gasto.categoria = categoria.trim();
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
      gasto.mes = mesNormalizado;
    }

    if (dividido !== undefined) {
      if (Array.isArray(dividido)) {
        // Validar formato de dividido
        for (const item of dividido) {
          if (!item.amigoId || !item.amigoNombre || typeof item.montoDividido !== 'number' || typeof item.pagado !== 'boolean') {
            res.status(400).json({
              success: false,
              error: 'Formato inválido en el campo dividido'
            });
            return;
          }
        }
        gasto.dividido = dividido;
      } else {
        res.status(400).json({
          success: false,
          error: 'El campo dividido debe ser un array'
        });
        return;
      }
    }

    // Validar y actualizar carteraId si se proporciona
    if (carteraId !== undefined) {
      if (carteraId === null || carteraId === '') {
        gasto.carteraId = undefined;
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

        gasto.carteraId = carteraId;
      }
    }

    await gasto.save();

    // Crear o actualizar mensajes automáticos del sistema para amigos que no han pagado
    if (dividido !== undefined && Array.isArray(dividido)) {
      try {
        for (const item of dividido) {
          // Solo crear mensaje si el amigo no ha pagado
          if (!item.pagado) {
            // Buscar el registro de Amigo del usuario actual que corresponde a este amigo
            const amigo = await Amigo.findOne({
              userId: req.user.userId,
              amigoUserId: item.amigoId,
              estado: 'activo'
            });

            if (amigo) {
              // Buscar el usuario destinatario
              const usuarioDestino = await User.findById(item.amigoId);
              
              if (usuarioDestino) {
                // Verificar si ya existe un mensaje del sistema para este gasto y amigo
                const mensajeExistente = await MensajeChat.findOne({
                  remitenteId: req.user.userId,
                  destinatarioId: usuarioDestino._id,
                  amigoId: amigo._id,
                  esSistema: true,
                  contenido: { $regex: gasto.descripcion }
                });

                if (!mensajeExistente) {
                  // Crear nuevo mensaje del sistema
                  const mensajeSistema = new MensajeChat({
                    remitenteId: req.user.userId,
                    destinatarioId: usuarioDestino._id,
                    amigoId: amigo._id,
                    contenido: `Recordatorio de pago: Debes pagar ${item.montoDividido.toFixed(2)}€ por el gasto "${gasto.descripcion}"`,
                    esSistema: true,
                    leido: false
                  });

                  await mensajeSistema.save();
                  console.log(`[Gasto] Mensaje de recordatorio creado para ${usuarioDestino.email}`);
                } else {
                  // Actualizar mensaje existente con nuevo monto
                  mensajeExistente.contenido = `Recordatorio de pago: Debes pagar ${item.montoDividido.toFixed(2)}€ por el gasto "${gasto.descripcion}"`;
                  mensajeExistente.leido = false; // Marcar como no leído si se actualiza
                  await mensajeExistente.save();
                  console.log(`[Gasto] Mensaje de recordatorio actualizado para ${usuarioDestino.email}`);
                }
              }
            }
          }
        }
      } catch (error) {
        // No fallar la actualización del gasto si hay error al crear mensajes
        console.error('Error al crear/actualizar mensajes de recordatorio:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        _id: gasto._id.toString(),
        userId: gasto.userId.toString(),
        descripcion: gasto.descripcion,
        monto: gasto.monto,
        fecha: gasto.fecha instanceof Date ? gasto.fecha.toISOString() : gasto.fecha,
        categoria: gasto.categoria,
        mes: gasto.mes,
        dividido: (gasto.dividido || []).map(item => ({
          amigoId: item.amigoId?.toString() || item.amigoId,
          amigoNombre: item.amigoNombre,
          montoDividido: item.montoDividido,
          pagado: item.pagado
        })),
        carteraId: gasto.carteraId ? gasto.carteraId.toString() : null,
        createdAt: gasto.createdAt instanceof Date ? gasto.createdAt.toISOString() : gasto.createdAt
      },
      message: 'Gasto actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar gasto'
    });
  }
};

// Eliminar un gasto
export const deleteGasto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    const gasto = await Gasto.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!gasto) {
      res.status(404).json({
        success: false,
        error: 'Gasto no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Gasto eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar gasto'
    });
  }
};

// Obtener total de gastos del mes
export const getTotalGastosByMes = async (req: AuthRequest, res: Response): Promise<void> => {
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
    
    const gastos = await Gasto.find(filter).lean();
    const total = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

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
      error: 'Error al obtener total de gastos'
    });
  }
};

// Obtener gastos por categoría
export const getGastosByCategoria = async (req: AuthRequest, res: Response): Promise<void> => {
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
    
    const gastos = await Gasto.find(filter).sort({ fecha: 1 }).lean();

    const total = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

    res.status(200).json({
      success: true,
      data: gastos.map(gasto => ({
        _id: gasto._id.toString(),
        userId: gasto.userId.toString(),
        descripcion: gasto.descripcion,
        monto: gasto.monto,
        fecha: gasto.fecha instanceof Date ? gasto.fecha.toISOString() : gasto.fecha,
        categoria: gasto.categoria,
        mes: gasto.mes,
        dividido: (gasto.dividido || []).map(item => ({
          amigoId: item.amigoId?.toString() || item.amigoId,
          amigoNombre: item.amigoNombre,
          montoDividido: item.montoDividido,
          pagado: item.pagado
        })),
        carteraId: gasto.carteraId ? gasto.carteraId.toString() : null,
        createdAt: gasto.createdAt instanceof Date ? gasto.createdAt.toISOString() : gasto.createdAt
      })),
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener gastos por categoría'
    });
  }
};

