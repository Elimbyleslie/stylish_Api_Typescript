 interface Role {
        name: string;
        permissions: PermissionOnRole[];
      }

      interface PermissionOnRole {
        permission: Permission;
      }

      interface Permission {
        name: string;
      }

   export    interface UserRole {
        role: Role;
      }
