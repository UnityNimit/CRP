package com.credx.campus.domain.posting;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;

@Component
public class PostingMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<String> parseBranches(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    public String toJson(List<String> branches) {
        try {
            return objectMapper.writeValueAsString(branches);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }
}
