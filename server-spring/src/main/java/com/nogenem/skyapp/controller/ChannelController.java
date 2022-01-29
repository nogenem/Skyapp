package com.nogenem.skyapp.controller;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.validation.Valid;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.constants.ValidationLimits;
import com.nogenem.skyapp.enums.MessageType;
import com.nogenem.skyapp.exception.ChannelAlreadyExistsException;
import com.nogenem.skyapp.exception.GroupHasTooFewMembersException;
import com.nogenem.skyapp.exception.InvalidIdException;
import com.nogenem.skyapp.exception.TranslatableApiException;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Member;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.requestBody.channel.StoreGroupChannelRequestBody;
import com.nogenem.skyapp.requestBody.channel.StorePrivateChannelRequestBody;
import com.nogenem.skyapp.response.channel.ChannelStoreResponse;
import com.nogenem.skyapp.service.ChannelService;
import com.nogenem.skyapp.service.MessageService;
import com.nogenem.skyapp.service.SocketIoService;
import com.nogenem.skyapp.service.UserService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/channel")
@AllArgsConstructor
public class ChannelController {

  private UserService userService;
  private ChannelService channelService;
  private SocketIoService socketIoService;
  private MessageService messageService;

  @PostMapping("/private")
  @ResponseStatus(HttpStatus.CREATED)
  public ChannelStoreResponse privateStore(@Valid @RequestBody StorePrivateChannelRequestBody requestBody,
      @RequestHeader HttpHeaders headers) throws TranslatableApiException {

    String otherUserId = requestBody.getOtherUserId();
    User loggedInUser = userService.getLoggedInUser();

    User otherUser = userService.findById(otherUserId);
    if (otherUser == null) {
      throw new InvalidIdException();
    }

    if (channelService.privateChannelExists(loggedInUser.getId(), otherUserId)) {
      throw new ChannelAlreadyExistsException();
    }

    Instant now = Instant.now();
    List<Member> members = new ArrayList<>();
    members.add(new Member(loggedInUser.getId(), false, now));
    members.add(new Member(otherUserId, false, now));

    Channel channel = new Channel();
    channel.setName("private channel");
    channel.setIsGroup(false);
    channel.setMembers(members);
    channel.setCreatedAt(now);
    channel.setUpdatedAt(now);

    channel = this.channelService.save(channel);

    this.socketIoService.emit(SocketEvents.IO_PRIVATE_CHANNEL_CREATED, new ChatChannelDTO(channel, -1, 0));

    return new ChannelStoreResponse(channel.getId());
  }

  @PostMapping("/group")
  @ResponseStatus(HttpStatus.CREATED)
  public ChannelStoreResponse groupStore(@Valid @RequestBody StoreGroupChannelRequestBody requestBody,
      @RequestHeader HttpHeaders headers) throws TranslatableApiException {

    String[] membersIds = requestBody.getMembers();
    String[] adminsIds = requestBody.getAdmins();

    User loggedInUser = userService.getLoggedInUser();
    Instant now = Instant.now();

    List<User> membersRecords = userService.getUsersNickname(requestBody.getMembers());
    if (membersRecords == null || membersRecords.size() < ValidationLimits.MIN_GROUP_CHANNEL_MEMBERS) {
      throw new GroupHasTooFewMembersException(ValidationLimits.MIN_GROUP_CHANNEL_MEMBERS);
    }

    HashMap<String, Boolean> adminsIdsHash = new HashMap<>();
    for (int i = 0; i < adminsIds.length; i++) {
      adminsIdsHash.put(adminsIds[i], true);
    }

    List<Member> members = new ArrayList<>();
    members.add(new Member(loggedInUser.getId(), true, now));
    for (int i = 0; i < membersIds.length; i++) {
      members.add(new Member(membersIds[i], adminsIdsHash.containsKey(membersIds[i]), now));
    }

    Channel channel = new Channel();
    channel.setName(requestBody.getName());
    channel.setIsGroup(true);
    channel.setMembers(members);
    channel.setCreatedAt(now);
    channel.setUpdatedAt(now);

    channel = this.channelService.save(channel);

    List<Message> newMembersMessages = new ArrayList<>();
    List<Message> newAdminsMessages = new ArrayList<>();
    for (User member : membersRecords) {
      Message tmp = new Message();
      tmp.setChannelId(channel.getId());
      tmp.setBody(String.format("%s added %s", loggedInUser.getNickname(), member.getNickname()));
      tmp.setType(MessageType.TEXT);

      newMembersMessages.add(tmp);

      if (adminsIdsHash.containsKey(member.getId())) {
        tmp = new Message();
        tmp.setChannelId(channel.getId());
        tmp.setBody(String.format("%s is now an Admin", member.getNickname()));
        tmp.setType(MessageType.TEXT);

        newAdminsMessages.add(tmp);
      }
    }

    List<Message> messages = Stream.of(newMembersMessages, newAdminsMessages)
        .flatMap(Collection::stream)
        .collect(Collectors.toList());
    messages = messageService.saveAll(messages);

    Message lastMessage = messages.get(messages.size() - 1);
    channel.setLastMessage(lastMessage);

    this.socketIoService.emit(SocketEvents.IO_GROUP_CHANNEL_CREATED,
        new ChatChannelDTO(channel, null, messages.size()));

    return new ChannelStoreResponse(channel.getId());
  }
}
