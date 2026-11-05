
package com.example.ragchatbot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Id;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "chat_messages",
        indexes = {
                @Index(
                        name = "idx_messages_session_created",
                        columnList = "session_id,created_at"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "session_id", nullable = false, length = 36)
    private String sessionId;

    @Column(nullable = false, length = 20)
    private String role;

    @Column(nullable = false, columnDefinition = "text")
    private String content;

    @Column(nullable = false, length = 30)
    private String provider = "GEMINI";

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {

        if (id == null) {
            id = UUID.randomUUID().toString();
        }

        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
