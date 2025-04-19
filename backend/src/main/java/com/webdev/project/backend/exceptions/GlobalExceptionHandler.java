package com.webdev.project.backend.exceptions;

import com.webdev.project.backend.responses.ErrorResponse;
import com.webdev.project.backend.utils.ResponseUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        return ResponseUtil.error(
                "SIZE_00X",
                "File too large! Max size allowed is 10MB.",
                HttpStatus.PAYLOAD_TOO_LARGE
        );
    }
}
