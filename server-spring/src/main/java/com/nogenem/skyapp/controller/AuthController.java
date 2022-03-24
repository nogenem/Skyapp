package com.nogenem.skyapp.controller;

import javax.validation.Valid;

import com.nogenem.skyapp.DTO.UserDTO;
import com.nogenem.skyapp.constants.SocketEvents;
import com.nogenem.skyapp.exception.EmailAlreadyTakenException;
import com.nogenem.skyapp.exception.InvalidCredentialsException;
import com.nogenem.skyapp.exception.InvalidOrExpiredTokenException;
import com.nogenem.skyapp.exception.LastEmailSentIsStillValidException;
import com.nogenem.skyapp.exception.NoUserWithSuchEmailException;
import com.nogenem.skyapp.exception.UnableToSendConfirmationEmailException;
import com.nogenem.skyapp.exception.UnableToSendResetPasswordEmailException;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.requestBody.auth.ConfirmationRequestBody;
import com.nogenem.skyapp.requestBody.auth.ForgotPasswordRequestBody;
import com.nogenem.skyapp.requestBody.auth.ResendConfirmationEmailRequestBody;
import com.nogenem.skyapp.requestBody.auth.ResetPasswordRequestBody;
import com.nogenem.skyapp.requestBody.auth.SignInRequestBody;
import com.nogenem.skyapp.requestBody.auth.SignUpRequestBody;
import com.nogenem.skyapp.requestBody.auth.ValidateTokenRequestBody;
import com.nogenem.skyapp.response.auth.ConfirmationResponse;
import com.nogenem.skyapp.response.auth.ForgotPasswordResponse;
import com.nogenem.skyapp.response.auth.ResendConfirmationEmailResponse;
import com.nogenem.skyapp.response.auth.ResetPasswordResponse;
import com.nogenem.skyapp.response.auth.SignInResponse;
import com.nogenem.skyapp.response.auth.SignUpResponse;
import com.nogenem.skyapp.response.auth.ValidateTokenResponse;
import com.nogenem.skyapp.service.AuthService;
import com.nogenem.skyapp.service.MailService;
import com.nogenem.skyapp.service.SocketIoService;
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

  private final AuthService authService;
  private final TokenService tokenService;
  private final MailService mailService;
  private final SocketIoService socketIoService;

  @PostMapping("/signup")
  @ResponseStatus(HttpStatus.CREATED)
  public SignUpResponse signup(@Valid @RequestBody SignUpRequestBody requestBody, @RequestHeader HttpHeaders headers) {

    User user = null;
    try {
      user = this.authService.create(requestBody);
    } catch (DuplicateKeyException ex) {
      throw new EmailAlreadyTakenException();
    }

    try {
      String origin = Utils.getOriginFromHeaders(headers);
      this.mailService.sendConfirmationEmail(user.getEmail(), user.getConfirmationToken(), origin);
    } catch (Exception e) {
      e.printStackTrace();
      throw new UnableToSendConfirmationEmailException();
    }

    return new SignUpResponse(new UserDTO(user, this.tokenService.generateToken(user, true)));
  }

  @PostMapping("/signin")
  public SignInResponse signin(@Valid @RequestBody SignInRequestBody requestBody, @RequestHeader HttpHeaders headers) {

    User user = this.authService.findByEmail(requestBody.getEmail());
    if (user == null || !this.authService.isValidPassword(user.getPasswordHash(), requestBody.getPassword())) {
      throw new InvalidCredentialsException();
    }

    return new SignInResponse(new UserDTO(user, this.tokenService.generateToken(user, !requestBody.isRememberMe())));
  }

  @PostMapping("/confirmation")
  public ConfirmationResponse confirmation(@Valid @RequestBody ConfirmationRequestBody requestBody,
      @RequestHeader HttpHeaders headers) {

    if (!this.tokenService.isValidToken(requestBody.getToken())) {
      throw new InvalidOrExpiredTokenException();
    }

    User user = this.authService.findByConfirmationToken(requestBody.getToken());
    if (user == null) {
      throw new InvalidOrExpiredTokenException();
    }

    user.setConfirmationToken("");
    user.setConfirmed(true);

    user = this.authService.save(user);
    UserDTO userDTO = new UserDTO(user, this.tokenService.generateToken(user, true));

    this.socketIoService.emit(SocketEvents.IO_NEW_USER, userDTO);

    return new ConfirmationResponse(userDTO);
  }

  @PostMapping("/resend_confirmation_email")
  public ResendConfirmationEmailResponse resendConfirmationEmail(
      @Valid @RequestBody ResendConfirmationEmailRequestBody requestBody,
      @RequestHeader HttpHeaders headers) {

    User user = this.authService.findByConfirmationToken(requestBody.getToken());
    if (user == null) {
      throw new InvalidOrExpiredTokenException();
    }

    if (this.tokenService.isValidToken(requestBody.getToken())) {
      throw new LastEmailSentIsStillValidException();
    }

    user.setConfirmationToken(this.tokenService.generateToken(user, true));

    user = this.authService.save(user);

    try {
      String origin = Utils.getOriginFromHeaders(headers);
      this.mailService.sendConfirmationEmail(user.getEmail(), user.getConfirmationToken(), origin);
    } catch (Exception e) {
      e.printStackTrace();
      throw new UnableToSendConfirmationEmailException();
    }

    return new ResendConfirmationEmailResponse();
  }

  @PostMapping("/validate_token")
  public ValidateTokenResponse validateToken(
      @Valid @RequestBody ValidateTokenRequestBody requestBody,
      @RequestHeader HttpHeaders headers) {

    String userId = this.tokenService.getUserIdFromToken(requestBody.getToken());
    if (userId == null || userId.isEmpty()) {
      throw new InvalidOrExpiredTokenException();
    }

    User user = this.authService.findById(userId);
    if (user == null) {
      throw new InvalidOrExpiredTokenException();
    }

    return new ValidateTokenResponse(new UserDTO(user, requestBody.getToken()));
  }

  @PostMapping("/forgot_password")
  public ForgotPasswordResponse forgotPassword(
      @Valid @RequestBody ForgotPasswordRequestBody requestBody,
      @RequestHeader HttpHeaders headers) {

    User user = this.authService.findByEmail(requestBody.getEmail());
    if (user == null) {
      throw new NoUserWithSuchEmailException();
    }

    String resetPasswordToken = user.getResetPasswordToken();
    if (resetPasswordToken != null && !resetPasswordToken.isEmpty()) {
      if (this.tokenService.isValidToken(resetPasswordToken)) {
        throw new LastEmailSentIsStillValidException();
      }
    }

    user.setResetPasswordToken(this.tokenService.generateToken(user, true));

    user = this.authService.save(user);

    try {
      String origin = Utils.getOriginFromHeaders(headers);
      this.mailService.sendResetPasswordEmail(user.getEmail(), user.getResetPasswordToken(), origin);
    } catch (Exception e) {
      e.printStackTrace();
      throw new UnableToSendResetPasswordEmailException();
    }

    return new ForgotPasswordResponse();
  }

  @PostMapping("/reset_password")
  public ResetPasswordResponse resetPassword(
      @Valid @RequestBody ResetPasswordRequestBody requestBody,
      @RequestHeader HttpHeaders headers) {

    if (!this.tokenService.isValidToken(requestBody.getToken())) {
      throw new InvalidOrExpiredTokenException();
    }

    User user = this.authService.findByResetPasswordToken(requestBody.getToken());
    if (user == null) {
      throw new InvalidOrExpiredTokenException();
    }

    this.authService.updatePasswordHash(user, requestBody.getNewPassword());
    user.setResetPasswordToken("");

    user = this.authService.save(user);

    return new ResetPasswordResponse(new UserDTO(user, this.tokenService.generateToken(user, true)));
  }
}
