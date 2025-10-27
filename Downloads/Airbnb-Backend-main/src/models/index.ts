/**
 * 📦 EXPORTADOR PRINCIPAL DE MODELOS
 * 
 * 📝 RESUMEN DEL ARCHIVO:
 * Exportador principal que mantiene compatibilidad total con la API existente.
 * Usa Factory Pattern para seleccionar entre Mock y MongoDB automáticamente.
 * 
 * 🔧 CARACTERÍSTICAS:
 * - MANTIENE EXACTAMENTE LAS MISMAS FUNCIONES EXPORTADAS
 * - CERO BREAKING CHANGES
 * - Selección automática de implementación
 * - Compatibilidad total con controladores existentes
 */

// 🏭 FACTORIES
import { UserRepositoryFactory } from './factories/UserRepositoryFactory';
import { HostRepositoryFactory } from './factories/HostRepositoryFactory';
import { PropertyRepositoryFactory } from './factories/PropertyRepositoryFactory';
import { ReservationRepositoryFactory } from './factories/ReservationRepositoryFactory';
import { ReviewRepositoryFactory } from './factories/ReviewRepositoryFactory';
import { PaymentRepositoryFactory } from './factories/PaymentRepositoryFactory';
import { CartRepositoryFactory } from './factories/CartRepositoryFactory';
import { FavoriteRepositoryFactory } from './factories/FavoriteRepositoryFactory';
import { NotificationRepositoryFactory } from './factories/NotificationRepositoryFactory';

// 📦 FUNCIONES PARA OBTENER INSTANCIAS DE REPOSITORIOS (LAZY LOADING)
const getUserRepo = () => UserRepositoryFactory.create();
const getHostRepo = () => HostRepositoryFactory.create();
const getPropertyRepo = () => PropertyRepositoryFactory.create();
const getReservationRepo = () => ReservationRepositoryFactory.create();
const getReviewRepo = () => ReviewRepositoryFactory.create();
const getPaymentRepo = () => PaymentRepositoryFactory.create();
const getCartRepo = () => CartRepositoryFactory.create();
const getFavoriteRepo = () => FavoriteRepositoryFactory.create();
const getNotificationRepo = () => NotificationRepositoryFactory.create();

// =============================================================================
// 👤 FUNCIONES DE USUARIO (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

// 🔍 FUNCIONES DE BÚSQUEDA
export const findUserByEmail = (email: string) => getUserRepo().findUserByEmail(email);
export const findUserById = (id: string) => getUserRepo().findById(id);

// ➕ FUNCIONES DE CREACIÓN
export const createUser = (userData: any) => getUserRepo().createUser(userData);

// ✏️ FUNCIONES DE ACTUALIZACIÓN
export const updateUser = (id: string, userData: any) => getUserRepo().updateUser(id, userData);
export const updateUserPassword = (id: string, newPassword: string) => getUserRepo().updateUserPassword(id, newPassword);

// 🗑️ FUNCIONES DE ELIMINACIÓN
export const deleteUser = (id: string) => getUserRepo().deleteUser(id);

// 📋 FUNCIONES DE LISTADO
export const getAllUsers = () => getUserRepo().getAllUsers();

// 🔐 FUNCIONES DE AUTENTICACIÓN
export const verifyCredentials = (email: string, password: string) => getUserRepo().verifyCredentials(email, password);

// 🔒 FUNCIONES DE ENCRIPTACIÓN
export const hashPassword = (password: string) => getUserRepo().hashPassword(password);
export const comparePassword = (password: string, hashedPassword: string) => getUserRepo().comparePassword(password, hashedPassword);
export const isPasswordValid = (password: string) => getUserRepo().isPasswordValid(password);

// ✅ FUNCIONES DE VALIDACIÓN
export const isEmailAvailable = (email: string) => getUserRepo().isEmailAvailable(email);

// 🛠️ FUNCIONES DE UTILIDAD
export const removePasswordFromUser = (user: any) => getUserRepo().removePasswordFromUser(user);

// 📊 FUNCIONES DE ESTADÍSTICAS
export const getUserStats = () => getUserRepo().getUserStats();

// =============================================================================
// 🏠 FUNCIONES DE HOST (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const createHostProperty = (propertyData: any) => getHostRepo().createHostProperty(propertyData);
export const getHostProperties = (hostId: string) => getHostRepo().getHostProperties(hostId);
export const getHostPropertyById = (id: string) => getHostRepo().getHostPropertyById(id);
export const updateHostProperty = (id: string, propertyData: any) => getHostRepo().updateHostProperty(id, propertyData);
export const deleteHostProperty = (id: string) => getHostRepo().deleteHostProperty(id);
export const getHostStats = (hostId: string) => getHostRepo().getHostStats(hostId);

