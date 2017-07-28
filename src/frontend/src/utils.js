export function isInRole(profile, role)
{
  if (!profile) return false
  return Array.isArray(profile.role) ? (profile.role.filter(i => i === role).length > 0) : (profile.role === role) 
}