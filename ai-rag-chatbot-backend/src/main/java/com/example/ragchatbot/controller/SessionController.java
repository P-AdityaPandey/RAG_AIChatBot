package com.example.ragchatbot.controller;
import com.example.ragchatbot.dto.CreateSessionRequest;
import com.example.ragchatbot.entity.*;
import com.example.ragchatbot.entity.ChatMessage;
import com.example.ragchatbot.entity.ChatSession;
import com.example.ragchatbot.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    private final SessionService service;
    public SessionController(SessionService s){
        service=s;
    }
    @GetMapping
    public List<ChatSession> list(){
        return service.list();
    }
    @PostMapping public ChatSession create(@Valid @RequestBody(required=false) CreateSessionRequest req){
        return service.create(req==null?null:req.title());
    }
    @GetMapping("/{id}/messages")
    public List<ChatMessage> messages(@PathVariable String id){
        return service.messages(id);
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id){
        service.delete(id);
    }
}
