import { PageContainer } from '@/components/common';
import { AdminUsersView } from '@/features/adminUsers';

export function AdminUsersPage() {
  return (
    <PageContainer
      title="Users"
      description="Search, filter, and manage customer and administrator accounts, roles, and status."
    >
      <AdminUsersView />
    </PageContainer>
  );
}
