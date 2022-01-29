package com.nogenem.skyapp.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.repository.MessageRepository;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MessageService {

  private MessageRepository messageRepository;

  public List<Message> findAll() {
    return this.messageRepository.findAll();
  }

  public Message save(Message message) {
    return this.messageRepository.save(message);
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

}
