import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Amigo } from '../models/Amigo.model';

// Obtener todos los amigos del usuario
export const getAmigos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const amigos = await Amigo.find({ userId: req.user.userId }).lean();

    res.status(200).json({
      success: true,
      data: amigos.map(amigo => ({
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        fechaAmistad: amigo.fechaAmistad,
        createdAt: amigo.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener amigos'
    });
  }
};

// Obtener un amigo por ID
export const getAmigoById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    const amigo = await Amigo.findOne({ _id: id, userId: req.user.userId }).lean();

    if (!amigo) {
      res.status(404).json({
        success: false,
        error: 'Amigo no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        fechaAmistad: amigo.fechaAmistad,
        createdAt: amigo.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener amigo'
    });
  }
};

// Buscar amigos por nombre o email
export const searchAmigos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Parámetro de búsqueda requerido'
      });
      return;
    }

    const amigos = await Amigo.find({
      userId: req.user.userId,
      $or: [
        { nombre: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).lean();

    res.status(200).json({
      success: true,
      data: amigos.map(amigo => ({
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        fechaAmistad: amigo.fechaAmistad,
        createdAt: amigo.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al buscar amigos'
    });
  }
};

// Obtener amigos por estado
export const getAmigosByEstado = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { estado } = req.params;

    const estadosValidos = ['activo', 'pendiente', 'bloqueado'];
    if (!estadosValidos.includes(estado)) {
      res.status(400).json({
        success: false,
        error: 'Estado inválido. Debe ser: activo, pendiente o bloqueado'
      });
      return;
    }

    const amigos = await Amigo.find({ userId: req.user.userId, estado }).lean();

    res.status(200).json({
      success: true,
      data: amigos.map(amigo => ({
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        fechaAmistad: amigo.fechaAmistad,
        createdAt: amigo.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener amigos por estado'
    });
  }
};

// Crear un nuevo amigo
export const createAmigo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { nombre, email, avatar, estado } = req.body;

    // Validar nombre
    if (!nombre || nombre.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      });
      return;
    }

    // Validar email
    if (!email) {
      res.status(400).json({
        success: false,
        error: 'El email es requerido'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
      return;
    }

    // Validar estado si se proporciona
    if (estado) {
      const estadosValidos = ['activo', 'pendiente', 'bloqueado'];
      if (!estadosValidos.includes(estado)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido. Debe ser: activo, pendiente o bloqueado'
        });
        return;
      }
    }

    // Verificar si ya existe un amigo con ese email
    const amigoExistente = await Amigo.findOne({
      userId: req.user.userId,
      email: email.toLowerCase().trim()
    });

    if (amigoExistente) {
      res.status(409).json({
        success: false,
        error: 'Ya existe un amigo con ese email'
      });
      return;
    }

    // Crear nuevo amigo
    const nuevoAmigo = new Amigo({
      userId: req.user.userId,
      nombre: nombre.trim(),
      email: email.toLowerCase().trim(),
      avatar: avatar?.trim(),
      estado: estado || 'activo',
      fechaAmistad: new Date()
    });

    await nuevoAmigo.save();

    res.status(201).json({
      success: true,
      data: {
        _id: nuevoAmigo._id.toString(),
        userId: nuevoAmigo.userId.toString(),
        nombre: nuevoAmigo.nombre,
        email: nuevoAmigo.email,
        avatar: nuevoAmigo.avatar,
        estado: nuevoAmigo.estado,
        fechaAmistad: nuevoAmigo.fechaAmistad,
        createdAt: nuevoAmigo.createdAt
      },
      message: 'Amigo creado exitosamente'
    });
  } catch (error) {
    // Manejar error de duplicado del índice único
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        success: false,
        error: 'Ya existe un amigo con ese email'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear amigo'
    });
  }
};

// Actualizar un amigo existente
export const updateAmigo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { nombre, email, avatar, estado } = req.body;

    // Buscar amigo
    const amigo = await Amigo.findOne({ _id: id, userId: req.user.userId });

    if (!amigo) {
      res.status(404).json({
        success: false,
        error: 'Amigo no encontrado'
      });
      return;
    }

    // Validar y actualizar nombre
    if (nombre !== undefined) {
      if (!nombre || nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El nombre no puede estar vacío'
        });
        return;
      }
      amigo.nombre = nombre.trim();
    }

    // Validar y actualizar email
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          error: 'Email inválido'
        });
        return;
      }

      // Verificar si el nuevo email ya existe en otro amigo
      const amigoConEmail = await Amigo.findOne({
        userId: req.user.userId,
        email: email.toLowerCase().trim(),
        _id: { $ne: id }
      });

      if (amigoConEmail) {
        res.status(409).json({
          success: false,
          error: 'Ya existe un amigo con ese email'
        });
        return;
      }

      amigo.email = email.toLowerCase().trim();
    }

    // Actualizar avatar
    if (avatar !== undefined) {
      amigo.avatar = avatar?.trim();
    }

    // Validar y actualizar estado
    if (estado !== undefined) {
      const estadosValidos = ['activo', 'pendiente', 'bloqueado'];
      if (!estadosValidos.includes(estado)) {
        res.status(400).json({
          success: false,
          error: 'Estado inválido. Debe ser: activo, pendiente o bloqueado'
        });
        return;
      }
      amigo.estado = estado;
    }

    await amigo.save();

    res.status(200).json({
      success: true,
      data: {
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        fechaAmistad: amigo.fechaAmistad,
        createdAt: amigo.createdAt
      },
      message: 'Amigo actualizado exitosamente'
    });
  } catch (error) {
    // Manejar error de duplicado del índice único
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        success: false,
        error: 'Ya existe un amigo con ese email'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar amigo'
    });
  }
};

// Actualizar estado de un amigo
export const updateEstadoAmigo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado
    if (!estado) {
      res.status(400).json({
        success: false,
        error: 'El estado es requerido'
      });
      return;
    }

    const estadosValidos = ['activo', 'pendiente', 'bloqueado'];
    if (!estadosValidos.includes(estado)) {
      res.status(400).json({
        success: false,
        error: 'Estado inválido. Debe ser: activo, pendiente o bloqueado'
      });
      return;
    }

    // Buscar y actualizar amigo
    const amigo = await Amigo.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { estado },
      { new: true }
    );

    if (!amigo) {
      res.status(404).json({
        success: false,
        error: 'Amigo no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        _id: amigo._id.toString(),
        userId: amigo.userId.toString(),
        nombre: amigo.nombre,
        email: amigo.email,
        avatar: amigo.avatar,
        estado: amigo.estado,
        fechaAmistad: amigo.fechaAmistad,
        createdAt: amigo.createdAt
      },
      message: 'Estado actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar estado'
    });
  }
};

// Eliminar un amigo
export const deleteAmigo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    const amigo = await Amigo.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!amigo) {
      res.status(404).json({
        success: false,
        error: 'Amigo no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Amigo eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar amigo'
    });
  }
};


