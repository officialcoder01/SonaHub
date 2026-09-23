// Validate required fields and price format for service creation
interface ServiceFields {
  title: string;
  description: string;
  price: number | string;
  categoryId: string;
}

class ValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ValidationError";
    this.status = status;
  }
}

export const validateServiceFields = ({
  title,
  description,
  price,
  categoryId
}: ServiceFields) => {
  
  if (!title || !description || price === undefined || price === "" || !categoryId) {
    throw new ValidationError(
      "title, description, price, and categoryId are required"
    );
  }

  const parsedPrice = Number(price);
  
  if (Number.isNaN(parsedPrice)) {
    throw new ValidationError("price must be a valid number");
  }

  return {
    title: String(title),
    description: String(description),
    price: parsedPrice,
    categoryId: String(categoryId),
  };
};