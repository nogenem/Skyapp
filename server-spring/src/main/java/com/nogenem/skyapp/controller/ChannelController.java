package com.nogenem.skyapp.controller;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;

import com.nogenem.skyapp.DTO.ChatChannelDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.exception.ChannelAlreadyExistsException;
import com.nogenem.skyapp.exception.InvalidIdException;
import com.nogenem.skyapp.exception.TranslatableApiException;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Member;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.requestBody.channel.StorePrivateChannelRequestBody;
import com.nogenem.skyapp.response.channel.PrivateStoreResponse;
import com.nogenem.skyapp.service.ChannelService;
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

  @PostMapping("/private")
  @ResponseStatus(HttpStatus.CREATED)
  public PrivateStoreResponse privateStore(@Valid @RequestBody StorePrivateChannelRequestBody requestBody,
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

    return new PrivateStoreResponse(channel.getId());
  }

}
