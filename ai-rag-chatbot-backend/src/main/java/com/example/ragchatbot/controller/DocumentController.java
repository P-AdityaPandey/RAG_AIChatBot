package com.example.ragchatbot.controller;
import com.example.ragchatbot.entity.KnowledgeDocument;
import com.example.ragchatbot.service.DocumentIngestionService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
@RestController
@RequestMapping("/api/documents")
public class DocumentController {
    private final DocumentIngestionService service;
    public DocumentController(DocumentIngestionService s){service=s;}
    @GetMapping
    public List<KnowledgeDocument> list(){
        return service.list();
    }
    @PostMapping(value="/upload",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public KnowledgeDocument upload(@RequestPart("file") MultipartFile file)throws IOException{
        return service.upload(file);
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id){
        service.delete(id);
    }
}
