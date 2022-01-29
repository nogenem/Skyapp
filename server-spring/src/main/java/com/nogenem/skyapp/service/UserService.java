package com.nogenem.skyapp.service;

import java.util.List;
import java.util.Optional;

import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UserService {

  private UserRepository userRepository;

  public List<User> findAll() {
    return userRepository.findAll();
  }

  public User findById(String id) {
    Optional<User> user = userRepository.findById(id);
    if (user.isPresent()) {
      return user.get();
    } else {
      return null;
    }
  }

  public User findByEmail(String email) {
    return userRepository.findByEmail(email);
  }

  public User getLoggedInUser() {
    Object principal = SecurityContextHolder
        .getContext()
        .getAuthentication()
        .getPrincipal();

    if (principal instanceof User) {
      return (User) principal;
    } else {
      return null;
    }
  }
}
