package com.example.ragchatbot.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank String sessionId,
        @NotBlank @Size(max=12000) String message) {}
