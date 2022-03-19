package com.nogenem.skyapp.controller;

import java.util.List;
import java.util.stream.Collectors;

import javax.validation.Valid;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.enums.MessageType;
import com.nogenem.skyapp.exception.NotMemberOfChannelException;
import com.nogenem.skyapp.exception.TranslatableApiException;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.requestBody.message.StoreMessageRequestBody;
import com.nogenem.skyapp.response.message.MessageStoreResponse;
import com.nogenem.skyapp.response.message.PaginatedMessagesResponse;
import com.nogenem.skyapp.service.ChannelService;
import com.nogenem.skyapp.service.MessageService;
import com.nogenem.skyapp.service.SocketIoService;
import com.nogenem.skyapp.service.UserService;
import com.nogenem.skyapp.socketEventData.MessagesReceived;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/channel")
@AllArgsConstructor
public class MessageController {

  private UserService userService;
  private ChannelService channelService;
  private MessageService messageService;
  private SocketIoService socketIoService;

  @GetMapping("/{channelId}/messages")
  public PaginatedMessagesResponse all(@PathVariable("channelId") String channelId,
      @RequestParam(defaultValue = "0") int offset,
      @RequestParam(defaultValue = "30") int limit,
      @RequestParam(defaultValue = "-createdAt") String sort,
      @RequestHeader HttpHeaders headers) throws TranslatableApiException {

    User loggedInUser = userService.getLoggedInUser();

    Channel channel = this.channelService.getChannelByIdAndUserId(channelId, loggedInUser.getId());
    if(channel == null) {
      throw new NotMemberOfChannelException();
    }

    Sort sortBy = this.getSortBy(sort);
    Pageable paging = PageRequest.of(offset / limit, limit, sortBy);
    Page<Message> page = this.messageService.findPageByChannelId(channel.getId(), paging);

    return new PaginatedMessagesResponse(page);
  }

  @PostMapping("/{channelId}/messages")
  @ResponseStatus(HttpStatus.CREATED)
  public MessageStoreResponse messageStore(@PathVariable("channelId") String channelId,
      @Valid @RequestBody StoreMessageRequestBody requestBody,
      @RequestHeader HttpHeaders headers) throws TranslatableApiException {

    User loggedInUser = userService.getLoggedInUser();

    Channel channel = this.channelService.getChannelByIdAndUserId(channelId, loggedInUser.getId());
    if(channel == null) {
      throw new NotMemberOfChannelException();
    }

    Message message = new Message();
    message.setChannelId(channelId);
    message.setFromId(loggedInUser.getId());
    message.setBody(requestBody.getBody());
    message.setType(MessageType.TEXT);

    this.messageService.save(message);

    ChatChannelDTO channelDTO = new ChatChannelDTO(channel, null, -1);
    List<ChatMessageDTO> messagesDTOs = List.of(message).stream()
        .map(m -> new ChatMessageDTO(m))
        .collect(Collectors.toList());

    this.socketIoService.emit(SocketEvents.IO_MESSAGES_RECEIVED,
        new MessagesReceived(channelDTO, messagesDTOs));

    return new MessageStoreResponse(messagesDTOs.get(0));
  }

  private Sort getSortBy(String sort) {
    // This is how it works on moongoosejs [ex: -createdAt]
    Sort.Direction dir = Sort.Direction.ASC;
    if(sort.startsWith("-")) {
      dir = Sort.Direction.DESC;
    }

    sort = sort.replaceAll("(\\-|\\+)", "");
    return Sort.by(dir, sort);
  }
}
