import { Request, Response } from "express";
import { AppDataSource } from "../data-source/data-source";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    res.status(400).json({ message: "Username y password son requeridos" });
    return;
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { username } });

    if (!user) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        centro: user.centro
      }, 
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        centro: user.centro
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const register = async (req: Request, res: Response) => {
  const { username, password, role = 'general',centro } = req.body;

  // Validaciones básicas
  if (!username || !password) {
      return res.status(400).json({ message: "Username y password son requeridos" });
  }

  if (password.length < 4) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 4 caracteres" });
  }

  if(centro !=2 && centro !=3 && centro !=1){
    return res.status(400).json({ message: "El centro no es válido" });
  }

  try {
      const userRepository = AppDataSource.getRepository(User);
      
      // Verificar si el usuario ya existe
      const existingUser = await userRepository.findOne({ where: { username } });
      if (existingUser) {
          return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
      }

      // Crear nuevo usuario
      const newUser = new User();
      newUser.username = username;
      newUser.password = password; // Se hasheará automáticamente con @BeforeInsert
      newUser.role = role;
      newUser.centro = centro; 

      // Guardar en la base de datos
      await userRepository.save(newUser);

      // Generar token JWT
      const token = jwt.sign(
          { userId: newUser.id, username: newUser.username, role: newUser.role,centro: newUser.centro },
          process.env.JWT_SECRET!,
          { expiresIn: '1h' }
      );

      // Respuesta exitosa
      res.status(201).json({
          message: "Usuario registrado exitosamente",
          token,
          user: {
              id: newUser.id,
              username: newUser.username,
              role: newUser.role,
              centro: newUser.centro
          }
      });
      return

  } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ message: "Error interno del servidor" });
      return
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find({
          select: ['id', 'username', 'role','centro'], // Excluye el password por seguridad
          order: { id: 'ASC' }
      });

      res.status(200).json(users);
  } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { username, password, role } = req.body;
  const { centro } = req.body;


  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: Number(id) } });

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10); // Se recomienda rehashear
    if (role) user.role = role;
    if (centro) user.centro = centro;
    await userRepository.save(user);

    res.status(200).json({
      message: "Usuario actualizado exitosamente",
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: Number(id) } });

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    await userRepository.remove(user);

    res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
