package com.webdev.project.backend.dto;

public class MarkAllReadResponseDTO {
    private final Integer affected;

    public MarkAllReadResponseDTO(Integer affected) {
        this.affected = affected;
    }

    public Integer getAffected() { return affected; }
}