package com.nogenem.skyapp.repository;

import com.nogenem.skyapp.model.User;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

  public User findByEmail(String email);

}
