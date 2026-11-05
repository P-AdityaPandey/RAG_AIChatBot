package com.example.ragchatbot.controller;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String,Object>> notFound(Exception e){
        return ResponseEntity.status(404).body(Map.of("message",e.getMessage()));
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,Object>> badRequest(Exception e){
        return ResponseEntity.badRequest().body(Map.of("message",e.getMessage()));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> internal(Exception e){
        return ResponseEntity.status(500).body(Map.of("message",e.getMessage()==null?"Unexpected server error":e.getMessage()));
    }
}
