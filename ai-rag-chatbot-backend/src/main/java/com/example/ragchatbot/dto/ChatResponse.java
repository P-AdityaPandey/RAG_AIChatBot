package com.example.ragchatbot.dto;
import com.example.ragchatbot.entity.ChatMessage;
import java.util.List;

public record ChatResponse(ChatMessage userMessage,
                           ChatMessage assistantMessage,
                           List<SourceReference> sources) {
    public record SourceReference(String fileName,
                                  String documentId,
                                  Integer chunkIndex,
                                  String excerpt)
    {}
}
