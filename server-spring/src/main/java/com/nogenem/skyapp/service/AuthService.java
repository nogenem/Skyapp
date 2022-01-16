package com.nogenem.skyapp.service;

import java.time.Instant;
import java.util.Optional;

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

  private UserRepository userRepository;
  private BCryptPasswordEncoder bCryptPasswordEncoder;
  private TokenService tokenService;

  public User findByEmail(String email) {
    return userRepository.findByEmail(email);
  }

  public User save(SignUpRequestBody requestBody) {
    User user = new User();
    user.setNickname(requestBody.getNickname());
    user.setEmail(requestBody.getEmail());
    user.setPasswordHash(bCryptPasswordEncoder.encode(requestBody.getPassword()));
    user.setConfirmed(false);
    user.setConfirmationToken(tokenService.generateToken(user, true));
    user.setResetPasswordToken("");
    user.setStatus(UserStatus.ACTIVE);
    user.setThoughts("");
    user.setCreatedAt(Instant.now());
    user.setUpdatedAt(Instant.now());

    return userRepository.save(user);
  }

  public boolean isValidPassword(String userPassword, String requestPassword) {
    return bCryptPasswordEncoder.matches(requestPassword, userPassword);
  }

  public User findByConfirmationToken(String confirmationToken) {
    return userRepository.findByConfirmationToken(confirmationToken);
  }

  public User update(User user) {
    return userRepository.save(user);
  }

  public User findById(String id) {
    Optional<User> optUser = userRepository.findById(id);
    if (optUser.isPresent()) {
      return optUser.get();
    } else {
      return null;
    }
  }
}
