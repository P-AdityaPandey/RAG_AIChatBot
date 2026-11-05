
package com.example.ragchatbot.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "knowledge_documents")
@Getter
@Setter
@NoArgsConstructor
public class KnowledgeDocument {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false, length = 30)
    private String contentType;

    @Column(nullable = false)
    private long sizeBytes;

    @Column(nullable = false)
    private int chunkCount;

    @Column(nullable = false, length = 20)
    private String status = "INDEXED";

    @Column(columnDefinition = "text")
    private String vectorIds;

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
