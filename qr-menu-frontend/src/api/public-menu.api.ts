import { AxiosResponse } from 'axios';
import api from './axios';
import { Branch, Category, MenuItem, Table } from '../types';

// ---------------------------------------------------------------------------
// Raw API shapes (as sent by the backend before mapping)
// ---------------------------------------------------------------------------

interface RawTenant {
  id?: string;
  business_name?: string;
}

interface RawBranch {
  id?: string;
  tenant_id?: string;
  tenantId?: string;
  tenant?: RawTenant;
  tenant_name?: string;
  branch_name?: string;
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  opening_hours?: Branch['openingHours'];
  openingHours?: Branch['openingHours'];
  is_active?: boolean;
  isActive?: boolean;
  status?: string;
  created_at?: string;
  createdAt?: string;
  categories?: RawCategory[];
}

interface RawMenuItem {
  id: string;
  tenant_id?: string;
  tenantId?: string;
  branch_id?: string;
  branchId?: string;
  category_id?: string;
  categoryId?: string;
  category?: { id?: string; name?: string };
  name?: string;
  description?: string;
  price?: number | string;
  image_url?: string;
  imageUrl?: string;
  is_available?: boolean;
  isAvailable?: boolean;
  is_featured?: boolean;
  isFeatured?: boolean;
  preparation_time?: number;
  preparationTimeMinutes?: number;
  created_at?: string;
  createdAt?: string;
}

interface RawCategory {
  id: string;
  branch_id?: string;
  branchId?: string;
  name: string;
  description?: string;
  sort_order?: number;
  sortOrder?: number;
  displayOrder?: number;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
  menu_items?: RawMenuItem[];
}

interface RawTable {
  id?: string;
  branch_id?: string;
  branchId?: string;
  table_number?: string;
  tableNumber?: string;
  seating_capacity?: number;
  seatingCapacity?: number;
  capacity?: number;
  section?: string;
  qr_code_url?: string;
  qrCodeUrl?: string;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
}

interface RawBranchMenu extends RawBranch {
  menu_items?: RawMenuItem[];
}

interface ApiEnvelope<T> {
  data?: T;
}

interface BranchListPayload {
  branches?: RawBranch[];
}

interface BranchMenuResponsePayload {
  menu?: RawBranchMenu | { branch?: RawBranchMenu };
  branch?: RawBranchMenu;
}

interface TableMenuResponsePayload {
  menu?: RawTableMenu;
}

interface RawTableMenu {
  id?: string;
  table_number?: string;
  branch?: RawBranchMenu;
}

