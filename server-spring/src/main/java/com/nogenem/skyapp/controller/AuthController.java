package com.nogenem.skyapp.controller;

import javax.validation.Valid;

import com.nogenem.skyapp.DTO.UserDTO;
import com.nogenem.skyapp.exception.ApiException;
import com.nogenem.skyapp.exception.EmailAlreadyTakenException;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.requestBody.auth.SignUpRequestBody;
import com.nogenem.skyapp.response.auth.SignUpResponse;
import com.nogenem.skyapp.service.AuthService;
import com.nogenem.skyapp.service.TokenService;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

  @PostMapping("/signup")
  @ResponseStatus(HttpStatus.CREATED)
  public SignUpResponse signup(@Valid @RequestBody SignUpRequestBody requestBody)
      throws ApiException {
    User user = null;
    try {
      user = authService.save(requestBody);
    } catch (DuplicateKeyException ex) {
      throw new EmailAlreadyTakenException();
    }

    // TODO: Send confirmation email

    return new SignUpResponse(new UserDTO(user, tokenService.generateToken(user, true)));
  }

}
