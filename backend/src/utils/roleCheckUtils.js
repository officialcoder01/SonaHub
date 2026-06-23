// Helper function to ensure only vendors can create or view services
export const assertVendor = (role, message) => {
  if (role !== "VENDOR") {
    const error = new Error(message);
    error.status = 403;
    throw error;
  }
};