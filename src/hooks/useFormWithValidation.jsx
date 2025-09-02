//src/hooks/useFormWithValidation.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';


export const useFormWithValidation = (validationSchema, defaultValues = {}) => {
  const formOptions = {
    defaultValues,
    ...(validationSchema && { resolver: zodResolver(validationSchema) }),
  };

  const formMethods = useForm(formOptions);

  return {
    ...formMethods,
    errors: formMethods.formState.errors,
  };
};