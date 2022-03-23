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
import com.nogenem.skyapp.DTO.ChatMessageDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.constants.ValidationLimits;
import com.nogenem.skyapp.enums.MessageType;
import com.nogenem.skyapp.exception.CantLeaveThisChannelException;
import com.nogenem.skyapp.exception.CantUpdateThisGroupChannelException;
import com.nogenem.skyapp.exception.ChannelAlreadyExistsException;
import com.nogenem.skyapp.exception.GroupHasTooFewMembersException;
import com.nogenem.skyapp.exception.InvalidIdException;
import com.nogenem.skyapp.exception.NotMemberOfChannelException;
import com.nogenem.skyapp.exception.UserIsNotGroupAdmException;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Member;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.requestBody.channel.StoreGroupChannelRequestBody;
import com.nogenem.skyapp.requestBody.channel.StorePrivateChannelRequestBody;
import com.nogenem.skyapp.requestBody.channel.UpdateGroupChannelRequestBody;
import com.nogenem.skyapp.response.channel.ChannelLeaveResponse;
import com.nogenem.skyapp.response.channel.ChannelStoreResponse;
import com.nogenem.skyapp.response.channel.ChannelUpdateResponse;
import com.nogenem.skyapp.service.ChannelService;
import com.nogenem.skyapp.service.MessageService;
import com.nogenem.skyapp.service.SocketIoService;
import com.nogenem.skyapp.service.UserService;
import com.nogenem.skyapp.socketEventData.GroupChannelUpdated;
import com.nogenem.skyapp.socketEventData.MessagesReceived;
import com.nogenem.skyapp.socketEventData.RemovedFromGroupChannel;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
      @RequestHeader HttpHeaders headers) {

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
      @RequestHeader HttpHeaders headers) {

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

  @PatchMapping("/group/{channelId}")
  public ChannelUpdateResponse groupUpdate(@PathVariable("channelId") String channelId,
      @Valid @RequestBody UpdateGroupChannelRequestBody requestBody,
      @RequestHeader HttpHeaders headers) {

    String[] membersIds = requestBody.getMembers();
    String[] adminsIds = requestBody.getAdmins();

    User loggedInUser = userService.getLoggedInUser();
    Instant now = Instant.now();

    Channel channel = channelService.findById(channelId);
    if (channel == null) {
      throw new CantUpdateThisGroupChannelException();
    }

    HashMap<String, Boolean> membersIdsHash = new HashMap<>();
    for (int i = 0; i < membersIds.length; i++) {
      membersIdsHash.put(membersIds[i], true);
    }

    HashMap<String, Boolean> adminsIdsHash = new HashMap<>();
    for (int i = 0; i < adminsIds.length; i++) {
      adminsIdsHash.put(adminsIds[i], true);
    }

    List<Member> members = new ArrayList<>();
    List<String> newMembers = new ArrayList<>();
    List<String> removedMembers = new ArrayList<>();
    List<String> newAdmins = new ArrayList<>();
    List<String> removedAdmins = new ArrayList<>();
    Boolean isCurrentUserAdm = false;

    for (int i = 0; i < channel.getMembers().size(); i += 1) {
      Member member = channel.getMembers().get(i);
      if (loggedInUser.getId().toString().equals(member.getUserId().toString())) {
        members.add(member);
        isCurrentUserAdm = member.getIsAdm();

        membersIdsHash.remove(member.getUserId());
        adminsIdsHash.remove(member.getUserId());
      } else if (membersIdsHash.containsKey(member.getUserId())) {
        Boolean oldIsAdm = member.getIsAdm();
        Boolean newIsAdm = adminsIdsHash.containsKey(member.getUserId());

        if (oldIsAdm != newIsAdm) {
          if (!newIsAdm)
            removedAdmins.add(member.getUserId());
          else
            newAdmins.add(member.getUserId());
        }

        member.setIsAdm(newIsAdm);
        members.add(member);

        membersIdsHash.remove(member.getUserId());
        adminsIdsHash.remove(member.getUserId());
      } else {
        removedMembers.add(member.getUserId());
      }
    }

    if (!isCurrentUserAdm) {
      throw new UserIsNotGroupAdmException();
    }

    for (String userId : membersIdsHash.keySet()) {
      members.add(new Member(userId, adminsIdsHash.containsKey(userId), now));
      newMembers.add(userId);
      if (adminsIdsHash.containsKey(userId)) {
        newAdmins.add(userId);
      }
    }

    Object[] toUpdateMembersIds = members.stream()
        .map(member -> member.getUserId())
        .collect(Collectors.toList())
        .toArray();
    Integer toUpdateMembersCount = userService.countUsersIn(toUpdateMembersIds);
    // PS: - 1 cause of the user that is already updating this group
    if (toUpdateMembersCount == null || (toUpdateMembersCount - 1) < ValidationLimits.MIN_GROUP_CHANNEL_MEMBERS) {
      throw new GroupHasTooFewMembersException(ValidationLimits.MIN_GROUP_CHANNEL_MEMBERS);
    }

    Object[] allMembersIds = Stream.of(newMembers, removedMembers, newAdmins, removedAdmins)
        .flatMap(Collection::stream)
        .collect(Collectors.toList())
        .toArray();
    List<User> membersRecords = userService.getUsersNickname(allMembersIds);

    HashMap<String, String> membersRecordsHash = new HashMap<>();
    for (int i = 0; i < membersRecords.size(); i++) {
      User member = membersRecords.get(i);
      membersRecordsHash.put(member.getId(), member.getNickname());
    }

    List<Message> messages = new ArrayList<>();
    for (String userId : newMembers) {
      Message tmp = new Message();
      tmp.setChannelId(channel.getId());
      tmp.setBody(String.format("%s added %s", loggedInUser.getNickname(), membersRecordsHash.get(userId)));
      tmp.setType(MessageType.TEXT);

      messages.add(tmp);
    }
    for (String userId : removedMembers) {
      Message tmp = new Message();
      tmp.setChannelId(channel.getId());
      tmp.setBody(String.format("%s removed %s", loggedInUser.getNickname(), membersRecordsHash.get(userId)));
      tmp.setType(MessageType.TEXT);

      messages.add(tmp);
    }
    for (String userId : newAdmins) {
      Message tmp = new Message();
      tmp.setChannelId(channel.getId());
      tmp.setBody(String.format("%s is now an Admin", membersRecordsHash.get(userId)));
      tmp.setType(MessageType.TEXT);

      messages.add(tmp);
    }
    for (String userId : removedAdmins) {
      Message tmp = new Message();
      tmp.setChannelId(channel.getId());
      tmp.setBody(String.format("%s is no longer an Admin", membersRecordsHash.get(userId)));
      tmp.setType(MessageType.TEXT);

      messages.add(tmp);
    }

    channel.setName(requestBody.getName());
    channel.setMembers(members);

    channel = channelService.save(channel);
    messages = messageService.saveAll(messages);

    Message lastMessage = messages.get(messages.size() - 1);
    channel.setLastMessage(lastMessage);

    ChatChannelDTO channelDTO = new ChatChannelDTO(channel, null, 0);
    List<ChatMessageDTO> messagesDTOs = messages.stream()
        .map(message -> new ChatMessageDTO(message))
        .collect(Collectors.toList());

    HashMap<String, Integer> unreadMessagesHash = new HashMap<>();
    for (Member member : channel.getMembers()) {
      unreadMessagesHash.put(
          member.getUserId(),
          messageService.countUnreadMessages(channel.getId(), member.getLastSeen()));
    }

    this.socketIoService.emit(SocketEvents.IO_REMOVED_FROM_GROUP_CHANNEL,
        new RemovedFromGroupChannel(channelDTO, removedMembers));
    this.socketIoService.emit(SocketEvents.IO_GROUP_CHANNEL_UPDATED,
        new GroupChannelUpdated(channelDTO, unreadMessagesHash));
    this.socketIoService.emit(SocketEvents.IO_MESSAGES_RECEIVED,
        new MessagesReceived(channelDTO, messagesDTOs));

    return new ChannelUpdateResponse(channel.getId());
  }

  @PostMapping("/group/{channelId}/leave")
  public ChannelLeaveResponse groupLeave(@PathVariable("channelId") String channelId,
      @RequestHeader HttpHeaders headers) {

    User loggedInUser = userService.getLoggedInUser();
    String loggedInUserId = loggedInUser.getId().toString();

    Channel channel = channelService.findById(channelId);
    if (channel == null || !channel.getIsGroup()) {
      throw new CantLeaveThisChannelException();
    }

    Boolean hasOtherAdm = false;
    Member loggedInMember = null;
    Boolean loggedInMemberIsAdm = false;

    for (Member member : channel.getMembers()) {
      if (loggedInMember == null && member.getUserId().toString().equals(loggedInUserId)) {
        loggedInMemberIsAdm = member.getIsAdm();
        loggedInMember = member;
      } else if (member.getIsAdm()) {
        hasOtherAdm = true;
      }
    }

    if (loggedInMember == null) {
      throw new NotMemberOfChannelException();
    }

    channel.getMembers().remove(loggedInMember);

    if (channel.getMembers().size() == 1) {
      ChatChannelDTO channelDTO = new ChatChannelDTO(channel, null, 0);

      // Remove the last member too and delete the channel
      String lastMemberId = channel.getMembers().get(0).getUserId();
      List<String> removedMembers = List.of(loggedInUserId, lastMemberId);

      channelService.delete(channel);

      this.socketIoService.emit(SocketEvents.IO_REMOVED_FROM_GROUP_CHANNEL,
          new RemovedFromGroupChannel(channelDTO, removedMembers));
    } else {
      if (loggedInMemberIsAdm && !hasOtherAdm) {
        for (Member member : channel.getMembers()) {
          member.setIsAdm(true);
        }
      }

      Message message = new Message();
      message.setChannelId(channel.getId());
      message.setBody(String.format("%s left the group", loggedInUser.getNickname()));
      message.setType(MessageType.TEXT);

      message = messageService.save(message);
      channel = channelService.save(channel);

      channel.setLastMessage(message);

      ChatChannelDTO channelDTO = new ChatChannelDTO(channel, null, 0);
      List<String> removedMembers = List.of(loggedInUserId);
      List<ChatMessageDTO> messagesDTOs = List.of(new ChatMessageDTO(message));

      HashMap<String, Integer> unreadMessagesHash = new HashMap<>();
      for (Member member : channel.getMembers()) {
        unreadMessagesHash.put(
            member.getUserId(),
            messageService.countUnreadMessages(channel.getId(), member.getLastSeen()));
      }

      this.socketIoService.emit(SocketEvents.IO_REMOVED_FROM_GROUP_CHANNEL,
          new RemovedFromGroupChannel(channelDTO, removedMembers));
      this.socketIoService.emit(SocketEvents.IO_GROUP_CHANNEL_UPDATED,
          new GroupChannelUpdated(channelDTO, unreadMessagesHash));
      this.socketIoService.emit(SocketEvents.IO_MESSAGES_RECEIVED,
          new MessagesReceived(channelDTO, messagesDTOs));
    }

    return new ChannelLeaveResponse();
  }
}
