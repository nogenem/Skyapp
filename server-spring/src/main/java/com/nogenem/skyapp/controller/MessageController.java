package com.nogenem.skyapp.controller;

import java.awt.image.BufferedImage;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import javax.imageio.ImageIO;
import javax.validation.Valid;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.enums.MessageType;
import com.nogenem.skyapp.exception.CantDeleteThisMessageException;
import com.nogenem.skyapp.exception.CantEditThisMessageException;
import com.nogenem.skyapp.exception.NotMemberOfChannelException;
import com.nogenem.skyapp.model.Attachment;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.requestBody.message.StoreMessageRequestBody;
import com.nogenem.skyapp.requestBody.message.UpdateMessageRequestBody;
import com.nogenem.skyapp.response.message.FilesStoreResponse;
import com.nogenem.skyapp.response.message.MessageDeleteResponse;
import com.nogenem.skyapp.response.message.MessageStoreResponse;
import com.nogenem.skyapp.response.message.PaginatedMessagesResponse;
import com.nogenem.skyapp.service.ChannelService;
import com.nogenem.skyapp.service.FilesStorageService;
import com.nogenem.skyapp.service.MessageService;
import com.nogenem.skyapp.service.SocketIoService;
import com.nogenem.skyapp.service.UserService;
import com.nogenem.skyapp.socketEventData.MessageDeleted;
import com.nogenem.skyapp.socketEventData.MessageEdited;
import com.nogenem.skyapp.socketEventData.MessagesReceived;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/channel")
@AllArgsConstructor
public class MessageController {

  private final UserService userService;
  private final ChannelService channelService;
  private final MessageService messageService;
  private final SocketIoService socketIoService;
  private final FilesStorageService filesStorageService;

