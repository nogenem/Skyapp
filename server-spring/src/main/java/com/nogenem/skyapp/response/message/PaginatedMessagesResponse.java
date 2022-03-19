package com.nogenem.skyapp.response.message;

import java.util.List;
import java.util.stream.Collectors;

import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.model.Message;

import org.springframework.data.domain.Page;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class PaginatedMessagesResponse {

  private List<ChatMessageDTO> docs;
  private long totalDocs;

  public PaginatedMessagesResponse(Page<Message> page) {
    // This is what the front-end expects, since it was made
    // initially with the node.js backend that uses mongoose.js
    this.docs = page.getContent()
      .stream()
      .map(message -> new ChatMessageDTO(message))
      .collect(Collectors.toList());
    this.totalDocs = page.getTotalElements();
  }

}
