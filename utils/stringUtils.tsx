// utils/stringUtils.ts
export function getInitialsWithoutMiddle(fullName: string): string {
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 0) return "";
  
  const firstNameInitial = nameParts[0].charAt(0).toUpperCase();
  
  if (nameParts.length === 1) {
    return firstNameInitial;
  }

  const lastNameInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  return firstNameInitial + lastNameInitial;
}