package com.nogenem.skyapp.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.nogenem.skyapp.enums.MessageType;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.repository.MessageRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MessageService {

  private MessageRepository messageRepository;

  public List<Message> findAll() {
    return this.messageRepository.findAll();
  }

  public Page<Message> findPageByChannelId(String channelId, Pageable paging) {
    return this.messageRepository.findPageByChannelId(channelId, paging);
  }

  public Message findMessageToEdit(String id, String channelId, String fromId, MessageType type) {
    return this.messageRepository.findMessageToEdit(id, channelId, fromId, type.getValue());
  }

  public Message findMessageToDelete(String id, String channelId, String fromId) {
    return this.messageRepository.findMessageToDelete(id, channelId, fromId);
  }

  public Message save(Message message) {
    Instant now = Instant.now();
    if (message.getCreatedAt() == null) {
      message.setCreatedAt(now);
    }
    message.setUpdatedAt(now);

    return this.messageRepository.save(message);
  }

  public Integer countUnreadMessages(String channelId, Instant memberLastSeen) {
    return this.messageRepository.countUnreadMessages(channelId, memberLastSeen);
  }

  public List<Message> saveAll(List<Message> messages) {
    Instant now = Instant.now();

    for (Message message : messages) {
      // Without this, all dates would be the same...
      now = now.plus(1, ChronoUnit.MILLIS);

      if (message.getId() == null || message.getId().isEmpty() || message.getCreatedAt() == null) {
        message.setCreatedAt(now);
      }
      message.setUpdatedAt(now);
    }

    return this.messageRepository.saveAll(messages);
  }

  public void delete(Message message) {
    this.messageRepository.delete(message);
  }

  public Message getLastMessage(String channelId) {
    return this.messageRepository.getStreamOfLatestMessages(channelId)
        .findFirst()
        .orElse(null);
  }

}
