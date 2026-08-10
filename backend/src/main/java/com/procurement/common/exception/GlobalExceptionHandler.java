package com.procurement.common.exception;

import com.procurement.common.response.ApiError;
import java.time.Instant;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

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

  @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
  public ResponseEntity<ApiError> handleAccessDenied(
      org.springframework.security.access.AccessDeniedException exception) {
    return error(HttpStatus.FORBIDDEN,
        new ForbiddenException("You do not have permission to perform this action"));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> handleUnexpected(Exception exception) {
    log.error("Unhandled exception", exception);
    ApiError body = new ApiError(Instant.now(), HttpStatus.INTERNAL_SERVER_ERROR.value(),
        HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
        "An unexpected error occurred", null, Map.of());
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
  }

  private ResponseEntity<ApiError> error(HttpStatus status, RuntimeException exception) {
    ApiError body = new ApiError(Instant.now(), status.value(), status.getReasonPhrase(),
        exception.getMessage(), null, Map.of());
    return ResponseEntity.status(status).body(body);
  }
}