// =============================================================================
// 🏘️ FUNCIONES DE PROPIEDADES (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const getPropertyById = (id: string) => getPropertyRepo().getPropertyById(id);
export const searchProperties = (filters: any) => getPropertyRepo().searchProperties(filters);
export const getPopularLocations = () => getPropertyRepo().getPopularLocations();
export const getAvailableAmenities = () => getPropertyRepo().getAvailableAmenities();

// =============================================================================
// 📅 FUNCIONES DE RESERVAS (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const createReservation = (reservationData: any) => getReservationRepo().createReservation(reservationData);
export const getUserReservations = (userId: string) => getReservationRepo().getUserReservations(userId);
export const getPropertyReservations = (propertyId: string) => getReservationRepo().getPropertyReservations(propertyId);
export const getReservationById = (id: string) => getReservationRepo().getReservationById(id);
export const updateReservationStatus = (id: string, status: string) => getReservationRepo().updateReservationStatus(id, status);
export const deleteReservation = (id: string) => getReservationRepo().deleteReservation(id);
export const checkAvailability = (propertyId: string, startDate: string, endDate: string) => getReservationRepo().checkAvailability(propertyId, startDate, endDate);
export const getPropertyAvailability = (propertyId: string) => getReservationRepo().getPropertyAvailability(propertyId);
export const calculatePrice = (propertyId: string, startDate: string, endDate: string, guests: number = 1) => getReservationRepo().calculatePrice(propertyId, startDate, endDate, guests);

// =============================================================================
// ⭐ FUNCIONES DE REVIEWS (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const createReview = (reviewData: any) => getReviewRepo().createReview(reviewData);
export const getPropertyReviews = (propertyId: string) => getReviewRepo().getPropertyReviews(propertyId);
export const getUserReviews = (userId: string) => getReviewRepo().getUserReviews(userId);
export const getReviewById = (id: string) => getReviewRepo().getReviewById(id);
export const getAllReviews = () => getReviewRepo().getAllReviews();
export const updateReview = (id: string, reviewData: any) => getReviewRepo().updateReview(id, reviewData);
export const deleteReview = (id: string) => getReviewRepo().deleteReview(id);
export const getPropertyReviewStats = (propertyId: string) => getReviewRepo().getPropertyReviewStats(propertyId);
export const getReviewStats = () => getReviewRepo().getReviewStats();

// =============================================================================
// 💳 FUNCIONES DE PAGOS (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const addPaymentMethod = (userId: string, paymentData: any) => getPaymentRepo().addPaymentMethod(userId, paymentData);
export const getUserPaymentMethods = (userId: string) => getPaymentRepo().getUserPaymentMethods(userId);
export const deletePaymentMethod = (userId: string, paymentMethodId: string) => getPaymentRepo().deletePaymentMethod(userId, paymentMethodId);
export const createTransaction = (transactionData: any) => getPaymentRepo().createTransaction(transactionData);
export const getUserTransactions = (userId: string) => getPaymentRepo().getUserTransactions(userId);
export const getTransactionById = (id: string) => getPaymentRepo().getTransactionById(id);
export const updateTransactionStatus = (id: string, status: string) => getPaymentRepo().updateTransactionStatus(id, status);
export const calculatePricing = (propertyId: string, startDate: string, endDate: string, guests: number = 1) => getPaymentRepo().calculatePricing(propertyId, startDate, endDate, guests);
export const validatePaymentData = (paymentData: any) => getPaymentRepo().validatePaymentData(paymentData);
export const processPayment = (paymentData: any) => getPaymentRepo().processPayment(paymentData);
export const getCardBrand = (cardNumber: string) => getPaymentRepo().getCardBrand(cardNumber);

// =============================================================================
// 🛒 FUNCIONES DE CARRITO (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const getCartByUserId = (userId: string) => getCartRepo().getCartByUserId(userId);
export const addToCart = (userId: string, itemData: any) => getCartRepo().addToCart(userId, itemData);
export const removeFromCart = (userId: string, itemId: string) => getCartRepo().removeFromCart(userId, itemId);
export const updateCartItem = (userId: string, itemId: string, itemData: any) => getCartRepo().updateCartItem(userId, itemId, itemData);
export const clearCart = (userId: string) => getCartRepo().clearCart(userId);
export const getCartItem = (userId: string, itemId: string) => getCartRepo().getCartItem(userId, itemId);
export const getCartSummary = (userId: string) => getCartRepo().getCartSummary(userId);
export const getCartStats = () => getCartRepo().getCartStats();

