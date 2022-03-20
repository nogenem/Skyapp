package com.nogenem.skyapp.response.message;

import java.util.List;

import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.response.ApiResponse;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class FilesStoreResponse extends ApiResponse {

  private List<ChatMessageDTO> messagesObjs;

  public FilesStoreResponse(List<ChatMessageDTO> messagesObjs) {
    super("messages.files_uploaded");

    this.messagesObjs = messagesObjs;
  }

}
