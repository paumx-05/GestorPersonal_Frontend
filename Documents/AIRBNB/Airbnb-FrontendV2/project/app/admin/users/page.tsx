'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usersService, User, CreateUserRequest, UpdateUserRequest } from '@/lib/api/users';
import { adminService } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Users as UsersIcon, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

/**
 * Página de gestión de usuarios para administradores
 * Permite crear, modificar y eliminar usuarios
 */
export default function AdminUsersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Formulario de usuario
  const [formData, setFormData] = useState<CreateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });

  // Verificar si es admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        const response = await adminService.checkAdminRole();
        if (!response.success || !response.data?.isAdmin) {
          router.push('/');
        }
      } catch (error) {
        console.error('Error verificando admin:', error);
        router.push('/');
      }
    };

    checkAdmin();
  }, [isAuthenticated, router]);

  // Cargar usuarios
  useEffect(() => {
    const loadUsers = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const response = await usersService.getAllUsers({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
        });
        
        if (response.success && response.data) {
          setUsers(response.data.users);
          setTotalPages(response.data.totalPages);
        } else {
          toast.error(response.message || 'Error al cargar usuarios');
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error);
        toast.error('Error de conexión con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [isAuthenticated, currentPage, searchTerm]);

  // Abrir diálogo para nuevo usuario
  const handleNewUser = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
    });
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar usuario
  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      firstName: userToEdit.firstName,
      lastName: userToEdit.lastName,
      email: userToEdit.email,
      phone: userToEdit.phone || '',
      // No incluir password al editar
    });
    setIsDialogOpen(true);
  };

  // Guardar usuario (crear o actualizar)
  const handleSaveUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('La contraseña es requerida para nuevos usuarios');
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingUser) {
        // Actualizar usuario existente
        const updateData: UpdateUserRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        };

        const response = await usersService.updateUser(editingUser.id, updateData);
        
        if (response.success) {
          toast.success('Usuario actualizado exitosamente');
          setIsDialogOpen(false);
          // Recargar usuarios
          const updatedResponse = await usersService.getAllUsers({
            page: currentPage,
            limit: 10,
            search: searchTerm || undefined,
          });
          if (updatedResponse.success && updatedResponse.data) {
            setUsers(updatedResponse.data.users);
          }
        } else {
          toast.error(response.message || 'Error al actualizar el usuario');
        }
      } else {
        // Crear nuevo usuario
        const response = await usersService.createUser(formData);
        
        if (response.success) {
          toast.success('Usuario creado exitosamente');
          setIsDialogOpen(false);
          // Recargar usuarios
          const updatedResponse = await usersService.getAllUsers({
            page: currentPage,
            limit: 10,
            search: searchTerm || undefined,
          });
          if (updatedResponse.success && updatedResponse.data) {
            setUsers(updatedResponse.data.users);
          }
        } else {
          toast.error(response.message || 'Error al crear el usuario');
        }
      }
    } catch (error) {
      console.error('Error guardando usuario:', error);
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      const response = await usersService.deleteUser(userId);
      
      if (response.success) {
        toast.success('Usuario eliminado exitosamente');
        // Recargar usuarios
        const updatedResponse = await usersService.getAllUsers({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
        });
        if (updatedResponse.success && updatedResponse.data) {
          setUsers(updatedResponse.data.users);
        }
      } else {
        toast.error(response.message || 'Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      toast.error('Error de conexión con el servidor');
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                ← Volver al panel
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleNewUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser 
                      ? 'Modifica los datos del usuario' 
                      : 'Completa la información del nuevo usuario'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nombre *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Pérez"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="juan@ejemplo.com"
                      disabled={!!editingUser}
                    />
                  </div>

                  {!editingUser && (
                    <div>
                      <Label htmlFor="password">Contraseña *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveUser}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        editingUser ? 'Actualizar' : 'Crear'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Barra de búsqueda */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios por nombre o email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UsersIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <CardTitle className="mb-2">No hay usuarios</CardTitle>
              <CardDescription className="mb-4">
                {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'Crea el primer usuario para empezar'}
              </CardDescription>
              {!searchTerm && (
                <Button 
                  onClick={handleNewUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Usuario
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Lista de Usuarios</CardTitle>
                <CardDescription>
                  Total: {users.length} usuario(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Verificado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userItem) => (
                      <TableRow key={userItem.id}>
                        <TableCell>
                          {userItem.firstName} {userItem.lastName}
                        </TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>{userItem.phone || '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            userItem.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {userItem.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            userItem.isVerified 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {userItem.isVerified ? 'Sí' : 'No'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(userItem)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(userItem.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
