package com.webdev.project.backend.responses;

import com.webdev.project.backend.utils.ErrorDetail;

public class ErrorResponse {
    private boolean success = false;
    private ErrorDetail error;

    public ErrorResponse(String code, String message) {
        this.error = new ErrorDetail(code, message);
    }

    public boolean isSuccess() {
        return success;
    }

    public ErrorDetail getError() {
        return error;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public void setError(ErrorDetail error) {
        this.error = error;
    }
}
