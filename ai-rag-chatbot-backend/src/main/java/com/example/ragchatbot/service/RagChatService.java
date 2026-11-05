package com.example.ragchatbot.service;
import com.example.ragchatbot.dto.ChatResponse;
import com.example.ragchatbot.entity.ChatMessage;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
@Service
public class RagChatService {
    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final SessionService sessions;
    public RagChatService(ChatClient.Builder builder,VectorStore vectorStore,SessionService sessions){
        this.chatClient=builder.build();
        this.vectorStore=vectorStore;
        this.sessions=sessions;
    }
    public ChatResponse chat(String sessionId,String question){
        sessions.require(sessionId);
        List<Document> matches=vectorStore.similaritySearch(SearchRequest.builder().query(question).topK(5).similarityThreshold(0.25).build());
        String context=matches.isEmpty()?"No matching passages were found in the uploaded knowledge base.":matches.stream().map(d->"[Source: "+d.getMetadata().getOrDefault("fileName","document")+", chunk "+d.getMetadata().getOrDefault("chunkIndex","?")+ "]\n"+d.getText()).collect(Collectors.joining("\n\n---\n\n"));
        String prompt="You are a helpful assistant. Answer the user's question using the supplied retrieved context when relevant. If the context does not contain the answer, say that you could not find the answer in the uploaded documents; you may then provide a clearly labelled general answer if useful. Never invent citations. Cite source file names in the answer when making document-grounded claims.\n\nRETRIEVED CONTEXT:\n"+context+"\n\nUSER QUESTION:\n"+question;
        ChatMessage user=sessions.saveMessage(sessionId,"USER",question);
        String answer=chatClient.prompt().user(prompt).call().content();
        ChatMessage assistant=sessions.saveMessage(sessionId,"ASSISTANT",answer==null?"I couldn't generate a response. Please try again.":answer);
        List<ChatResponse.SourceReference> sources=matches.stream().map(d->new ChatResponse.SourceReference(String.valueOf(d.getMetadata().getOrDefault("fileName","Document")),String.valueOf(d.getMetadata().getOrDefault("documentId","")),toInt(d.getMetadata().get("chunkIndex")),excerpt(d.getText()))).distinct().toList();return new ChatResponse(user,assistant,sources);
    }
    private Integer toInt(Object o){
        try{
            return o==null?null:Integer.valueOf(o.toString());
        }
        catch(Exception e){
            return null;
        }
    }
    private String excerpt(String text){if(text==null)return "";
        return text.length()>240?text.substring(0,240)+"…":text;} }