interface TablePayload {
  table?: RawTable;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const mapBranch = (branch: RawBranch): Branch => ({
  id: branch?.id ?? '',
  tenantId: branch?.tenant_id ?? branch?.tenantId ?? branch?.tenant?.id ?? '',
  tenantName: branch?.tenant?.business_name ?? branch?.tenant_name ?? '',
  name: branch?.branch_name ?? branch?.name ?? '',
  address: branch?.address ?? '',
  city: branch?.city ?? '',
  phone: branch?.phone ?? '',
  openingHours: branch?.opening_hours ?? branch?.openingHours,
  isActive: branch?.is_active ?? branch?.isActive ?? branch?.status === 'ACTIVE',
  createdAt: branch?.created_at ?? branch?.createdAt ?? new Date().toISOString(),
});

const mapMenuItem = (
  item: RawMenuItem,
  categoryId?: string,
  categoryName?: string
): MenuItem => ({
  id: item.id,
  tenantId: item.tenant_id ?? item.tenantId ?? '',
  branchId: item.branch_id ?? item.branchId ?? '',
  categoryId: item.category_id ?? item.categoryId ?? categoryId ?? '',
  categoryName: item.category?.name ?? categoryName ?? '',
  name: item.name ?? '',
  description: item.description ?? '',
  price: Number(item.price ?? 0),
  imageUrl: item.image_url ?? item.imageUrl,
  isAvailable: item.is_available ?? item.isAvailable ?? true,
  isFeatured: item.is_featured ?? item.isFeatured ?? false,
  preparationTimeMinutes: item.preparation_time ?? item.preparationTimeMinutes,
  createdAt: item.created_at ?? item.createdAt ?? new Date().toISOString(),
});

const mapCategory = (c: RawCategory, fallbackBranchId: string): Category => ({
  id: c.id,
  branchId: c.branch_id ?? c.branchId ?? fallbackBranchId,
  name: c.name,
  description: c.description ?? '',
  displayOrder: c.sort_order ?? c.sortOrder ?? c.displayOrder ?? 0,
  isActive: c.is_active ?? c.isActive ?? true,
  createdAt: c.created_at ?? c.createdAt ?? new Date().toISOString(),
});

const mapTable = (raw: RawTable, fallbackId: string, fallbackBranchId: string): Table => ({
  id: raw?.id ?? fallbackId,
  branchId: raw?.branch_id ?? raw?.branchId ?? fallbackBranchId,
  tableNumber: raw?.table_number ?? raw?.tableNumber ?? '',
  seatingCapacity: raw?.seating_capacity ?? raw?.seatingCapacity,
  capacity: raw?.seating_capacity ?? raw?.capacity,
  section: raw?.section,
  qrCodeUrl: raw?.qr_code_url ?? raw?.qrCodeUrl,
  isActive: raw?.is_active ?? raw?.isActive ?? true,
  createdAt: raw?.created_at ?? raw?.createdAt ?? new Date().toISOString(),
});

const unwrapBranches = (
  response: AxiosResponse<ApiEnvelope<BranchListPayload | RawBranch[]>>
): Branch[] => {
  const payload = response.data.data ?? response.data;
  const list = Array.isArray(payload) ? payload : (payload as BranchListPayload)?.branches;
  return Array.isArray(list) ? list.map(mapBranch) : [];
};

/** Digs the branch-menu object out of the various shapes `/public/branches/:id/menu` can return. */
const extractBranchMenu = (
  response: AxiosResponse<ApiEnvelope<BranchMenuResponsePayload | RawBranchMenu>>
): RawBranchMenu | undefined => {
  const payload = response.data.data;
  if (!payload) return undefined;

  const asMenuPayload = payload as BranchMenuResponsePayload;
  const menu = asMenuPayload.menu;
  if (menu && 'branch' in menu && menu.branch) return menu.branch;
  if (menu) return menu as RawBranchMenu;
  if (asMenuPayload.branch) return asMenuPayload.branch;
  return payload as RawBranchMenu;
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const publicMenuApi = {
  getPublicBranches: async (): Promise<{ data: Branch[] }> => {
    const response = await api.get<ApiEnvelope<BranchListPayload | RawBranch[]>>(
      '/public/branches'
    );
    return { data: unwrapBranches(response) };
  },

  getBranchPublic: async (branchId: string): Promise<{ data: Branch }> => {
    const response = await api.get<ApiEnvelope<BranchMenuResponsePayload | RawBranchMenu>>(
      `/public/branches/${branchId}/menu`
    );
    const raw = extractBranchMenu(response);
    return { data: mapBranch(raw ?? {}) };
  },

  getTableMenuPublic: async (
    tableId: string,
    branchId?: string
  ): Promise<{
    data: {
      branch: Branch;
      table: Table;
      categories: Category[];
      menuItems: MenuItem[];
    };
  }> => {
    const url = branchId
      ? `/public/branches/${branchId}/tables/${tableId}/menu`
      : `/public/tables/${tableId}/menu`;

    const response = await api.get<ApiEnvelope<TableMenuResponsePayload | RawTableMenu>>(url);
    const payload = response.data.data;
    const tableRaw: RawTableMenu | undefined =
      (payload as TableMenuResponsePayload)?.menu ?? (payload as RawTableMenu);
    const branchRaw = tableRaw?.branch;
    const tenantRaw = branchRaw?.tenant;

    const branch: Branch = mapBranch({
      ...branchRaw,
      tenant: tenantRaw,
      tenant_name: tenantRaw?.business_name,
    });

    const table: Table = mapTable(
      { branch_id: branchRaw?.id, table_number: tableRaw?.table_number },
      tableId,
      branchId ?? ''
    );

    const categoriesRaw = branchRaw?.categories ?? [];
    const categories: Category[] = [];
    const menuItems: MenuItem[] = [];

    if (Array.isArray(categoriesRaw)) {
      categoriesRaw.forEach((cat) => {
        categories.push(mapCategory(cat, branch.id));

        if (Array.isArray(cat.menu_items)) {
          cat.menu_items.forEach((item) => {
            menuItems.push(mapMenuItem(item, cat.id, cat.name));
          });
        }
      });
    }

    return { data: { branch, table, categories, menuItems } };
  },

  getTablePublic: async (tableId: string): Promise<{ data: Table }> => {
    const response = await api.get<ApiEnvelope<TablePayload | RawTable>>(`/tables/${tableId}`);
    const payload = response.data.data;
    const raw = (payload as TablePayload)?.table ?? (payload as RawTable);
    return { data: mapTable(raw ?? {}, '', '') };
  },

  getBranchCategories: async (branchId: string): Promise<{ data: Category[] }> => {
    const response = await api.get<ApiEnvelope<BranchMenuResponsePayload | RawBranchMenu>>(
      `/public/branches/${branchId}/menu`
    );
    const menuObj = extractBranchMenu(response);
    const raw = menuObj?.categories ?? [];
    const categories: Category[] = Array.isArray(raw)
      ? raw.map((c) => mapCategory(c, branchId))
      : [];
    return { data: categories };
  },

  getBranchMenuItems: async (branchId: string): Promise<{ data: MenuItem[] }> => {
    const response = await api.get<ApiEnvelope<BranchMenuResponsePayload | RawBranchMenu>>(
      `/public/branches/${branchId}/menu`
    );
    const menuObj = extractBranchMenu(response);
    const categories = menuObj?.categories ?? [];
    const items: MenuItem[] = [];

    if (Array.isArray(categories)) {
      categories.forEach((cat) => {
        if (Array.isArray(cat.menu_items)) {
          cat.menu_items.forEach((item) => {
            items.push(mapMenuItem(item, cat.id, cat.name));
          });
        }
      });
    }

    if (items.length === 0 && Array.isArray(menuObj?.menu_items)) {
      menuObj!.menu_items!.forEach((item) => {
        items.push(mapMenuItem(item));
      });
    }

    return { data: items };
  },
};