// =============================================================================
// ❤️ FUNCIONES DE FAVORITOS (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const addFavorite = (userId: string, propertyId: string) => getFavoriteRepo().addFavorite(userId, propertyId);
export const removeFavorite = (userId: string, propertyId: string) => getFavoriteRepo().removeFavorite(userId, propertyId);
export const getUserFavorites = (userId: string) => getFavoriteRepo().getUserFavorites(userId);
export const isFavorite = (userId: string, propertyId: string) => getFavoriteRepo().isFavorite(userId, propertyId);
export const createWishlist = (userId: string, wishlistData: any) => getFavoriteRepo().createWishlist(userId, wishlistData);
export const getUserWishlists = (userId: string) => getFavoriteRepo().getUserWishlists(userId);
export const getPublicWishlists = () => getFavoriteRepo().getPublicWishlists();
export const getWishlistById = (id: string) => getFavoriteRepo().getWishlistById(id);
export const updateWishlist = (id: string, wishlistData: any) => getFavoriteRepo().updateWishlist(id, wishlistData);
export const deleteWishlist = (id: string) => getFavoriteRepo().deleteWishlist(id);
export const addToWishlist = (wishlistId: string, propertyId: string) => getFavoriteRepo().addToWishlist(wishlistId, propertyId);
export const removeFromWishlist = (wishlistId: string, propertyId: string) => getFavoriteRepo().removeFromWishlist(wishlistId, propertyId);
export const getFavoriteStats = () => getFavoriteRepo().getFavoriteStats();

// =============================================================================
// 🔔 FUNCIONES DE NOTIFICACIONES (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export const createNotification = (notificationData: any) => getNotificationRepo().createNotification(notificationData);
export const getUserNotifications = (userId: string) => getNotificationRepo().getUserNotifications(userId);
export const markAsRead = (notificationId: string) => getNotificationRepo().markAsRead(notificationId);
export const markAllAsRead = (userId: string) => getNotificationRepo().markAllAsRead(userId);
export const deleteNotification = (notificationId: string) => getNotificationRepo().deleteNotification(notificationId);
export const clearAllNotifications = (userId: string) => getNotificationRepo().clearAllNotifications(userId);
export const getNotificationSettings = (userId: string) => getNotificationRepo().getNotificationSettings(userId);
export const updateNotificationSettings = (userId: string, settings: any) => getNotificationRepo().updateNotificationSettings(userId, settings);
export const createTestNotification = (userId: string) => getNotificationRepo().createTestNotification(userId);
export const getNotificationStats = () => getNotificationRepo().getNotificationStats();

// =============================================================================
// 📦 EXPORTAR TIPOS (MANTENER COMPATIBILIDAD TOTAL)
// =============================================================================

export type { CreateUserData, UpdateUserData } from '../types/auth';
export type { HostProperty, HostStats } from '../types/host';
export type { Property, PropertyFilters, SearchResult } from '../types/properties';
export type { Reservation, Availability } from '../types/reservations';
export type { Review, ReviewStats } from '../types/reviews';
export type { PaymentMethod, Transaction, CheckoutData } from '../types/payments';
export type { CartItem, CartData, CartSummary } from '../types/cart';
export type { Favorite, Wishlist } from '../types/favorites';
export type { Notification, NotificationSettings } from '../types/notifications';

// =============================================================================
// 🛠️ FUNCIONES DE UTILIDAD PARA TESTING
// =============================================================================

/**
 * 🔄 Resetea todos los factories (útil para testing)
 */
export const resetAllFactories = (): void => {
  UserRepositoryFactory.reset();
  HostRepositoryFactory.reset();
  PropertyRepositoryFactory.reset();
  ReservationRepositoryFactory.reset();
  ReviewRepositoryFactory.reset();
  PaymentRepositoryFactory.reset();
  CartRepositoryFactory.reset();
  FavoriteRepositoryFactory.reset();
  NotificationRepositoryFactory.reset();
};

/**
 * 🔍 Obtiene el tipo de base de datos actual
 */
export const getCurrentDatabaseType = (): string => {
  return UserRepositoryFactory.getCurrentType();
};