  @GetMapping("/{channelId}/messages")
  public PaginatedMessagesResponse messageAll(@PathVariable("channelId") String channelId,
      @RequestParam(defaultValue = "0") int offset,
      @RequestParam(defaultValue = "30") int limit,
      @RequestParam(defaultValue = "-createdAt") String sort,
      @RequestHeader HttpHeaders headers) {

    User loggedInUser = this.userService.getLoggedInUser();

    Channel channel = this.channelService.findByIdAndMemberId(channelId, loggedInUser.getId());
    if (channel == null) {
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
      @RequestHeader HttpHeaders headers) {

    User loggedInUser = this.userService.getLoggedInUser();

    Channel channel = this.channelService.findByIdAndMemberId(channelId, loggedInUser.getId());
    if (channel == null) {
      throw new NotMemberOfChannelException();
    }

    Message message = new Message();
    message.setChannelId(channelId);
    message.setFromId(loggedInUser.getId());
    message.setBody(requestBody.getBody());
    message.setType(MessageType.TEXT);

    message = this.messageService.save(message);

    ChatChannelDTO channelDTO = new ChatChannelDTO(channel);
    List<ChatMessageDTO> messagesDTOs = List.of(message).stream()
        .map(m -> new ChatMessageDTO(m))
        .collect(Collectors.toList());

    this.socketIoService.emit(SocketEvents.IO_MESSAGES_RECEIVED,
        new MessagesReceived(channelDTO, messagesDTOs));

    return new MessageStoreResponse(messagesDTOs.get(0));
  }

  @PatchMapping("/{channelId}/messages/{messageId}")
  public MessageStoreResponse messageUpdate(@PathVariable("channelId") String channelId,
      @PathVariable("messageId") String messageId,
      @Valid @RequestBody UpdateMessageRequestBody requestBody,
      @RequestHeader HttpHeaders headers) {

    User loggedInUser = this.userService.getLoggedInUser();

    Channel channel = this.channelService.findByIdAndMemberId(channelId, loggedInUser.getId());
    if (channel == null) {
      throw new NotMemberOfChannelException();
    }

    Message message = this.messageService.findMessageToEdit(
        messageId, channelId, loggedInUser.getId(), MessageType.TEXT);
    if (message == null) {
      throw new CantEditThisMessageException();
    }

    message.setBody(requestBody.getNewBody());

    message = this.messageService.save(message);

    ChatMessageDTO messageDTO = new ChatMessageDTO(message);
    ChatChannelDTO channelDTO = new ChatChannelDTO(channel);

    this.socketIoService.emit(SocketEvents.IO_MESSAGE_EDITED,
        new MessageEdited(channelDTO, messageDTO));

    return new MessageStoreResponse(messageDTO);
  }

  @PostMapping("/{channelId}/files")
  public FilesStoreResponse filesStore(@PathVariable("channelId") String channelId,
      @RequestParam("files") MultipartFile[] files,
      @RequestHeader HttpHeaders headers) {

    User loggedInUser = this.userService.getLoggedInUser();

    Channel channel = this.channelService.findByIdAndMemberId(channelId, loggedInUser.getId());
    if (channel == null) {
      throw new NotMemberOfChannelException();
    }

    List<Attachment> attachments = new ArrayList<>();
    for (int i = 0; i < files.length; i++) {
      MultipartFile file = files[i];
      Path path = this.filesStorageService.save(file);

      Attachment attachment = new Attachment();
      attachment.setOriginalName(file.getOriginalFilename());
      attachment.setMimeType(file.getContentType());
      attachment.setSize(file.getSize());
      attachment.setPath(path.toString());

      if (attachment.getMimeType().startsWith("image/")) {
        BufferedImage bimg;
        try {
          bimg = ImageIO.read(path.toFile());
          int width = bimg.getWidth();
          int height = bimg.getHeight();

          Attachment.ImageDimensions dim = attachment.new ImageDimensions();
          dim.setWidth(width);
          dim.setHeight(height);

          attachment.setImageDimensions(dim);
        } catch (IOException e) {
          e.printStackTrace();
        }
      }

      attachments.add(attachment);
    }

    List<Message> messages = this.messageService.createMessagesWithAttachment(channelId, attachments,
        loggedInUser.getId());

    ChatChannelDTO channelDTO = new ChatChannelDTO(channel);
    List<ChatMessageDTO> messagesDTOs = messages.stream()
        .map(message -> new ChatMessageDTO(message))
        .collect(Collectors.toList());

    this.socketIoService.emit(SocketEvents.IO_MESSAGES_RECEIVED,
        new MessagesReceived(channelDTO, messagesDTOs));

    return new FilesStoreResponse(messagesDTOs);
  }

  @DeleteMapping("/{channelId}/messages/{messageId}")
  public MessageDeleteResponse messageDelete(@PathVariable("channelId") String channelId,
      @PathVariable("messageId") String messageId,
      @RequestHeader HttpHeaders headers) {

    User loggedInUser = this.userService.getLoggedInUser();

    Channel channel = this.channelService.findByIdAndMemberId(channelId, loggedInUser.getId());
    if (channel == null) {
      throw new NotMemberOfChannelException();
    }

    Message message = this.messageService.findMessageToDelete(
        messageId, channelId, loggedInUser.getId());
    if (message == null) {
      throw new CantDeleteThisMessageException();
    }

    this.messageService.delete(message);

    if (message.getType() == MessageType.UPLOADED_FILE) {
      Attachment attachment = (Attachment) message.getBody();
      this.filesStorageService.delete(attachment.getPath());
    }

    Message lastMessageRecord = this.messageService.findLastMessage(channelId);

    ChatChannelDTO channelDTO = new ChatChannelDTO(channel);
    ChatMessageDTO messageDTO = new ChatMessageDTO(message);
    ChatMessageDTO lastMessageDTO = lastMessageRecord != null ? new ChatMessageDTO(lastMessageRecord) : null;

    this.socketIoService.emit(SocketEvents.IO_MESSAGE_DELETED,
        new MessageDeleted(channelDTO, messageDTO, lastMessageDTO));

    return new MessageDeleteResponse(messageDTO, lastMessageDTO);
  }

  private Sort getSortBy(String sort) {
    // This is how it works on moongoosejs [ex: -createdAt]
    Sort.Direction dir = Sort.Direction.ASC;
    if (sort.startsWith("-")) {
      dir = Sort.Direction.DESC;
    }

    sort = sort.replaceAll("(\\-|\\+)", "");
    return Sort.by(dir, sort);
  }
}
