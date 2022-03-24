package com.nogenem.skyapp.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.nogenem.skyapp.enums.MessageType;
import com.nogenem.skyapp.model.Attachment;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.MessageRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MessageService {

  private final MessageRepository messageRepository;

  public List<Message> findAll() {
    return this.messageRepository.findAll();
  }

  public Page<Message> findPageByChannelId(String channelId, Pageable paging) {
    return this.messageRepository.findPageByChannelId(channelId, paging);
  }

  public Message findMessageToEdit(String id, String channelId, String fromId, MessageType type) {
    return this.messageRepository.findMessageToEdit(id, channelId, fromId, type.getValue()).orElse(null);
  }

  public Message findMessageToDelete(String id, String channelId, String fromId) {
    return this.messageRepository.findMessageToDelete(id, channelId, fromId).orElse(null);
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

  public Message findLastMessage(String channelId) {
    return this.messageRepository.findStreamOfLatestMessages(channelId)
        .findFirst()
        .orElse(null);
  }

  public List<Message> createNewMembersAndNewAdminsMessages(String channelId, List<User> membersRecords,
      HashMap<String, Boolean> adminsIdsHash, String loggedInUserNickname) {
    List<Message> newMembersMessages = new ArrayList<>();
    List<Message> newAdminsMessages = new ArrayList<>();
    for (User member : membersRecords) {
      Message tmp = new Message();
      tmp.setChannelId(channelId);
      tmp.setBody(String.format("%s added %s", loggedInUserNickname, member.getNickname()));
      tmp.setType(MessageType.TEXT);

      newMembersMessages.add(tmp);

      if (adminsIdsHash.containsKey(member.getId())) {
        tmp = new Message();
        tmp.setChannelId(channelId);
        tmp.setBody(String.format("%s is now an Admin", member.getNickname()));
        tmp.setType(MessageType.TEXT);

        newAdminsMessages.add(tmp);
      }
    }

    List<Message> messages = Stream.of(newMembersMessages, newAdminsMessages)
        .flatMap(Collection::stream)
        .collect(Collectors.toList());

    return this.saveAll(messages);
  }

  public List<Message> createMessagesWithAttachment(String channelId, List<Attachment> attachments,
      String loggedInUserId) {
    List<Message> messages = new ArrayList<>();
    for (Attachment attachment : attachments) {
      Message message = new Message();
      message.setChannelId(channelId);
      message.setFromId(loggedInUserId);
      message.setBody(attachment);
      message.setType(MessageType.UPLOADED_FILE);

      messages.add(message);
    }

    return this.saveAll(messages);
  }

}
