const allRoles = {
  user: [],
  admin: ["getUsers", "manageUsers"],
};

const roles = Object.keys(allRoles);
const roleValues = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleValues,
};
