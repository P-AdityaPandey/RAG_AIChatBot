package com.example.ragchatbot.controller;
import com.example.ragchatbot.dto.*;
import com.example.ragchatbot.dto.ChatRequest;
import com.example.ragchatbot.dto.ChatResponse;
import com.example.ragchatbot.service.RagChatService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final RagChatService service;
    public ChatController(RagChatService s){service=s;}
    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest req){
        return service.chat(req.sessionId(),req.message());
    }
}
