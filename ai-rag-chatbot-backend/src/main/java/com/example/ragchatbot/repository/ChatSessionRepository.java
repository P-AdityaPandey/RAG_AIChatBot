package com.example.ragchatbot.repository;
import com.example.ragchatbot.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ChatSessionRepository extends JpaRepository<ChatSession,String> {}
