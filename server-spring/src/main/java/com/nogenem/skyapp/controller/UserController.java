package com.nogenem.skyapp.controller;

import javax.validation.Valid;

import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.exception.TranslatableApiException;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.requestBody.user.UpdateStatusRequestBody;
import com.nogenem.skyapp.response.user.StatusUpdateResponse;
import com.nogenem.skyapp.service.SocketIoService;
import com.nogenem.skyapp.service.UserService;
import com.nogenem.skyapp.socketEventData.UserStatusChanged;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/user")
@AllArgsConstructor
public class UserController {

  private UserService userService;
  private SocketIoService socketIoService;

  @PatchMapping("/status")
  public StatusUpdateResponse statusUpdate(
      @Valid @RequestBody UpdateStatusRequestBody requestBody,
      @RequestHeader HttpHeaders headers) throws TranslatableApiException {

    User loggedInUser = userService.getLoggedInUser();
    UserStatus newStatus = requestBody.getNewStatus();

    if(loggedInUser.getStatus() == newStatus) {
      throw new ResponseStatusException(HttpStatus.NOT_MODIFIED);
    }

    loggedInUser.setStatus(newStatus);

    loggedInUser = this.userService.save(loggedInUser);

    this.socketIoService.emit(SocketEvents.IO_USER_STATUS_CHANGED,
        new UserStatusChanged(loggedInUser.getId(), newStatus));

    return new StatusUpdateResponse();
  }

}
