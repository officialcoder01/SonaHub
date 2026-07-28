// Validate required fields and price format for service creation
export const validateServiceFields = ({ title, description, price, categoryId }) => {
  if (!title || !description || price === undefined || price === "" || !categoryId) {
    const error = new Error("title, description, price, and categoryId are required");
    error.status = 400;
    throw error;
  }

  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice)) {
    const error = new Error("price must be a valid number");
    error.status = 400;
    throw error;
  }

  return {
    title: String(title),
    description: String(description),
    price: parsedPrice,
    categoryId: String(categoryId),
  };
};