export type UserRole = 'SUPER_ADMIN' | 'RESTAURANT_OWNER' | 'EXECUTIVE' | 'BRANCH_MANAGER' | 'STAFF' | 'OWNER';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  assignedBranchIds?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  businessName: string;
  logoUrl?: string;
  primaryColor?: string;
  currencySymbol?: string;
  description?: string;
  isActive: boolean;
  ownerId?: string;
  ownerName?: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  openingHours?: string;
  isActive?: boolean;
  createdAt: string;
}

export interface Table {
  id: string;
  branchId: string;
  tableNumber: string;
  seatingCapacity?: number;
  capacity?: number;
  section?: string;
  qrCodeUrl?: string;
  isActive?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  branchId?: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive?: boolean;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  tenantId?: string;
  branchId?: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTimeMinutes?: number;
  createdAt: string;
}

export interface QRCodeConfig {
  id: string;
  tableId?: string;
  branchId: string;
  targetUrl: string;
  fgColor: string;
  bgColor: string;
  size: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'TABLE_SERVICE';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  entityName?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export type AuditLogItem = AuditLog;
export type QRCodeData = QRCodeConfig;