export interface DemoUser {
  name: string;
  email: string;
  roleLabel: string;
}

export const DEMO_CUSTOMER: DemoUser = {
  name: 'Alex Traveler',
  email: 'alex.traveler@example.com',
  roleLabel: 'Customer',
};

export const DEMO_ADMIN: DemoUser = {
  name: 'Jordan Admin',
  email: 'jordan.admin@example.com',
  roleLabel: 'Administrator',
};
