import { ADMIN_AREA_ROLES } from '../utils/rbac';
import { RoleRoute } from './RoleRoute';

/** Guard for admin pages: `ADMIN` only. */
export function AdminRoute() {
  return <RoleRoute allowedRoles={ADMIN_AREA_ROLES} />;
}
