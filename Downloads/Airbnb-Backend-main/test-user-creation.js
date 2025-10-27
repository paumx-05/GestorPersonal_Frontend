const { createUser } = require('./dist/models');

async function testCreateUser() {
  try {
    console.log('Probando creación de usuario...');
    const user = await createUser({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    console.log('Usuario creado exitosamente:', user);
  } catch (error) {
    console.error('Error al crear usuario:', error);
  }
}

testCreateUser();

