package com.procurement.common.exception;

import com.procurement.common.response.ApiError;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException exception) {
    return error(HttpStatus.NOT_FOUND, exception);
  }

  @ExceptionHandler({BadRequestException.class, IllegalArgumentException.class})
  public ResponseEntity<ApiError> handleBadRequest(RuntimeException exception) {
    return error(HttpStatus.BAD_REQUEST, exception);
  }

  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<ApiError> handleConflict(ConflictException exception) {
    return error(HttpStatus.CONFLICT, exception);
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<ApiError> handleUnauthorized(UnauthorizedException exception) {
    return error(HttpStatus.UNAUTHORIZED, exception);
  }

  @ExceptionHandler(ForbiddenException.class)
  public ResponseEntity<ApiError> handleForbidden(ForbiddenException exception) {
    return error(HttpStatus.FORBIDDEN, exception);
  }

  private ResponseEntity<ApiError> error(HttpStatus status, RuntimeException exception) {
    ApiError body = new ApiError(Instant.now(), status.value(), status.getReasonPhrase(),
        exception.getMessage(), null, Map.of());
    return ResponseEntity.status(status).body(body);
  }
}
