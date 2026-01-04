export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'red';
    case 'petSitter':
      return 'blue';
    case 'petOwner':
      return 'green';
    default:
      return 'default';
  }
};

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'petSitter':
      return 'Pet Sitter';
    case 'petOwner':
      return 'Pet Owner';
    default:
      return role;
  }
};
