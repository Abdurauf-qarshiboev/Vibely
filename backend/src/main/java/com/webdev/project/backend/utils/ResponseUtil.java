package com.webdev.project.backend.utils;

import com.webdev.project.backend.responses.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;

public class ResponseUtil {

    // Success response formatter
    public static <T> ResponseEntity<ResponseFormatter<T>> success(ResponseEntity<T> originalResponse, String message) {
        T body = originalResponse.getBody();
        HttpStatusCode status_code = originalResponse.getStatusCode();

        ResponseFormatter<T> formattedResponse = new ResponseFormatter<>(true, body, message);
        return new ResponseEntity<>(formattedResponse, status_code);
    }

    // Error response formatter
    public static ResponseEntity<ErrorResponse> error(String code, String message, HttpStatusCode status_code) {
        ErrorResponse errorResponse = new ErrorResponse(code, message);
        return new ResponseEntity<>(errorResponse, status_code);
    }
}
