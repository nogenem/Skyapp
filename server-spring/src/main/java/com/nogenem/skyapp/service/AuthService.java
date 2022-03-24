package com.nogenem.skyapp.service;

import java.time.Instant;

import com.nogenem.skyapp.enums.UserStatus;
import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;
import com.nogenem.skyapp.requestBody.auth.SignUpRequestBody;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final BCryptPasswordEncoder bCryptPasswordEncoder;
  private final TokenService tokenService;

  public User findByEmail(String email) {
    return this.userRepository.findByEmail(email).orElse(null);
  }

  public User create(SignUpRequestBody requestBody) {
    User user = new User();
    user.setNickname(requestBody.getNickname());
    user.setEmail(requestBody.getEmail());
    user.setPasswordHash(this.bCryptPasswordEncoder.encode(requestBody.getPassword()));
    user.setConfirmed(false);
    user.setConfirmationToken(this.tokenService.generateToken(user, true));
    user.setResetPasswordToken("");
    user.setStatus(UserStatus.ACTIVE);
    user.setThoughts("");
    user.setCreatedAt(Instant.now());
    user.setUpdatedAt(Instant.now());

    return this.userRepository.save(user);
  }

  public boolean isValidPassword(String userPassword, String requestPassword) {
    return this.bCryptPasswordEncoder.matches(requestPassword, userPassword);
  }

  public User findByConfirmationToken(String confirmationToken) {
    return this.userRepository.findByConfirmationToken(confirmationToken).orElse(null);
  }

  public User save(User user) {
    return this.userRepository.save(user);
  }

  public User findById(String id) {
    return this.userRepository.findById(id).orElse(null);
  }

  public User findByResetPasswordToken(String resetPasswordToken) {
    return this.userRepository.findByResetPasswordToken(resetPasswordToken).orElse(null);
  }

  public void updatePasswordHash(User user, String newPassword) {
    user.setPasswordHash(this.bCryptPasswordEncoder.encode(newPassword));
  }
}
