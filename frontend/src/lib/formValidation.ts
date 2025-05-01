import { ServiceCategory } from '../types/service';

// Validation rules for common form fields
export const validators = {
  // String validations
  required: (value: string | undefined | null) => 
    value !== undefined && value !== null && value.trim() !== '' ? null : 'This field is required',
  
  minLength: (length: number) => (value: string | undefined | null) => 
    value && value.length >= length ? null : `Must be at least ${length} characters`,
  
  maxLength: (length: number) => (value: string | undefined | null) => 
    !value || value.length <= length ? null : `Cannot exceed ${length} characters`,
  
  email: (value: string | undefined | null) => 
    !value || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) ? null : 'Invalid email address',
  
  phone: (value: string | undefined | null) => 
    !value || /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value) ? null : 'Invalid phone number',
  
  // Number validations
  isNumber: (value: any) => 
    !isNaN(Number(value)) ? null : 'Must be a valid number',
  
  min: (minValue: number) => (value: any) => 
    Number(value) >= minValue ? null : `Must be at least ${minValue}`,
  
  max: (maxValue: number) => (value: any) => 
    Number(value) <= maxValue ? null : `Cannot exceed ${maxValue}`,
    
  // Dental service specific validations
  serviceCategory: (value: string | undefined | null) => 
    !value || Object.values(ServiceCategory).includes(value as ServiceCategory) ? 
      null : 'Invalid service category'
};

// Utility function to run multiple validations on a single field
export const runValidations = (value: any, validatorFns: ((value: any) => string | null)[]) => {
  for (const validatorFn of validatorFns) {
    const error = validatorFn(value);
    if (error) {
      return error;
    }
  }
  return null;
};

// Dental service form validation
export const validateDentalServiceForm = (formData: any) => {
  const errors: Record<string, string> = {};

  // Validate name
  const nameError = runValidations(formData.name, [
    validators.required, 
    validators.minLength(3),
    validators.maxLength(100)
  ]);
  if (nameError) errors.name = nameError;

  // Validate description
  const descriptionError = runValidations(formData.description, [
    validators.required, 
    validators.minLength(10),
    validators.maxLength(1000)
  ]);
  if (descriptionError) errors.description = descriptionError;

  // Validate duration
  const durationError = runValidations(formData.duration, [
    validators.isNumber,
    validators.min(5)
  ]);
  if (durationError) errors.duration = durationError;

  // Validate price
  const priceError = runValidations(formData.price, [
    validators.isNumber,
    validators.min(0)
  ]);
  if (priceError) errors.price = priceError;

  // Validate category if provided
  if (formData.category) {
    const categoryError = validators.serviceCategory(formData.category);
    if (categoryError) errors.category = categoryError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};