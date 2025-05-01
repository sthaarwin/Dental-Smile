import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Get the exception response
    const exceptionResponse = exception.getResponse();
    
    // Format the response based on the type of error
    let errorResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Special handling for validation errors
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const errorObj = exceptionResponse as any;
      
      // Check if this is a validation error (typically from class-validator)
      if (errorObj.message === 'Validation failed' && Array.isArray(errorObj.errors)) {
        const formattedErrors: Record<string, string> = {};
        
        // Format validation errors for frontend consumption
        errorObj.errors.forEach((error: any) => {
          if (error.property && error.constraints) {
            // Get the first error message for this property
            const firstErrorMessage = Object.values(error.constraints)[0] as string;
            formattedErrors[error.property] = firstErrorMessage;
          }
        });
        
        errorResponse.message = 'Validation failed';
        errorResponse.errors = formattedErrors;
      } else {
        // For other types of errors, preserve the original message
        errorResponse.message = errorObj.message || 'Internal server error';
        
        // Include the original error object if it exists
        if (errorObj.errors) {
          errorResponse.errors = errorObj.errors;
        }
      }
    } else if (typeof exceptionResponse === 'string') {
      errorResponse.message = exceptionResponse;
    }

    response.status(status).json(errorResponse);
  }
}