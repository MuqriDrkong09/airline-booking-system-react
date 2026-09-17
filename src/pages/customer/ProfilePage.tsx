import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { AppAlert, AppButton, AppCard, ErrorState, PageContainer } from '@/components/common';
import { ChangePasswordForm } from '@/features/profile/components/ChangePasswordForm';
import { ProfileEditForm } from '@/features/profile/components/ProfileEditForm';
import { ProfilePageSkeleton } from '@/features/profile/components/ProfilePageSkeleton';
import { ProfileView } from '@/features/profile/components/ProfileView';
import { useProfileQuery } from '@/features/profile/hooks/useProfile';

export function ProfilePage() {
  const profileQuery = useProfileQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (profileQuery.isLoading) {
    return (
      <PageContainer title="Profile" description="Manage your personal details and travel preferences.">
        <ProfilePageSkeleton />
      </PageContainer>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <PageContainer title="Profile">
        <ErrorState
          title="Unable to load profile"
          message="We could not load your profile right now. Please try again."
          onRetry={() => {
            void profileQuery.refetch();
          }}
        />
      </PageContainer>
    );
  }

  const user = profileQuery.data;

  return (
    <PageContainer
      title="Profile"
      description="View and update your personal details, contact information, and travel preferences."
      action={
        isEditing ? null : (
          <AppButton variant="contained" onClick={() => setIsEditing(true)}>
            Edit profile
          </AppButton>
        )
      }
    >
      <Stack spacing={3}>
        {successMessage ? (
          <AppAlert
            severity="success"
            title="Saved"
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </AppAlert>
        ) : null}

        <AppCard
          title={isEditing ? 'Edit profile' : 'Personal details'}
          subtitle={
            isEditing
              ? 'Update your contact details and travel preferences.'
              : `${user.email} · Customer account`
          }
        >
          {isEditing ? (
            <ProfileEditForm
              user={user}
              onCancel={() => setIsEditing(false)}
              onSuccess={(message) => {
                setSuccessMessage(message);
                setIsEditing(false);
              }}
            />
          ) : (
            <ProfileView user={user} />
          )}
        </AppCard>

        <AppCard
          title="Change password"
          subtitle="Choose a strong password you do not use elsewhere."
        >
          <ChangePasswordForm
            onSuccess={(message) => {
              setSuccessMessage(message);
            }}
          />
        </AppCard>

        <Typography variant="caption" color="text.secondary">
          Email changes require support verification and are not available in this release.
        </Typography>
      </Stack>
    </PageContainer>
  );
}
