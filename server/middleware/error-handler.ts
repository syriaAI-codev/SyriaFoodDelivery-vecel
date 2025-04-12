import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Format Zod validation errors
export function formatZodError(error: ZodError): string {
  const formattedErrors = error.errors.map(err => {
    const field = err.path.join('.');
    return `${field}: ${err.message}`;
  });
  
  return formattedErrors.join(', ');
}

// Global error handling middleware
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);
  
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: formatZodError(err)
    });
  }
  
  // Handle other known error types
  if (err.status || err.statusCode) {
    const status = err.status || err.statusCode;
    return res.status(status).json({
      success: false,
      error: err.message || 'حدث خطأ ما'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    error: 'حدث خطأ في الخادم'
  });
}
