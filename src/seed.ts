import { AppDataSource } from "./data-source/data-source";
import { User } from "./entities/User";
import bcrypt from "bcrypt";

async function seedDatabase() {
  await AppDataSource.initialize();
  
  const userRepository = AppDataSource.getRepository(User);
  
  // Borrar datos existentes (opcional)
  await userRepository.clear();

  // Crear usuario admin
  const admin = new User();
  admin.username = "admin";
  admin.password = await bcrypt.hash("admin123", 10); // Encripta la contraseña
  admin.role = "admin";

  // Crear usuario normal
  const user = new User();
  user.username = "user";
  user.password = await bcrypt.hash("user123", 10);
  user.role = "general";

  await userRepository.save([admin, user]);
  console.log("Usuarios creados:");
  console.log(`Admin: username=admin, password=admin123`);
  console.log(`User: username=user, password=user123`);

  await AppDataSource.destroy();
}

seedDatabase().catch(console.error);