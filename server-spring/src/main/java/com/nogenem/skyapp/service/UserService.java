package com.nogenem.skyapp.service;

import java.util.List;

import com.nogenem.skyapp.model.User;
import com.nogenem.skyapp.repository.UserRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UserService {

  private final UserRepository userRepository;

  public List<User> findAll() {
    return this.userRepository.findAll();
  }

  public List<User> findUsersNickname(Object[] usersIds) {
    return this.userRepository.findUsersNickname(usersIds);
  }

  public Integer countUsersIn(Object[] usersIds) {
    return this.userRepository.countUsersIn(usersIds);
  }

  public User findById(String id) {
    return this.userRepository.findById(id).orElse(null);
  }

  public User findByEmail(String email) {
    return this.userRepository.findByEmail(email).orElse(null);
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

  public User save(User user) {
    return this.userRepository.save(user);
  }
}
