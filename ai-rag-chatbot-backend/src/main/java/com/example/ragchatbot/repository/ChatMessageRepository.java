package com.example.ragchatbot.repository;
import com.example.ragchatbot.entity.ChatMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ChatMessageRepository extends JpaRepository<ChatMessage,String> {
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    void deleteBySessionId(String sessionId); }
