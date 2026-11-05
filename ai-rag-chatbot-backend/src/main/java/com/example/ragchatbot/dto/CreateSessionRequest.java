package com.example.ragchatbot.dto;
import jakarta.validation.constraints.Size;
public record CreateSessionRequest(@Size(max=200) String title) {}
