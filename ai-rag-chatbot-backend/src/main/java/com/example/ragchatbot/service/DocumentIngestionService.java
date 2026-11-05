package com.example.ragchatbot.service;
import com.example.ragchatbot.entity.KnowledgeDocument;
import com.example.ragchatbot.repository.KnowledgeDocumentRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.*;
@Service public class DocumentIngestionService {
    private static final long MAX_BYTES=15L*1024*1024;
    private final VectorStore vectorStore;
    private final KnowledgeDocumentRepository repository;
    public DocumentIngestionService(VectorStore v,KnowledgeDocumentRepository r){
        vectorStore=v;repository=r;
    }
    public KnowledgeDocument upload(MultipartFile file) throws IOException {
        if(file.isEmpty())throw new IllegalArgumentException("The uploaded file is empty.");
        if(file.getSize()>MAX_BYTES)throw new IllegalArgumentException("File exceeds the 15 MB upload limit.");String name=Objects.requireNonNullElse(file.getOriginalFilename(),"upload.txt");String lower=name.toLowerCase(Locale.ROOT);String text;if(lower.endsWith(".pdf")){
            try(PDDocument pdf=Loader.loadPDF(file.getBytes())){text=new PDFTextStripper().getText(pdf);
            }
        }else if(lower.endsWith(".txt")||lower.endsWith(".md")||lower.endsWith(".csv")){
            text=new String(file.getBytes(),java.nio.charset.StandardCharsets.UTF_8);
        }else throw new IllegalArgumentException("Unsupported file type. Upload PDF, TXT, MD, or CSV.");
        text=text.replace("\u0000","").trim();
        if(text.isBlank())throw new IllegalArgumentException("No readable text was found. Scanned PDFs need OCR, which is not included in this MVP.");
        KnowledgeDocument record=new KnowledgeDocument();
        record.setFileName(name);
        record.setContentType(Objects.requireNonNullElse(file.getContentType(),"application/octet-stream"));
        record.setSizeBytes(file.getSize());record.setStatus("PROCESSING");
        record=repository.save(record);
        List<String> vectorIds=new ArrayList<>();
        List<Document> chunks=chunk(text,record.getId(),name);
        try{vectorStore.add(chunks);
            for(Document d:chunks)vectorIds.add(d.getId());
            record.setChunkCount(chunks.size());
            record.setVectorIds(String.join(",",vectorIds));
            record.setStatus("INDEXED");
            return repository.save(record);
        }catch(RuntimeException e){
            record.setStatus("FAILED");
            repository.save(record);throw e;
        }
    }
    private List<Document> chunk(String text,String docId,String name){
        int chunkSize=1200,overlap=180;List<Document> out=new ArrayList<>();
        int start=0,index=0;
        while(start<text.length()){
            int end=Math.min(text.length(),start+chunkSize);
            if(end<text.length()){int space=text.lastIndexOf(' ',end);
                if(space>start+chunkSize/2)end=space;}String piece=text.substring(start,end).trim();
            if(!piece.isEmpty()){Map<String,Object> meta=new HashMap<>();meta.put("documentId",docId);meta.put("fileName",name);
                meta.put("chunkIndex",index++);out.add(new Document(UUID.randomUUID().toString(),piece,meta));}
            if(end>=text.length())break;start=Math.max(start+1,end-overlap);}return out;
    }
    public List<KnowledgeDocument> list(){
        return repository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,"createdAt"));
    }
    public void delete(String id){KnowledgeDocument doc=repository.findById(id).orElseThrow(()->new NoSuchElementException("Document not found: "+id));
        if(doc.getVectorIds()!=null&&!doc.getVectorIds().isBlank())
            vectorStore.delete(Arrays.asList(doc.getVectorIds().split(",")));
        repository.delete(doc);
    }
}
