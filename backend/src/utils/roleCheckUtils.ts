// Helper function to ensure only vendors can create or view services
export const assertVendor = (role: string, message: string) => {
  if (role !== "VENDOR") {
    const error = new Error(message) as Error & { status: number };
    error.status = 403;
    throw error;
  }
};

export const assertCustomer = (role: string, message: string) => {
  if (role !== "CUSTOMER") {
    const error = new Error(message) as Error & { status: number };
    error.status = 403;
    throw error;
  }
};

export const assertAdmin = (role: string, message: string) => {
  if (role !== "ADMIN") {
    const error = new Error(message) as Error & { status: number };
    error.status = 403;
    throw error;
  }
}
