export const memberRoles = ['guest', 'admin', 'chain_admin'];
export const adminRoles = ['admin', 'chain_admin'];
export const canUse = (role, roles) => !roles || roles.includes(role);
export const navigation = [
  { name: 'home', path: '/home', icon: 'pi-home' },
  { name: 'catalog', path: '/catalog', icon: 'pi-search' },
  { name: 'bookings', path: '/bookings', icon: 'pi-calendar', roles: memberRoles },
  { name: 'payments', path: '/payments', icon: 'pi-credit-card', roles: memberRoles },
  { name: 'profile', path: '/profile', icon: 'pi-user', roles: memberRoles },
  { name: 'explore', path: '/explore', icon: 'pi-box' },
  { name: 'concierge', path: '/concierge', icon: 'pi-comments' },
  { name: 'accommodations', path: '/accommodations', icon: 'pi-building', roles: adminRoles },
  { name: 'bookingAdmin', path: '/bookings/manage', icon: 'pi-list', roles: adminRoles },
  { name: 'users', path: '/users', icon: 'pi-users', roles: adminRoles },
  { name: 'profiles', path: '/profiles', icon: 'pi-address-book', roles: adminRoles },
  { name: 'analytics', path: '/analytics', icon: 'pi-chart-bar', roles: adminRoles },
];
