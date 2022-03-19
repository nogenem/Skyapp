package com.nogenem.skyapp.controller;

import com.nogenem.skyapp.exception.NotMemberOfChannelException;
import com.nogenem.skyapp.exception.TranslatableApiException;
import com.nogenem.skyapp.model.Channel;
import com.nogenem.skyapp.model.Message;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.response.message.PaginatedMessagesResponse;
import com.nogenem.skyapp.service.ChannelService;
import com.nogenem.skyapp.service.MessageService;
import com.nogenem.skyapp.service.UserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/channel")
@AllArgsConstructor
public class MessageController {

  private UserService userService;
  private ChannelService channelService;
  private MessageService messageService;

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
