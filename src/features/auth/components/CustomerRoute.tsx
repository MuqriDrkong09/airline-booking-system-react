import { CUSTOMER_AREA_ROLES } from '../utils/rbac';
import { RoleRoute } from './RoleRoute';

/** Guard for customer pages: `USER` and `ADMIN`. */
export function CustomerRoute() {
  return <RoleRoute allowedRoles={CUSTOMER_AREA_ROLES} />;
}
