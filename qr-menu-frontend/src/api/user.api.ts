import { mockStore } from '../services/mockStore';
import { User, UserRole } from '../types';
import { normalizeRole } from '../utils/roles';

// Helper to retrieve currently authenticated user from localStorage session
const getSessionUser = (): User | null => {
  try {
    const saved = localStorage.getItem('qr_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export interface CreateUserInput {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  assignedBranchIds?: string[];
  tenantId?: string;
}

export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  assignedBranchIds?: string[];
  isActive?: boolean;
}

export const userApi = {
  // ================= EXECUTIVES =================
  getExecutives: async (): Promise<{ data: User[] }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    if (role !== 'SUPER_ADMIN' && role !== 'CAFE_OWNER' && role !== 'OWNER' && role !== 'RESTAURANT_OWNER') {
      throw new Error('403 Forbidden: You do not have permission to view executives');
    }

    const allUsers = mockStore.users;
    const executives = allUsers.filter((u) => {
      const uRole = normalizeRole(u.role);
      const sameTenant = role === 'SUPER_ADMIN' || u.tenantId === current.tenantId;
      return uRole === 'EXECUTIVE' && sameTenant && u.isActive !== false;
    });

    return { data: executives };
  },

  createExecutive: async (input: CreateUserInput): Promise<{ data: User }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    if (role !== 'SUPER_ADMIN' && role !== 'CAFE_OWNER' && role !== 'OWNER' && role !== 'RESTAURANT_OWNER') {
      throw new Error('403 Forbidden: Only Cafe Owners can create Executives');
    }

    // Check email uniqueness
    const existing = mockStore.users.find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase() && u.isActive !== false
    );
    if (existing) {
      throw new Error('400 Bad Request: A user with this email address already exists');
    }

    const newExec: User = {
      id: `user-exec-${Date.now()}`,
      tenantId: current.tenantId || 'tenant-1',
      email: input.email.trim(),
      fullName: input.fullName.trim(),
      phone: input.phone?.trim() || '',
      role: 'EXECUTIVE',
      assignedBranchIds: input.assignedBranchIds || [],
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockStore.users = [...mockStore.users, newExec];

    // Log Audit
    mockStore.auditLogs = [
      {
        id: `log-${Date.now()}`,
        tenantId: newExec.tenantId,
        userId: current.id,
        userEmail: current.email,
        userName: current.fullName,
        action: 'CREATE_EXECUTIVE',
        entityName: newExec.fullName,
        details: `Created Executive account for ${newExec.fullName} (${newExec.email}) assigned to ${newExec.assignedBranchIds?.length || 0} branches`,
        ipAddress: '197.156.104.22',
        createdAt: new Date().toISOString(),
      },
      ...mockStore.auditLogs,
    ];

    return { data: newExec };
  },

  updateExecutive: async (id: string, input: UpdateUserInput): Promise<{ data: User }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    if (role !== 'SUPER_ADMIN' && role !== 'CAFE_OWNER' && role !== 'OWNER' && role !== 'RESTAURANT_OWNER') {
      throw new Error('403 Forbidden: Only Cafe Owners can update Executives');
    }

    const targetUser = mockStore.users.find((u) => u.id === id);
    if (!targetUser) throw new Error('404 Not Found: Executive not found');

    const updatedUsers = mockStore.users.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          fullName: input.fullName !== undefined ? input.fullName.trim() : u.fullName,
          email: input.email !== undefined ? input.email.trim() : u.email,
          phone: input.phone !== undefined ? input.phone.trim() : u.phone,
          assignedBranchIds: input.assignedBranchIds !== undefined ? input.assignedBranchIds : u.assignedBranchIds,
          isActive: input.isActive !== undefined ? input.isActive : u.isActive,
        };
      }
      return u;
    });

    mockStore.users = updatedUsers;
    const updated = updatedUsers.find((u) => u.id === id)!;

    return { data: updated };
  },

  deleteExecutive: async (id: string): Promise<{ data: { success: boolean } }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    if (role !== 'SUPER_ADMIN' && role !== 'CAFE_OWNER' && role !== 'OWNER' && role !== 'RESTAURANT_OWNER') {
      throw new Error('403 Forbidden: Only Cafe Owners can deactivate Executives');
    }

    // Soft delete / deactivation
    mockStore.users = mockStore.users.map((u) => (u.id === id ? { ...u, isActive: false } : u));
    return { data: { success: true } };
  },

  // ================= BRANCH MANAGERS =================
  getBranchManagers: async (branchIdFilter?: string): Promise<{ data: User[] }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    if (role === 'STAFF') {
      throw new Error('403 Forbidden: Staff cannot view branch managers');
    }

    const allUsers = mockStore.users;
    let managers = allUsers.filter((u) => {
      const uRole = normalizeRole(u.role);
      const sameTenant = role === 'SUPER_ADMIN' || u.tenantId === current.tenantId;
      return uRole === 'BRANCH_MANAGER' && sameTenant && u.isActive !== false;
    });

    // If Executive: only show branch managers in branches assigned to Executive
    if (role === 'EXECUTIVE') {
      const allowedBranchIds = current.assignedBranchIds || [];
      managers = managers.filter((m) =>
        m.assignedBranchIds?.some((bId) => allowedBranchIds.includes(bId))
      );
    } else if (role === 'BRANCH_MANAGER') {
      // Branch manager sees their own manager profile/record in branch
      const myBranchIds = current.assignedBranchIds || [];
      managers = managers.filter((m) =>
        m.assignedBranchIds?.some((bId) => myBranchIds.includes(bId))
      );
    }

    if (branchIdFilter && branchIdFilter !== 'all') {
      managers = managers.filter((m) => m.assignedBranchIds?.includes(branchIdFilter));
    }

    return { data: managers };
  },

  createBranchManager: async (input: CreateUserInput): Promise<{ data: User }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    if (role !== 'SUPER_ADMIN' && role !== 'CAFE_OWNER' && role !== 'OWNER' && role !== 'RESTAURANT_OWNER' && role !== 'EXECUTIVE') {
      throw new Error('403 Forbidden: You do not have permission to create Branch Managers');
    }

    const targetBranchIds = input.assignedBranchIds || [];
    if (targetBranchIds.length === 0) {
      throw new Error('400 Bad Request: At least one branch must be assigned to the Branch Manager');
    }

    // If Executive, verify that all assigned branches belong to the executive's allowed branches
    if (role === 'EXECUTIVE') {
      const execBranches = current.assignedBranchIds || [];
      const hasUnauthorizedBranch = targetBranchIds.some((bId) => !execBranches.includes(bId));
      if (hasUnauthorizedBranch) {
        throw new Error('403 Forbidden: You cannot assign a Branch Manager to a branch outside your authorized jurisdiction');
      }
    }

    // Check duplicate email
    const existing = mockStore.users.find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase() && u.isActive !== false
    );
    if (existing) {
      throw new Error('400 Bad Request: A user with this email address already exists');
    }

    const newManager: User = {
      id: `user-mgr-${Date.now()}`,
      tenantId: current.tenantId || 'tenant-1',
      email: input.email.trim(),
      fullName: input.fullName.trim(),
      phone: input.phone?.trim() || '',
      role: 'BRANCH_MANAGER',
      assignedBranchIds: targetBranchIds,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockStore.users = [...mockStore.users, newManager];

    // Log Audit
    mockStore.auditLogs = [
      {
        id: `log-${Date.now()}`,
        tenantId: newManager.tenantId,
        userId: current.id,
        userEmail: current.email,
        userName: current.fullName,
        action: 'CREATE_BRANCH_MANAGER',
        entityName: newManager.fullName,
        details: `Created Branch Manager ${newManager.fullName} (${newManager.email}) for branch(es) ${targetBranchIds.join(', ')}`,
        ipAddress: '197.156.104.22',
        createdAt: new Date().toISOString(),
      },
      ...mockStore.auditLogs,
    ];

    return { data: newManager };
  },

  updateBranchManager: async (id: string, input: UpdateUserInput): Promise<{ data: User }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    if (role !== 'SUPER_ADMIN' && role !== 'CAFE_OWNER' && role !== 'OWNER' && role !== 'RESTAURANT_OWNER' && role !== 'EXECUTIVE') {
      throw new Error('403 Forbidden: You do not have permission to update Branch Managers');
    }

    const targetUser = mockStore.users.find((u) => u.id === id);
    if (!targetUser) throw new Error('404 Not Found: Branch Manager not found');

    // If Executive: verify target manager is within Executive's assigned branches
    if (role === 'EXECUTIVE') {
      const execBranches = current.assignedBranchIds || [];
      const managerBranches = targetUser.assignedBranchIds || [];
      const isAuthorized = managerBranches.some((bId) => execBranches.includes(bId));
      if (!isAuthorized) {
        throw new Error('403 Forbidden: You cannot modify a Branch Manager outside your assigned branches');
      }

      // If changing assigned branch, ensure new branch is authorized
      if (input.assignedBranchIds) {
        const unauthorizedNewBranch = input.assignedBranchIds.some((bId) => !execBranches.includes(bId));
        if (unauthorizedNewBranch) {
          throw new Error('403 Forbidden: You cannot reassign this manager to a branch outside your jurisdiction');
        }
      }
    }

    const updatedUsers = mockStore.users.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          fullName: input.fullName !== undefined ? input.fullName.trim() : u.fullName,
          email: input.email !== undefined ? input.email.trim() : u.email,
          phone: input.phone !== undefined ? input.phone.trim() : u.phone,
          assignedBranchIds: input.assignedBranchIds !== undefined ? input.assignedBranchIds : u.assignedBranchIds,
          isActive: input.isActive !== undefined ? input.isActive : u.isActive,
        };
      }
      return u;
    });

    mockStore.users = updatedUsers;
    const updated = updatedUsers.find((u) => u.id === id)!;

    return { data: updated };
  },

  deleteBranchManager: async (id: string): Promise<{ data: { success: boolean } }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    if (role !== 'SUPER_ADMIN' && role !== 'CAFE_OWNER' && role !== 'OWNER' && role !== 'RESTAURANT_OWNER' && role !== 'EXECUTIVE') {
      throw new Error('403 Forbidden: You do not have permission to deactivate Branch Managers');
    }

    const targetUser = mockStore.users.find((u) => u.id === id);
    if (!targetUser) throw new Error('404 Not Found: Branch Manager not found');

    if (role === 'EXECUTIVE') {
      const execBranches = current.assignedBranchIds || [];
      const managerBranches = targetUser.assignedBranchIds || [];
      const isAuthorized = managerBranches.some((bId) => execBranches.includes(bId));
      if (!isAuthorized) {
        throw new Error('403 Forbidden: You cannot delete a Branch Manager outside your assigned branches');
      }
    }

    // Soft delete
    mockStore.users = mockStore.users.map((u) => (u.id === id ? { ...u, isActive: false } : u));
    return { data: { success: true } };
  },

  // ================= STAFF MEMBERS =================
  getStaff: async (branchIdFilter?: string): Promise<{ data: User[] }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    const allUsers = mockStore.users;

    let staff = allUsers.filter((u) => {
      const uRole = normalizeRole(u.role);
      const sameTenant = role === 'SUPER_ADMIN' || u.tenantId === current.tenantId;
      return uRole === 'STAFF' && sameTenant && u.isActive !== false;
    });

    // Scope based on role
    if (role === 'EXECUTIVE') {
      const execBranches = current.assignedBranchIds || [];
      staff = staff.filter((s) => s.assignedBranchIds?.some((bId) => execBranches.includes(bId)));
    } else if (role === 'BRANCH_MANAGER') {
      const managerBranches = current.assignedBranchIds || [];
      staff = staff.filter((s) => s.assignedBranchIds?.some((bId) => managerBranches.includes(bId)));
    } else if (role === 'STAFF') {
      // Staff member sees fellow staff in same branch
      const myBranches = current.assignedBranchIds || [];
      staff = staff.filter((s) => s.assignedBranchIds?.some((bId) => myBranches.includes(bId)));
    }

    if (branchIdFilter && branchIdFilter !== 'all') {
      staff = staff.filter((s) => s.assignedBranchIds?.includes(branchIdFilter));
    }

    return { data: staff };
  },

  createStaff: async (input: CreateUserInput): Promise<{ data: User }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    if (
      role !== 'SUPER_ADMIN' &&
      role !== 'CAFE_OWNER' &&
      role !== 'OWNER' &&
      role !== 'RESTAURANT_OWNER' &&
      role !== 'EXECUTIVE' &&
      role !== 'BRANCH_MANAGER'
    ) {
      throw new Error('403 Forbidden: Staff members cannot create other staff');
    }

    let targetBranchIds = input.assignedBranchIds || [];
    if (role === 'BRANCH_MANAGER') {
      // Must assign to branch manager's branch
      targetBranchIds = current.assignedBranchIds || ['branch-1'];
    }

    if (targetBranchIds.length === 0) {
      throw new Error('400 Bad Request: At least one branch must be assigned to staff');
    }

    if (role === 'EXECUTIVE') {
      const execBranches = current.assignedBranchIds || [];
      const hasUnauthorizedBranch = targetBranchIds.some((bId) => !execBranches.includes(bId));
      if (hasUnauthorizedBranch) {
        throw new Error('403 Forbidden: Cannot assign staff to a branch outside your authorized jurisdiction');
      }
    }

    // Check duplicate email
    const existing = mockStore.users.find(
      (u) => u.email.toLowerCase() === input.email.toLowerCase() && u.isActive !== false
    );
    if (existing) {
      throw new Error('400 Bad Request: A user with this email address already exists');
    }

    const newStaff: User = {
      id: `user-staff-${Date.now()}`,
      tenantId: current.tenantId || 'tenant-1',
      email: input.email.trim(),
      fullName: input.fullName.trim(),
      phone: input.phone?.trim() || '',
      role: 'STAFF',
      assignedBranchIds: targetBranchIds,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    mockStore.users = [...mockStore.users, newStaff];

    // Log Audit
    mockStore.auditLogs = [
      {
        id: `log-${Date.now()}`,
        tenantId: newStaff.tenantId,
        userId: current.id,
        userEmail: current.email,
        userName: current.fullName,
        action: 'CREATE_STAFF',
        entityName: newStaff.fullName,
        details: `Created Staff Member ${newStaff.fullName} (${newStaff.email}) for branch(es) ${targetBranchIds.join(', ')}`,
        ipAddress: '197.156.104.22',
        createdAt: new Date().toISOString(),
      },
      ...mockStore.auditLogs,
    ];

    return { data: newStaff };
  },

  updateStaff: async (id: string, input: UpdateUserInput): Promise<{ data: User }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    if (
      role !== 'SUPER_ADMIN' &&
      role !== 'CAFE_OWNER' &&
      role !== 'OWNER' &&
      role !== 'RESTAURANT_OWNER' &&
      role !== 'EXECUTIVE' &&
      role !== 'BRANCH_MANAGER'
    ) {
      throw new Error('403 Forbidden: You do not have permission to update staff');
    }

    const targetUser = mockStore.users.find((u) => u.id === id);
    if (!targetUser) throw new Error('404 Not Found: Staff member not found');

    if (role === 'EXECUTIVE') {
      const execBranches = current.assignedBranchIds || [];
      const staffBranches = targetUser.assignedBranchIds || [];
      const isAuthorized = staffBranches.some((bId) => execBranches.includes(bId));
      if (!isAuthorized) {
        throw new Error('403 Forbidden: You cannot modify staff outside your assigned branches');
      }
    } else if (role === 'BRANCH_MANAGER') {
      const managerBranches = current.assignedBranchIds || [];
      const staffBranches = targetUser.assignedBranchIds || [];
      const isAuthorized = staffBranches.some((bId) => managerBranches.includes(bId));
      if (!isAuthorized) {
        throw new Error('403 Forbidden: You cannot modify staff outside your branch');
      }
    }

    const updatedUsers = mockStore.users.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          fullName: input.fullName !== undefined ? input.fullName.trim() : u.fullName,
          email: input.email !== undefined ? input.email.trim() : u.email,
          phone: input.phone !== undefined ? input.phone.trim() : u.phone,
          assignedBranchIds: input.assignedBranchIds !== undefined ? input.assignedBranchIds : u.assignedBranchIds,
          isActive: input.isActive !== undefined ? input.isActive : u.isActive,
        };
      }
      return u;
    });

    mockStore.users = updatedUsers;
    const updated = updatedUsers.find((u) => u.id === id)!;

    return { data: updated };
  },

  deleteStaff: async (id: string): Promise<{ data: { success: boolean } }> => {
    const current = getSessionUser();
    if (!current) throw new Error('401 Unauthorized: Session expired');

    const role = normalizeRole(current.role);
    if (
      role !== 'SUPER_ADMIN' &&
      role !== 'CAFE_OWNER' &&
      role !== 'OWNER' &&
      role !== 'RESTAURANT_OWNER' &&
      role !== 'EXECUTIVE' &&
      role !== 'BRANCH_MANAGER'
    ) {
      throw new Error('403 Forbidden: You do not have permission to delete staff');
    }

    const targetUser = mockStore.users.find((u) => u.id === id);
    if (!targetUser) throw new Error('404 Not Found: Staff member not found');

    if (role === 'EXECUTIVE') {
      const execBranches = current.assignedBranchIds || [];
      const staffBranches = targetUser.assignedBranchIds || [];
      const isAuthorized = staffBranches.some((bId) => execBranches.includes(bId));
      if (!isAuthorized) {
        throw new Error('403 Forbidden: You cannot delete staff outside your assigned branches');
      }
    } else if (role === 'BRANCH_MANAGER') {
      const managerBranches = current.assignedBranchIds || [];
      const staffBranches = targetUser.assignedBranchIds || [];
      const isAuthorized = staffBranches.some((bId) => managerBranches.includes(bId));
      if (!isAuthorized) {
        throw new Error('403 Forbidden: You cannot delete staff outside your branch');
      }
    }

    // Soft delete
    mockStore.users = mockStore.users.map((u) => (u.id === id ? { ...u, isActive: false } : u));
    return { data: { success: true } };
  },
};
