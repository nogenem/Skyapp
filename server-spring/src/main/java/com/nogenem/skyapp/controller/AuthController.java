package com.nogenem.skyapp.controller;

import javax.validation.Valid;

import com.nogenem.skyapp.DTO.UserDTO;
import com.nogenem.skyapp.exception.EmailAlreadyTakenException;
import com.nogenem.skyapp.exception.TranslatableApiException;
import com.nogenem.skyapp.exception.UnableToSendConfirmationEmailException;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.requestBody.auth.SignUpRequestBody;
import com.nogenem.skyapp.response.auth.SignUpResponse;
import com.nogenem.skyapp.service.AuthService;
import com.nogenem.skyapp.service.MailService;
import com.nogenem.skyapp.service.TokenService;
import com.nogenem.skyapp.utils.Utils;

import org.springframework.dao.DuplicateKeyException;
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
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

  private AuthService authService;
  private TokenService tokenService;
  private MailService mailService;

  @PostMapping("/signup")
  @ResponseStatus(HttpStatus.CREATED)
  public SignUpResponse signup(@Valid @RequestBody SignUpRequestBody requestBody, @RequestHeader HttpHeaders headers)
      throws TranslatableApiException {

    User user = null;
    try {
      // TODO: Find a way to use transaction !?
      user = authService.save(requestBody);
    } catch (DuplicateKeyException ex) {
      throw new EmailAlreadyTakenException();
    }

    try {
      String origin = Utils.getOriginFromHeaders(headers);
      mailService.sendConfirmationEmail(user.getEmail(), user.getConfirmationToken(), origin);
    } catch (Exception e) {
      e.printStackTrace();
      throw new UnableToSendConfirmationEmailException();
    }

    return new SignUpResponse(new UserDTO(user, tokenService.generateToken(user, true)));
  }

}
