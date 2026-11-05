package com.example.ragchatbot.service;
import com.example.ragchatbot.entity.*;
import com.example.ragchatbot.repository.*;
import com.example.ragchatbot.entity.ChatMessage;
import com.example.ragchatbot.entity.ChatSession;
import com.example.ragchatbot.repository.ChatMessageRepository;
import com.example.ragchatbot.repository.ChatSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;
@Service public class SessionService {
    private final ChatSessionRepository sessions;
    private final ChatMessageRepository messages;
    public SessionService(ChatSessionRepository s, ChatMessageRepository m){
        sessions=s;messages=m;
    }
    public List<ChatSession> list(){
        return sessions.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,"updatedAt"));
    }
    public ChatSession create(String title){
        ChatSession s=new ChatSession();
        s.setTitle(title==null||title.isBlank()?"New conversation":title.trim());
        return sessions.save(s);
    }
    public ChatSession require(String id){
        return sessions.findById(id).orElseThrow(()->new NoSuchElementException("Conversation not found: "+id));
    }
    public List<ChatMessage> messages(String id){require(id);
        return messages.findBySessionIdOrderByCreatedAtAsc(id);
    }
    public ChatMessage saveMessage(String sid, String role, String content){
        ChatMessage m=new ChatMessage();
        m.setSessionId(sid);
        m.setRole(role);
        m.setContent(content);
        m.setProvider("GEMINI");
        ChatMessage saved=messages.save(m);
        ChatSession s=require(sid);
        s.setUpdatedAt(Instant.now());
        sessions.save(s);
        return saved;
    }
    @Transactional
    public void delete(String id){require(id);
        messages.deleteBySessionId(id);
        sessions.deleteById(id);
    }
}
