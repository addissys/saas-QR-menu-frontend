import { User, Tenant, Branch, Table, Category, MenuItem, QRCodeConfig, Notification, AuditLog } from '../types';

export const INITIAL_TENANT: Tenant = {
  id: 'tenant-1',
  businessName: 'Habesha Heritage Cuisine & Lounge',
  logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=200&q=80',
  primaryColor: '#f59e0b',
  currencySymbol: 'ETB ',
  description: 'Authentic Ethiopian cultural dining, traditional clay pot Doro Wat, sizzling Shekla Tibs, fresh Gursha Kitfo, vegan Beyaynetu platters, and ceremonial Buna coffee.',
  isActive: true,
  ownerId: 'user-1',
  ownerName: 'Selamawit Basaznew',
  createdAt: new Date().toISOString(),
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    tenantId: 'tenant-1',
    email: 'owner@habeshaheritage.com',
    fullName: 'Selamawit Basaznew (Restaurant Owner)',
    phone: '+251 91 123 4567',
    role: 'RESTAURANT_OWNER',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-exec',
    tenantId: 'tenant-1',
    email: 'executive@habeshaheritage.com',
    fullName: 'Dawit Alemayehu (Executive Director)',
    phone: '+251 91 234 5678',
    role: 'EXECUTIVE',
    assignedBranchIds: ['branch-1', 'branch-2'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    tenantId: 'tenant-1',
    email: 'manager@habeshaheritage.com',
    fullName: 'Bethlehem Tadesse (Bole Branch Manager)',
    phone: '+251 91 345 6789',
    role: 'BRANCH_MANAGER',
    assignedBranchIds: ['branch-1'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-3',
    tenantId: 'tenant-1',
    email: 'staff@habeshaheritage.com',
    fullName: 'Yohannes Bekele (Head Chef & Kitchen Lead)',
    phone: '+251 91 456 7890',
    role: 'STAFF',
    assignedBranchIds: ['branch-1'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-admin',
    tenantId: 'platform-admin',
    email: 'admin@qrmenu.com',
    fullName: 'Almaz Tesfaye (Super Admin)',
    phone: '+251 91 000 1122',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    tenantId: 'tenant-1',
    name: 'Bole Medhanialem Flagship',
    address: 'Cameroon Street, Next to Medhanialem Mall, Bole, Addis Ababa',
    phone: '+251 11 662 8890',
    openingHours: '07:30 AM - 11:30 PM',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'branch-2',
    tenantId: 'tenant-1',
    name: 'Kazanchis Cultural Lounge',
    address: 'Joseph Tito St, Behind UNECA Headquarters, Kazanchis, Addis Ababa',
    phone: '+251 11 551 4432',
    openingHours: '08:00 AM - 11:00 PM',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'branch-3',
    tenantId: 'tenant-1',
    name: 'Piassa Heritage Terrace',
    address: 'Cunningham St, Near Arada Building, Historic Piassa, Addis Ababa',
    phone: '+251 11 155 7890',
    openingHours: '08:00 AM - 10:00 PM',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'branch-4',
    tenantId: 'tenant-1',
    name: 'Hawassa Lakeview Bistro',
    address: 'Lake Hawassa Promenade, Haile Resort Avenue, Hawassa',
    phone: '+251 46 220 5566',
    openingHours: '07:00 AM - 11:00 PM',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    branchId: 'branch-1',
    name: 'Traditional Starters (መክሰስ)',
    description: 'Crispy Sambusas, toasted seasoned Kategna with Ayib cheese, and fresh garden salads',
    displayOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    branchId: 'branch-1',
    name: 'Signature Clay-Pot Mains & Wats (ዋና ምግቦች)',
    description: 'Authentic slow-cooked Doro Wat, Special Gursha Kitfo, sizzling Shekla Tibs, and Zilzil',
    displayOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    branchId: 'branch-1',
    name: 'Vegetarian & Fasting Feast (የጾም በያይነቱ)',
    description: 'Royal Beyaynetu platter, bubbling clay-pot Shiro Tegabino, Misir Wat, and braised Gomen',
    displayOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    branchId: 'branch-1',
    name: 'Ceremonial Buna & Drinks (መጠጦችና ቡና)',
    description: 'Traditional clay Jebena coffee ceremony, Sidama espresso, pure honey Tej wine, and fresh avocado juices',
    displayOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    tenantId: 'tenant-1',
    branchId: 'branch-1',
    categoryId: 'cat-2',
    categoryName: 'Signature Clay-Pot Mains & Wats (ዋና ምግቦች)',
    name: 'Doro Wat Heritage Feast (የሀበሻ የዶሮ ወጥ)',
    description: 'Slow-simmered tender chicken drumstick and hard-boiled farm egg in rich, deeply caramelized Berbere red onion sauce, served with soft fermented Teff Injera.',
    price: 480.00,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true,
    preparationTimeMinutes: 20,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-2',
    tenantId: 'tenant-1',
    branchId: 'branch-1',
    categoryId: 'cat-2',
    categoryName: 'Signature Clay-Pot Mains & Wats (ዋና ምግቦች)',
    name: 'Special Gursha Kitfo (ልዩ ጉርሻ ክትፎ)',
    description: 'Finely minced lean beef warmed with spiced herbal butter (Niter Kibbeh), Mitmita chili, served with fresh homemade Ayib cheese, seasoned Gomen, and fresh Kocho.',
    price: 520.00,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true,
    preparationTimeMinutes: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-3',
    tenantId: 'tenant-1',
    branchId: 'branch-1',
    categoryId: 'cat-2',
    categoryName: 'Signature Clay-Pot Mains & Wats (ዋና ምግቦች)',
    name: 'Sizzling Shekla Tibs (የሸክላ ጥብስ)',
    description: 'Prime marinated beef ribeye cubes pan-seared with fresh rosemary, garlic, sweet red onions, and hot green jalapeños, served sizzling on a charcoal-fired clay stove.',
    price: 460.00,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true,
    preparationTimeMinutes: 18,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-4',
    tenantId: 'tenant-1',
    branchId: 'branch-1',
    categoryId: 'cat-3',
    categoryName: 'Vegetarian & Fasting Feast (የጾም በያይነቱ)',
    name: 'Royal Beyaynetu Platter (የጾም በያይነቱ)',
    description: 'A vibrant circular feast of spicy Shiro, Misir Wat (red lentils), Kik Alicha, braised Gomen, Atakilt Wat (cabbage & carrots), and spiced beetroot on Teff Injera.',
    price: 360.00,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true,
    preparationTimeMinutes: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-5',
    tenantId: 'tenant-1',
    branchId: 'branch-1',
    categoryId: 'cat-3',
    categoryName: 'Vegetarian & Fasting Feast (የጾም በያይነቱ)',
    name: 'Clay-Pot Shiro Tegabino (ሽሮ ተጋቢኖ)',
    description: 'Rich, velvety spiced sun-dried chickpea flour cooked bubbling hot in an earthenware pot with garlic, ginger, and Ethiopian herb essence, served steaming with fresh Injera.',
    price: 290.00,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: false,
    preparationTimeMinutes: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-6',
    tenantId: 'tenant-1',
    branchId: 'branch-1',
    categoryId: 'cat-1',
    categoryName: 'Traditional Starters (መክሰስ)',
    name: 'Crispy Beef & Lentil Sambusa Trio (የስጋ እና የአልጫ ሳምቡሳ)',
    description: 'Three crispy golden triangular pastry pockets packed with seasoned minced beef, garlic, lentils, and Ethiopian herbs, served with fresh spicy Awaze dip.',
    price: 180.00,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: false,
    preparationTimeMinutes: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-7',
    tenantId: 'tenant-1',
    branchId: 'branch-1',
    categoryId: 'cat-4',
    categoryName: 'Ceremonial Buna & Drinks (መጠጦችና ቡና)',
    name: 'Traditional Ethiopian Coffee Ceremony (የኢትዮጵያ ባህላዊ ቡና)',
    description: 'Live table presentation of fresh roasted Yirgacheffe & Sidama Arabica beans brewed in a traditional black clay Jebena pot, with frankincense aroma and salted popcorn.',
    price: 140.00,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: true,
    preparationTimeMinutes: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'item-8',
    tenantId: 'tenant-1',
    branchId: 'branch-1',
    categoryId: 'cat-4',
    categoryName: 'Ceremonial Buna & Drinks (መጠጦችና ቡና)',
    name: 'Pure Highland Honey Tej Wine (የማር ጠጅ)',
    description: 'Traditional home-style Ethiopian golden honey wine fermented with wild Gesho hops, served chilled in traditional round-bottom glass Berele decanters.',
    price: 220.00,
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    isFeatured: false,
    preparationTimeMinutes: 5,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_TABLES: Table[] = [
  {
    id: 'table-1',
    branchId: 'branch-1',
    tableNumber: 'T-01',
    seatingCapacity: 4,
    capacity: 4,
    section: 'Main Dining',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'table-2',
    branchId: 'branch-1',
    tableNumber: 'T-02',
    seatingCapacity: 2,
    capacity: 2,
    section: 'Main Dining',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'table-3',
    branchId: 'branch-1',
    tableNumber: 'Patio-01',
    seatingCapacity: 6,
    capacity: 6,
    section: 'Outdoor Patio',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    tenantId: 'tenant-1',
    title: 'Table #T-01 QR Scanned',
    message: 'Guest scanned table QR menu code at Bole Medhanialem Flagship branch.',
    type: 'TABLE_SERVICE',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'notif-2',
    tenantId: 'tenant-1',
    title: 'Chef Special Updated',
    message: 'Kitchen staff updated "Doro Wat Heritage Feast" preparation availability status.',
    type: 'ALERT',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'notif-3',
    tenantId: 'tenant-1',
    title: 'Branch Created',
    message: 'Kazanchis Cultural Lounge branch added successfully to your restaurant account.',
    type: 'INFO',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    tenantId: 'tenant-1',
    userId: 'user-1',
    userEmail: 'owner@habeshaheritage.com',
    userName: 'Selamawit Basaznew',
    action: 'CREATE_BRANCH',
    entityName: 'Kazanchis Cultural Lounge Branch',
    details: 'Created new branch location in Kazanchis Cultural district, Addis Ababa',
    ipAddress: '197.156.104.22',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'log-2',
    tenantId: 'tenant-1',
    userId: 'user-1',
    userEmail: 'owner@habeshaheritage.com',
    userName: 'Selamawit Basaznew',
    action: 'UPDATE_MENU_ITEM',
    entityName: 'Doro Wat Heritage Feast',
    details: 'Updated price to ETB 480.00 and marked as Chef Heritage Special',
    ipAddress: '197.156.104.22',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

class LocalMockStore {
  private getItem<T>(key: string, initial: T): T {
    try {
      const data = localStorage.getItem(`qrmenu_${key}`);
      return data ? JSON.parse(data) : initial;
    } catch {
      return initial;
    }
  }

  private setItem<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`qrmenu_${key}`, JSON.stringify(data));
    } catch {}
  }

  get tenant(): Tenant {
    return this.getItem('tenant', INITIAL_TENANT);
  }
  set tenant(val: Tenant) {
    this.setItem('tenant', val);
  }

  updateTenantStatus(id: string, isActive: boolean): void {
    const t = this.tenant;
    if (t.id === id) {
      t.isActive = isActive;
      this.tenant = t;
    }
  }

  get users(): User[] {
    return this.getItem('users', INITIAL_USERS);
  }
  set users(val: User[]) {
    this.setItem('users', val);
  }

  get branches(): Branch[] {
    return this.getItem('branches', INITIAL_BRANCHES);
  }
  set branches(val: Branch[]) {
    this.setItem('branches', val);
  }

  get categories(): Category[] {
    return this.getItem('categories', INITIAL_CATEGORIES);
  }
  set categories(val: Category[]) {
    this.setItem('categories', val);
  }

  get menuItems(): MenuItem[] {
    return this.getItem('menuItems', INITIAL_MENU_ITEMS);
  }
  set menuItems(val: MenuItem[]) {
    this.setItem('menuItems', val);
  }

  get tables(): Table[] {
    return this.getItem('tables', INITIAL_TABLES);
  }
  set tables(val: Table[]) {
    this.setItem('tables', val);
  }

  get notifications(): Notification[] {
    return this.getItem('notifications', INITIAL_NOTIFICATIONS);
  }
  set notifications(val: Notification[]) {
    this.setItem('notifications', val);
  }

  get auditLogs(): AuditLog[] {
    return this.getItem('auditLogs', INITIAL_AUDIT_LOGS);
  }
  set auditLogs(val: AuditLog[]) {
    this.setItem('auditLogs', val);
  }
}

export const mockStore = new LocalMockStore();