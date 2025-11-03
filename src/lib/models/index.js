import mongoose from 'mongoose';
import userSchema from './schemas/UserSchema';
import productSchema from './schemas/ProductSchema';
import orderSchema from './schemas/OrderSchema';
import cartSchema from './schemas/CartSchema';
import tokenBlacklistSchema from './schemas/TokenBlacklistSchema';

// Only create models if they don't exist
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export const TokenBlacklist = mongoose.models.TokenBlacklist || 
  mongoose.model('TokenBlacklist', tokenBlacklistSchema);
export { default as Category } from './Category';